// server/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const {
  sequelize,
  User,
  Route,
  Customer,
  Bottle,
  Jag,
  Delivery,
  Payment,
  Complaint,
} = require("./models");

const {
  generateToken,
  authMiddleware,
  roleGuard
} = require("./api/auth");

const app = express();

/* ---------------------------------------------------------
   FIXED CORS (NO DUPLICATES, NO BROKEN CALLBACK)
------------------------------------------------------------ */
const allowedOrigins = [
  "http://localhost:5173",
  "https://water-client-tau.vercel.app",
  "https://water-x75b.onrender.com",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const ok = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      return ok
        ? callback(null, true)
        : callback(new Error("CORS Not Allowed"), false);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Fix OPTIONS preflight
app.options("*", cors());

app.use(bodyParser.json());

/* ---------------------------------------------------------
   HEALTH CHECK
------------------------------------------------------------ */
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* ---------------------------------------------------------
   LOGIN
------------------------------------------------------------ */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "Email & Password required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = await generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/* ---------------------------------------------------------
   ADMIN DASHBOARD
------------------------------------------------------------ */
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const routes = await Route.findAll({
        include: [{ model: User, as: "driver" }],
      });

      const customers = await Customer.findAll();
      const drivers = await User.findAll({ where: { role: "driver" } });
      const bottles = await Bottle.findAll();
      const jags = await Jag.findAll();

      const reminders = await Customer.findAll({
        where: { balance: { [Op.gt]: 0 } },
      });

      res.json({
        routes,
        customers,
        drivers,
        bottles,
        jags,
        reminders,
      });
    } catch (err) {
      console.error("Admin Dashboard Error:", err);
      return res.status(500).json({ error: "Dashboard load failed" });
    }
  }
);

/* ---------------------------------------------------------
   ROUTES CRUD
------------------------------------------------------------ */
app.post(
  "/api/admin/routes",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { name, driverId } = req.body;
      const r = await Route.create({ name, driverId: driverId || null });
      res.json(r);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/admin/routes/:id",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const r = await Route.findByPk(req.params.id);
      if (!r) return res.status(404).json({ error: "Route not found" });

      r.name = req.body.name ?? r.name;
      r.driverId = req.body.driverId || null;
      await r.save();
      res.json(r);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------------------------
   CUSTOMERS CRUD
------------------------------------------------------------ */
app.post(
  "/api/admin/customers",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { name, email, phone, routeId } = req.body;
      const c = await Customer.create({
        name,
        email,
        phone,
        routeId: routeId || null,
      });
      res.json(c);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------------------------
   DRIVERS CRUD
------------------------------------------------------------ */
app.post(
  "/api/admin/drivers",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const hash = await bcrypt.hash(password || "driverpass", 10);
      const d = await User.create({
        name,
        email,
        passwordHash: hash,
        role: "driver",
      });
      res.json(d);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------------------------
   DRIVER DASHBOARD
------------------------------------------------------------ */
app.get(
  "/api/driver/dashboard",
  authMiddleware,
  roleGuard("driver"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      const route = await Route.findOne({
        where: { driverId: user.id },
        include: [Customer],
      });
      const deliveries = await Delivery.findAll({
        where: { driverId: user.id },
        order: [["date", "DESC"]],
      });
      res.json({ route, deliveries, driver: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------------------------
   CUSTOMER DASHBOARD
------------------------------------------------------------ */
app.get(
  "/api/customer/dashboard",
  authMiddleware,
  roleGuard("customer"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      const cust = await Customer.findOne({
        where: { email: user.email },
      });

      const payments = await Payment.findAll({
        where: { customerId: cust?.id },
        order: [["createdAt", "DESC"]],
      });

      const deliveries = await Delivery.findAll({
        where: { customerId: cust?.id },
        order: [["date", "DESC"]],
      });

      const complaints = await Complaint.findAll({
        where: { customerId: cust?.id },
        order: [["createdAt", "DESC"]],
      });

      res.json({ cust, payments, deliveries, complaints });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------------------------
   START SERVER
------------------------------------------------------------ */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ SERVER START FAILED:", err);
    process.exit(1);
  }
})();
