require("../src/config/env");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

const WHOLESALER_NAME = process.env.WHOLESALER_NAME || "Main Wholesaler";
const WHOLESALER_EMAIL = process.env.WHOLESALER_EMAIL || "wholesaler@smartpharmacy.local";
const WHOLESALER_PASSWORD = process.env.WHOLESALER_PASSWORD || "Wholesaler@123";

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Check backend/.env configuration.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Normalize any legacy admin records to wholesaler.
  await User.updateMany({ role: "admin" }, { $set: { role: "wholesaler" } });

  let primary = await User.findOne({ email: WHOLESALER_EMAIL });
  if (!primary) {
    primary = await User.findOne({ role: "wholesaler" });
  }

  const hashedPassword = await bcrypt.hash(WHOLESALER_PASSWORD, 10);

  if (!primary) {
    primary = await User.create({
      name: WHOLESALER_NAME,
      email: WHOLESALER_EMAIL,
      password: hashedPassword,
      role: "wholesaler",
    });
  } else {
    primary.name = WHOLESALER_NAME;
    primary.email = WHOLESALER_EMAIL;
    primary.password = hashedPassword;
    primary.role = "wholesaler";
    await primary.save();
  }

  await User.deleteMany({ _id: { $ne: primary._id }, role: "wholesaler" });
  await User.syncIndexes();

  const wholesalerCount = await User.countDocuments({ role: "wholesaler" });
  const sellerCount = await User.countDocuments({ role: "seller" });

  console.log(
    JSON.stringify(
      {
        wholesalerCount,
        sellerCount,
        credentials: {
          email: WHOLESALER_EMAIL,
          password: WHOLESALER_PASSWORD,
        },
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Failed to setup wholesaler:", error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // no-op
  }
  process.exit(1);
});
