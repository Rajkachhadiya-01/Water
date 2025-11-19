// Server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sequelize, User, Route, Customer, Bottle, Jag, Delivery, Payment, Complaint } = require('./models');
const { generateToken, authMiddleware, roleGuard } = require('./api/auth');
const { Op } = require("sequelize");


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Auth: login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const u = await User.findOne({ where: { email } });
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = await generateToken(u);
  res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
});

// Protected routes examples (unchanged)
app.get('/api/admin/dashboard', authMiddleware, roleGuard('admin'), async (req, res) => {
  try {
    const routes = await Route.findAll({ include: [{ model: User, as: 'driver' }]});
    const customers = await Customer.findAll();
    const drivers = await User.findAll({ where: { role: 'driver' }});
    const bottles = await Bottle.findAll();
    const jags = await Jag.findAll();

    // FIX: compute reminders BEFORE sending JSON
    const reminders = await Customer.findAll({
      where: { balance: { [Op.gt]: 0 } }
    });

    res.json({ routes, customers, drivers, bottles, jags, reminders });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load admin dashboard" });
  }
});

// ... (all other routes remain same as you had) ...
// I will include your existing route code unchanged below for completeness:
app.get('/api/admin/routes/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const r = await Route.findByPk(req.params.id, { include: [{ model: User, as: 'driver' }] });
  if (!r) return res.status(404).json({ error: 'Route not found' });
  res.json(r);
});
app.get('/api/admin/customers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const c = await Customer.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json(c);
});
app.get('/api/admin/drivers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const d = await User.findByPk(req.params.id);
  if (!d) return res.status(404).json({ error: 'Driver not found' });
  res.json(d);
});

app.put('/api/admin/routes/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const r = await Route.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Route not found' });
  const { name, driverId } = req.body;
  if (name !== undefined) r.name = name;
  r.driverId = driverId || null;
  await r.save();
  res.json(r);
});

app.put('/api/admin/customers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const c = await Customer.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  const { name, email, phone, routeId, balance, deposit } = req.body;
  if (name !== undefined) c.name = name;
  if (email !== undefined) c.email = email;
  if (phone !== undefined) c.phone = phone;
  if (routeId !== undefined) c.routeId = routeId || null;
  if (balance !== undefined) c.balance = Number(balance);
  if (deposit !== undefined) c.deposit = Number(deposit);
  await c.save();
  res.json(c);
});

app.put('/api/admin/drivers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const d = await User.findByPk(req.params.id);
  if (!d || d.role !== 'driver') return res.status(404).json({ error: 'Driver not found' });
  const { name, email, password } = req.body;
  if (name !== undefined) d.name = name;
  if (email !== undefined) d.email = email;
  if (password) {
    d.passwordHash = await bcrypt.hash(password, 10);
  }
  await d.save();
  res.json({ id: d.id, name: d.name, email: d.email, role: d.role });
});

app.delete('/api/admin/routes/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const r = await Route.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Route not found' });
  await Customer.update({ routeId: null }, { where: { routeId: r.id }});
  await r.destroy();
  res.json({ ok: true });
});

app.delete('/api/admin/customers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const c = await Customer.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  await Payment.destroy({ where: { customerId: c.id }});
  await Delivery.destroy({ where: { customerId: c.id }});
  await Complaint.destroy({ where: { customerId: c.id }});
  await c.destroy();
  res.json({ ok: true });
});

app.delete('/api/admin/drivers/:id', authMiddleware, roleGuard('admin'), async (req, res) => {
  const d = await User.findByPk(req.params.id);
  if (!d || d.role !== 'driver') return res.status(404).json({ error: 'Driver not found' });
  await Route.update({ driverId: null }, { where: { driverId: d.id }});
  await d.destroy();
  res.json({ ok: true });
});

app.post('/api/admin/inventory/bottle', authMiddleware, roleGuard('admin'), async (req, res) => {
  const { kind, qty } = req.body;
  let b = await Bottle.findOne({ where: { kind }});
  if (!b) b = await Bottle.create({ kind, quantity: qty });
  else { b.quantity += Number(qty); await b.save(); }
  res.json(b);
});
app.post('/api/admin/inventory/jag', authMiddleware, roleGuard('admin'), async (req, res) => {
  const { kind, qty } = req.body;
  let j = await Jag.findOne({ where: { kind }});
  if (!j) j = await Jag.create({ kind, quantity: qty });
  else { j.quantity += Number(qty); await j.save(); }
  res.json(j);
});

app.post('/api/admin/deposit', authMiddleware, roleGuard('admin'), async (req, res) => {
  const { customerId, amount } = req.body;
  const c = await Customer.findByPk(customerId);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  c.deposit += Number(amount);
  await c.save();
  const p = await Payment.create({ customerId: c.id, amount: amount, method: 'deposit' });
  res.json({ customer: c, payment: p });
});

app.get('/api/driver/dashboard', authMiddleware, roleGuard('driver'), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const route = await Route.findOne({ where: { driverId: user.id }, include: [Customer] });
  const deliveries = await Delivery.findAll({ where: { driverId: user.id }, order: [['date','DESC']] });
  res.json({ route, deliveries, driver: user });
});
app.post('/api/driver/delivery', authMiddleware, roleGuard('driver'), async (req, res) => {
  const { deliveryId, delivered } = req.body;
  const d = await Delivery.findByPk(deliveryId);
  if (!d) return res.status(404).json({ error: 'Delivery not found' });
  d.delivered = !!delivered;
  await d.save();
  if (d.delivered) {
    const b = await Bottle.findOne();
    if (b && b.quantity >= d.bottles) { b.quantity -= d.bottles; await b.save(); }
  }
  res.json(d);
});
app.post('/api/driver/gps', authMiddleware, roleGuard('driver'), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  user.lastLat = req.body.lat; user.lastLng = req.body.lng;
  await user.save();
  res.json(user);
});
app.post('/api/driver/collect', authMiddleware, roleGuard('driver'), async (req, res) => {
  const { customerId, amount } = req.body;
  const c = await Customer.findByPk(customerId);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  c.balance = Math.max(0, c.balance - Number(amount));
  await c.save();
  const p = await Payment.create({ customerId: c.id, amount, method: 'cash' });
  res.json({ customer: c, payment: p });
});

app.get('/api/customer/dashboard', authMiddleware, roleGuard('customer'), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const cust = await Customer.findOne({ where: { email: user.email }});
  const payments = await Payment.findAll({ where: { customerId: cust ? cust.id : null }, order: [['createdAt','DESC']] });
  const deliveries = await Delivery.findAll({ where: { customerId: cust ? cust.id : null }, order: [['date','DESC']] });
  const complaints = await Complaint.findAll({ where: { customerId: cust ? cust.id : null }, order: [['createdAt','DESC']]});
  res.json({ cust, payments, deliveries, complaints });
});
app.post('/api/customer/pay', authMiddleware, roleGuard('customer'), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const cust = await Customer.findOne({ where: { email: user.email }});
  const { amount, method } = req.body;
  if (!cust) return res.status(404).json({ error: 'Customer record not found' });
  cust.balance = Math.max(0, cust.balance - Number(amount));
  await cust.save();
  const p = await Payment.create({ customerId: cust.id, amount, method });
  res.json({ customer: cust, payment: p });
});
app.post('/api/customer/complaint', authMiddleware, roleGuard('customer'), async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const cust = await Customer.findOne({ where: { email: user.email }});
  const { message } = req.body;
  if (!cust) return res.status(404).json({ error: 'Customer record not found' });
  const c = await Complaint.create({ customerId: cust.id, message });
  res.json(c);
});

// sync DB and start + auto-seed if empty
(async () => {
  await sequelize.sync();
  console.log('DB synced');

  // auto-seed if no users
  const usersCount = await User.count();
  if (!usersCount) {
    console.log('No users found — creating seed users...');
    const adminHash = await bcrypt.hash('adminpass', 10);
    const driverHash = await bcrypt.hash('driverpass', 10);
    const custHash = await bcrypt.hash('customerpass', 10);

    const admin = await User.create({ name: 'Admin Owner', email: 'admin@example.com', passwordHash: adminHash, role: 'admin' });
    const driver = await User.create({ name: 'Route Driver', email: 'driver@example.com', passwordHash: driverHash, role: 'driver' });
    const userCust = await User.create({ name: 'Customer User', email: 'customer@example.com', passwordHash: custHash, role: 'customer' });

    const r = await Route.create({ name: 'Route A', driverId: driver.id });
    await Customer.create({ name: 'John Doe', email: 'john@example.com', phone: '9999999999', routeId: r.id, balance: 100 });
    await Customer.create({ name: 'Jane Roe', email: 'jane@example.com', phone: '8888888888', routeId: r.id, balance: 0 });

    await Bottle.create({ kind: '20L', quantity: 50 });
    await Jag.create({ kind: 'small', quantity: 100 });

    await Delivery.create({ routeId: r.id, customerId: 1, driverId: driver.id, delivered: false, bottles: 1 });

    console.log('Auto-seeded DB with admin/driver/customer');
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log('Server running on port', PORT));
})();
