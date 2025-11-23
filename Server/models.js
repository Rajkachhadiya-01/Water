// Server/models.js
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not set in .env");
}

// Connect once when this file is imported
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const { Schema } = mongoose;

/* ========== SCHEMAS ========== */

// USERS
const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "driver", "customer"], required: true },
    lastLat: Number,
    lastLng: Number,
  },
  { timestamps: true }
);

// ROUTES
const routeSchema = new Schema(
  {
    name: { type: String, required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// CUSTOMERS
const customerSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    balance: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    routeId: { type: Schema.Types.ObjectId, ref: "Route", default: null },
  },
  { timestamps: true }
);

// INVENTORY
const bottleSchema = new Schema(
  {
    kind: String,
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const jagSchema = new Schema(
  {
    kind: String,
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// DELIVERY
const deliverySchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    bottles: { type: Number, default: 1 },
    routeId: { type: Schema.Types.ObjectId, ref: "Route" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// PAYMENTS
const paymentSchema = new Schema(
  {
    amount: Number,
    method: String,
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

// COMPLAINTS
const complaintSchema = new Schema(
  {
    message: String,
    status: { type: String, default: "open" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

/* ========== MODELS ========== */
const User = mongoose.model("User", userSchema);
const Route = mongoose.model("Route", routeSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Bottle = mongoose.model("Bottle", bottleSchema);
const Jag = mongoose.model("Jag", jagSchema);
const Delivery = mongoose.model("Delivery", deliverySchema);
const Payment = mongoose.model("Payment", paymentSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = {
  mongoose,
  User,
  Route,
  Customer,
  Bottle,
  Jag,
  Delivery,
  Payment,
  Complaint,
};