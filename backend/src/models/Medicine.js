const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    salt: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 20,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    supplierEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending_approval", "active"],
      default: "active",
    },
    salesHistory: [
      {
        soldAt: {
          type: Date,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Medicine", medicineSchema);
