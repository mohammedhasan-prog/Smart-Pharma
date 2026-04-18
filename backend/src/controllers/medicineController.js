const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const User = require("../models/User");

const DEFAULT_REORDER_LEVEL = 20;

const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffInMs = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 30) {
    return { daysLeft, status: "red" };
  }

  if (daysLeft < 90) {
    return { daysLeft, status: "yellow" };
  }

  return { daysLeft, status: "normal" };
};

const createMedicine = async (req, res) => {
  try {
    const { name, salt, stock, reorderLevel, expiryDate } = req.body;

    if (
      !name ||
      !salt ||
      stock === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "Name, salt, stock, and expiryDate are required",
      });
    }

    const requestedStock = Number(stock);
    if (!Number.isFinite(requestedStock) || requestedStock <= 0) {
      return res.status(400).json({
        message: "Initial stock request must be greater than 0",
      });
    }

    const resolvedReorderLevel =
      reorderLevel === undefined || reorderLevel === null || reorderLevel === ""
        ? DEFAULT_REORDER_LEVEL
        : Number(reorderLevel);

    if (!Number.isFinite(resolvedReorderLevel) || resolvedReorderLevel < 0) {
      return res.status(400).json({
        message: "reorderLevel must be a non-negative number",
      });
    }

    const wholesaler = await User.findOne({ role: "wholesaler" });
    if (!wholesaler) {
      return res.status(400).json({
        message: "No wholesaler account found to approve medicine purchase",
      });
    }

    const medicine = await Medicine.create({
      name,
      salt,
      stock: 0,
      reorderLevel: resolvedReorderLevel,
      expiryDate,
      supplierEmail: wholesaler.email,
      sellerId: req.user._id,
      approvalStatus: "pending_approval",
    });

    const order = await Order.create({
      medicineId: medicine._id,
      quantity: requestedStock,
      sellerId: req.user._id,
      wholesalerId: wholesaler._id,
      status: "pending",
      orderType: "initial_purchase",
    });

    return res.status(201).json({
      message: "Medicine request created and sent for wholesaler approval",
      medicine,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating medicine",
      error: error.message,
    });
  }
};

const getMedicines = async (req, res) => {
  try {
    const query = {
      sellerId: req.user._id,
    };

    const medicines = await Medicine.find(query).sort({ createdAt: -1 }).lean();

    const response = medicines.map((medicine) => ({
      ...medicine,
      expiry: getExpiryStatus(medicine.expiryDate),
    }));

    return res.status(200).json({ medicines: response });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching medicines",
      error: error.message,
    });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      sellerId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const allowedFields = ["name", "salt", "reorderLevel"];

    const hasAnyAllowedField = allowedFields.some((field) => req.body[field] !== undefined);
    if (!hasAnyAllowedField) {
      return res.status(400).json({
        message: "Only name, salt, and reorderLevel can be updated",
      });
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        medicine[field] = req.body[field];
      }
    });

    await medicine.save();

    return res.status(200).json({
      message: "Medicine updated successfully",
      medicine,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating medicine",
      error: error.message,
    });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const deleted = await Medicine.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting medicine",
      error: error.message,
    });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
  getExpiryStatus,
};
