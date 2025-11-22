// Server/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
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
const { generateToken, authMiddleware, roleGuard } = require("./api/auth");

const app = express();

/* ----------------------------------------------
   CORS
---------------------------------------------- */
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
      return ok ? callback(null, true) : callback(new Error("CORS Not Allowed"), false);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.options("*", cors());
app.use(bodyParser.json());

/* ----------------------------------------------
   SMALL HELPERS
---------------------------------------------- */
const toId = (doc) => (doc && doc._id ? doc._id.toString() : null);

/* ----------------------------------------------
   HEALTH
---------------------------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* ----------------------------------------------
   LOGIN
---------------------------------------------- */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email & Password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = await generateToken(user);

    res.json({
      token,
      user: {
        id: toId(user),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ----------------------------------------------
   ADMIN DASHBOARD
   (shape matches what React expects)
---------------------------------------------- */
app.get("/api/admin/dashboard", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const [routesRaw, customersRaw, driversRaw, bottlesRaw, jagsRaw, remindersRaw] =
      await Promise.all([
        Route.find().populate("driverId", "name email role"),
        Customer.find(),
        User.find({ role: "driver" }),
        Bottle.find(),
        Jag.find(),
        Customer.find({ balance: { $gt: 0 } }),
      ]);

    const routes = routesRaw.map((r) => ({
      id: toId(r),
      name: r.name,
      driverId: r.driverId ? toId(r.driverId) : null,
      driver: r.driverId
        ? {
            id: toId(r.driverId),
            name: r.driverId.name,
            email: r.driverId.email,
          }
        : null,
    }));

    const customers = customersRaw.map((c) => ({
      id: toId(c),
      name: c.name,
      email: c.email,
      phone: c.phone,
      balance: c.balance,
      deposit: c.deposit,
      routeId: c.routeId ? c.routeId.toString() : null,
    }));

    const drivers = driversRaw.map((d) => ({
      id: toId(d),
      name: d.name,
      email: d.email,
      role: d.role,
    }));

    const bottles = bottlesRaw.map((b) => ({
      id: toId(b),
      kind: b.kind,
      quantity: b.quantity,
    }));

    const jags = jagsRaw.map((j) => ({
      id: toId(j),
      kind: j.kind,
      quantity: j.quantity,
    }));

    const reminders = remindersRaw.map((c) => ({
      id: toId(c),
      name: c.name,
      email: c.email,
      balance: c.balance,
    }));

    res.json({ routes, customers, drivers, bottles, jags, reminders });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ error: "Dashboard load failed" });
  }
});

/* ----------------------------------------------
   ADMIN: ROUTES CRUD
---------------------------------------------- */
app.post("/api/admin/routes", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const { name, driverId } = req.body;
    const r = await Route.create({ name, driverId: driverId || null });
    res.json({
      id: toId(r),
      name: r.name,
      driverId: r.driverId ? r.driverId.toString() : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/routes/:id", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Route.findById(id);
    if (!r) return res.status(404).json({ error: "Route not found" });

    const { name, driverId } = req.body;
    if (name !== undefined) r.name = name;
    r.driverId = driverId || null;
    await r.save();

    res.json({
      id: toId(r),
      name: r.name,
      driverId: r.driverId ? r.driverId.toString() : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/routes/:id", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Route.findById(id);
    if (!r) return res.status(404).json({ error: "Route not found" });

    await Customer.updateMany({ routeId: id }, { $set: { routeId: null } });
    await r.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------------
   ADMIN: CUSTOMERS CRUD
---------------------------------------------- */
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
      res.json({
        id: toId(c),
        name: c.name,
        email: c.email,
        phone: c.phone,
        balance: c.balance,
        deposit: c.deposit,
        routeId: c.routeId ? c.routeId.toString() : null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/admin/customers/:id",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const c = await Customer.findById(id);
      if (!c) return res.status(404).json({ error: "Customer not found" });

      const { name, email, phone, routeId, balance, deposit } = req.body;

      if (name !== undefined) c.name = name;
      if (email !== undefined) c.email = email;
      if (phone !== undefined) c.phone = phone;
      if (routeId !== undefined) c.routeId = routeId || null;
      if (balance !== undefined) c.balance = Number(balance);
      if (deposit !== undefined) c.deposit = Number(deposit);

      await c.save();

      res.json({
        id: toId(c),
        name: c.name,
        email: c.email,
        phone: c.phone,
        balance: c.balance,
        deposit: c.deposit,
        routeId: c.routeId ? c.routeId.toString() : null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  "/api/admin/customers/:id",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const c = await Customer.findById(id);
      if (!c) return res.status(404).json({ error: "Customer not found" });

      await Promise.all([
        Payment.deleteMany({ customerId: id }),
        Delivery.deleteMany({ customerId: id }),
        Complaint.deleteMany({ customerId: id }),
      ]);

      await c.deleteOne();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ----------------------------------------------
   ADMIN: DRIVERS CRUD
---------------------------------------------- */
app.post("/api/admin/drivers", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password || "driverpass", 10);
    const d = await User.create({
      name,
      email,
      passwordHash: hash,
      role: "driver",
    });
    res.json({
      id: toId(d),
      name: d.name,
      email: d.email,
      role: d.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/drivers/:id", authMiddleware, roleGuard("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const d = await User.findById(id);
    if (!d || d.role !== "driver") {
      return res.status(404).json({ error: "Driver not found" });
    }

    const { name, email, password } = req.body;
    if (name !== undefined) d.name = name;
    if (email !== undefined) d.email = email;
    if (password) {
      d.passwordHash = await bcrypt.hash(password, 10);
    }

    await d.save();
    res.json({
      id: toId(d),
      name: d.name,
      email: d.email,
      role: d.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete(
  "/api/admin/drivers/:id",
  authMiddleware,
  roleGuard("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const d = await User.findById(id);
      if (!d || d.role !== "driver") {
        return res.status(404).json({ error: "Driver not found" });
      }

      await Route.updateMany({ driverId: id }, { $set: { driverId: null } });
      await d.deleteOne();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ----------------------------------------------
   DRIVER DASHBOARD
   (match existing React expectations)
---------------------------------------------- */
app.get("/api/driver/dashboard", authMiddleware, roleGuard("driver"), async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    const routeDoc = await Route.findOne({ driverId: driver._id });
    let route = null;
    if (routeDoc) {
      const customers = await Customer.find({ routeId: routeDoc._id });
      route = {
        id: toId(routeDoc),
        name: routeDoc.name,
        // NOTE: React expects "Customers" (capital C)
        Customers: customers.map((c) => ({
          id: toId(c),
          name: c.name,
          phone: c.phone,
          balance: c.balance,
        })),
      };
    }

    const deliveriesRaw = await Delivery.find({ driverId: driver._id }).sort({
      date: -1,
    });

    const deliveries = deliveriesRaw.map((d) => ({
      id: toId(d),
      date: d.date ? d.date.toISOString().slice(0, 10) : null,
      delivered: d.delivered,
      bottles: d.bottles,
      customerId: d.customerId ? d.customerId.toString() : null,
    }));

    res.json({ route, deliveries, driver: { id: toId(driver), name: driver.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------------
   CUSTOMER DASHBOARD
---------------------------------------------- */
app.get(
  "/api/customer/dashboard",
  authMiddleware,
  roleGuard("customer"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const custDoc = await Customer.findOne({ email: user.email });
      if (!custDoc) {
        return res.json({ cust: null, payments: [], deliveries: [], complaints: [] });
      }

      const [paymentsRaw, deliveriesRaw, complaintsRaw] = await Promise.all([
        Payment.find({ customerId: custDoc._id }).sort({ createdAt: -1 }),
        Delivery.find({ customerId: custDoc._id }).sort({ date: -1 }),
        Complaint.find({ customerId: custDoc._id }).sort({ createdAt: -1 }),
      ]);

      const cust = {
        id: toId(custDoc),
        name: custDoc.name,
        email: custDoc.email,
        phone: custDoc.phone,
        balance: custDoc.balance,
        deposit: custDoc.deposit,
      };

      const payments = paymentsRaw.map((p) => ({
        id: toId(p),
        amount: p.amount,
        method: p.method,
        createdAt: p.createdAt,
      }));

      const deliveries = deliveriesRaw.map((d) => ({
        id: toId(d),
        date: d.date ? d.date.toISOString().slice(0, 10) : null,
        delivered: d.delivered,
        bottles: d.bottles,
      }));

      const complaints = complaintsRaw.map((c) => ({
        id: toId(c),
        message: c.message,
        status: c.status,
        createdAt: c.createdAt,
      }));

      res.json({ cust, payments, deliveries, complaints });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ----------------------------------------------
   START SERVER (after Mongo is ready)
---------------------------------------------- */
mongoose.connection.once("open", () => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});