const Order = require("../models/Order");
const Medicine = require("../models/Medicine");

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      sellerId: req.user._id,
      wholesalerId: { $ne: null },
    })
      .populate("medicineId", "name salt supplierEmail")
      .populate("wholesalerId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

const getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ wholesalerId: null }, { wholesalerId: req.user._id }],
    })
      .populate("medicineId", "name salt supplierEmail")
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching incoming orders",
      error: error.message,
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: `Only pending orders can be accepted. Current status: ${order.status}`,
      });
    }

    if (order.wholesalerId && String(order.wholesalerId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "This order is assigned to another wholesaler",
      });
    }

    order.wholesalerId = req.user._id;

    const medicine = await Medicine.findOne({
      _id: order.medicineId,
      sellerId: order.sellerId,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Seller medicine not found for this order",
      });
    }

    // Update quantity for this specific medicine record when order is accepted.
    medicine.stock += order.quantity;
    medicine.approvalStatus = "active";
    await medicine.save();

    order.status = "accepted";
    await order.save();

    return res.status(200).json({
      message: "Order accepted and medicine quantity updated",
      order,
      medicine,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while accepting order",
      error: error.message,
    });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        message: `Only accepted orders can be delivered. Current status: ${order.status}`,
      });
    }

    if (order.wholesalerId && String(order.wholesalerId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "This order is assigned to another wholesaler",
      });
    }

    order.status = "delivered";
    await order.save();

    return res.status(200).json({
      message: "Order delivered successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while delivering order",
      error: error.message,
    });
  }
};

module.exports = {
  getMyOrders,
  getIncomingOrders,
  acceptOrder,
  deliverOrder,
};
