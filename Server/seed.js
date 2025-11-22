// Server/seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  mongoose,
  User,
  Route,
  Customer,
  Bottle,
  Jag,
  Delivery,
  Payment,
  Complaint,
} = require("./models");

async function seed() {
  try {
    console.log("🔄 Dropping database...");
    await mongoose.connection.dropDatabase();

    const adminHash = await bcrypt.hash("adminpass", 10);
    const driverHash = await bcrypt.hash("driverpass", 10);
    const custHash = await bcrypt.hash("customerpass", 10);

    console.log("👤 Creating users...");
    const admin = await User.create({
      name: "Admin Owner",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: "admin",
    });

    const driver = await User.create({
      name: "Route Driver",
      email: "driver@example.com",
      passwordHash: driverHash,
      role: "driver",
    });

    const userCust = await User.create({
      name: "Customer User",
      email: "customer@example.com",
      passwordHash: custHash,
      role: "customer",
    });

    console.log("📍 Creating route...");
    const r = await Route.create({
      name: "Route A",
      driverId: driver._id,
    });

    console.log("👥 Creating customers...");
    const c1 = await Customer.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "9999999999",
      routeId: r._id,
      balance: 100,
    });

    const c2 = await Customer.create({
      name: "Jane Roe",
      email: "jane@example.com",
      phone: "8888888888",
      routeId: r._id,
      balance: 0,
    });

    console.log("🥤 Adding inventory...");
    await Bottle.create({ kind: "20L", quantity: 50 });
    await Jag.create({ kind: "small", quantity: 100 });

    console.log("🚚 Creating delivery...");
    await Delivery.create({
      routeId: r._id,
      customerId: c1._id,
      driverId: driver._id,
      delivered: false,
      bottles: 1,
    });

    console.log("💳 Adding payments...");
    await Payment.create({
      customerId: c1._id,
      amount: 100,
      method: "cash",
    });

    console.log("📢 Adding complaint...");
    await Complaint.create({
      customerId: c2._id,
      message: "Water delivery delay",
    });

    console.log("✅ Seed completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ SEED FAILED:", err);
    process.exit(1);
  }
}

// Wait for mongoose connect (models.js already calls connect)
mongoose.connection.once("open", () => {
  seed();
});