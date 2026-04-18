const nodemailer = require("nodemailer");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const User = require("../models/User");

const DEFAULT_REORDER_LEVEL = 20;
const REORDER_COVERAGE_DAYS = 5;
const SALES_LOOKBACK_DAYS = 90;

const startOfLookbackWindow = () => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - SALES_LOOKBACK_DAYS);
  return threshold;
};

const calculateDynamicReorderLevel = (salesHistory = []) => {
  const thresholdDate = startOfLookbackWindow();
  const recentSales = salesHistory.filter((entry) => new Date(entry.soldAt) >= thresholdDate);

  if (recentSales.length === 0) {
    return {
      reorderLevel: DEFAULT_REORDER_LEVEL,
      averageDailySales: 0,
      totalSoldInWindow: 0,
      salesLookbackDays: SALES_LOOKBACK_DAYS,
      coverageDays: REORDER_COVERAGE_DAYS,
    };
  }

  const totalSoldInWindow = recentSales.reduce(
    (sum, entry) => sum + Number(entry.quantity || 0),
    0
  );
  const averageDailySales = totalSoldInWindow / SALES_LOOKBACK_DAYS;
  // Keep a practical floor so low historical sales do not suppress safety alerts.
  const reorderLevel = Math.max(
    DEFAULT_REORDER_LEVEL,
    Math.ceil(averageDailySales * REORDER_COVERAGE_DAYS)
  );

  return {
    reorderLevel,
    averageDailySales,
    totalSoldInWindow,
    salesLookbackDays: SALES_LOOKBACK_DAYS,
    coverageDays: REORDER_COVERAGE_DAYS,
  };
};

const sendLowStockEmail = async ({ to, medicineName, currentStock, reorderLevel, quantity }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { sent: false, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Low stock alert: ${medicineName}`,
    text: `Stock for ${medicineName} is below reorder level. Current stock: ${currentStock}, reorder level: ${reorderLevel}. Please restock ${quantity} units.`,
  });

  return { sent: true };
};

const sellMedicine = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    const sellQty = Number(quantity);

    if (!medicineId || !quantity) {
      return res.status(400).json({
        message: "medicineId and quantity are required",
      });
    }

    if (!Number.isFinite(sellQty) || sellQty <= 0) {
      return res.status(400).json({
        message: "quantity must be greater than 0",
      });
    }

    const medicine = await Medicine.findOne({
      _id: medicineId,
      sellerId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    if (medicine.approvalStatus !== "active") {
      return res.status(400).json({
        message: "Medicine is pending wholesaler approval and cannot be sold yet",
      });
    }

    if (medicine.stock < sellQty) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    const projectedStock = medicine.stock - sellQty;

    const thresholdDate = startOfLookbackWindow();
    const existingSalesHistory = Array.isArray(medicine.salesHistory)
      ? medicine.salesHistory
      : [];

    medicine.salesHistory = existingSalesHistory
      .filter((entry) => new Date(entry.soldAt) >= thresholdDate)
      .concat([{ soldAt: new Date(), quantity: sellQty }]);

    const thresholdDetails = calculateDynamicReorderLevel(medicine.salesHistory);
    medicine.reorderLevel = thresholdDetails.reorderLevel;

    let wholesalerUser = null;
    if (projectedStock < medicine.reorderLevel) {
      wholesalerUser = await User.findOne({ role: "wholesaler" });
      if (!wholesalerUser) {
        return res.status(400).json({
          message: "No wholesaler account found to place reorder",
        });
      }
    }

    medicine.stock = projectedStock;
    await medicine.save();

    let order = null;
    let emailNotification = { sent: false, reason: "Stock above reorder level" };

    if (medicine.stock < medicine.reorderLevel) {
      const reorderQuantity = 100;
      const recipientEmail =
        wholesalerUser?.email || process.env.WHOLESALER_EMAIL || medicine.supplierEmail;

      order = await Order.create({
        medicineId: medicine._id,
        quantity: reorderQuantity,
        sellerId: req.user._id,
        wholesalerId: wholesalerUser._id,
        status: "pending",
        orderType: "reorder",
      });

      try {
        if (!recipientEmail) {
          emailNotification = { sent: false, reason: "No wholesaler email configured" };
        } else {
          emailNotification = await sendLowStockEmail({
            to: recipientEmail,
            medicineName: medicine.name,
            currentStock: medicine.stock,
            reorderLevel: medicine.reorderLevel,
            quantity: reorderQuantity,
          });
        }
      } catch (mailError) {
        emailNotification = { sent: false, reason: mailError.message };
      }
    }

    return res.status(200).json({
      message: "Medicine sold successfully",
      medicine,
      thresholdDetails,
      autoOrderCreated: Boolean(order),
      order,
      emailNotification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while selling medicine",
      error: error.message,
    });
  }
};

module.exports = {
  sellMedicine,
};
