const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["seller", "wholesaler"],
      default: "seller",
    },
  },
  {
    timestamps: true,
  }
);

// Enforce only one wholesaler account.
userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "wholesaler" },
  }
);

module.exports = mongoose.model("User", userSchema);
