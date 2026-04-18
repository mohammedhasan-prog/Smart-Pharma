const User = require("../models/User");
const Order = require("../models/Order");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email role createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("name email createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total: sellers.length,
      sellers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching sellers",
      error: error.message,
    });
  }
};

const getSoldMedicinesBySeller = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({
      wholesalerId: req.user._id,
      status: "delivered",
    })
      .populate("sellerId", "name email")
      .populate("medicineId", "name salt reorderLevel expiryDate supplierEmail")
      .sort({ updatedAt: -1 })
      .lean();

    const grouped = new Map();

    for (const order of deliveredOrders) {
      if (!order.sellerId || !order.medicineId) {
        continue;
      }

      const sellerKey = String(order.sellerId._id);
      if (!grouped.has(sellerKey)) {
        grouped.set(sellerKey, {
          seller: {
            id: order.sellerId._id,
            name: order.sellerId.name,
            email: order.sellerId.email,
          },
          totalDeliveredOrders: 0,
          totalDeliveredQuantity: 0,
          medicines: [],
        });
      }

      const bucket = grouped.get(sellerKey);
      bucket.totalDeliveredOrders += 1;
      bucket.totalDeliveredQuantity += order.quantity;
      bucket.medicines.push({
        orderId: order._id,
        orderType: order.orderType,
        quantity: order.quantity,
        status: order.status,
        approvedAt: order.updatedAt,
        medicine: {
          id: order.medicineId._id,
          name: order.medicineId.name,
          salt: order.medicineId.salt,
          reorderLevel: order.medicineId.reorderLevel,
          expiryDate: order.medicineId.expiryDate,
          supplierEmail: order.medicineId.supplierEmail,
        },
      });
    }

    const sellerWiseSales = Array.from(grouped.values());

    return res.status(200).json({
      totalDeliveredOrders: deliveredOrders.length,
      totalSellers: sellerWiseSales.length,
      sellerWiseSales,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching sold medicines",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getAllSellers,
  getSoldMedicinesBySeller,
};
