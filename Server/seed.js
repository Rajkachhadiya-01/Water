// server/seed.js
// seed script: creates users and some sample data
const bcrypt = require('bcrypt');
const { sequelize, User, Route, Customer, Bottle, Jag, Delivery } = require('./models');

async function seed() {
  await sequelize.sync({ force: true });
  const adminHash = await bcrypt.hash('adminpass', 10);
  const driverHash = await bcrypt.hash('driverpass', 10);
  const custHash = await bcrypt.hash('customerpass', 10);

  const admin = await User.create({ name: 'Admin Owner', email: 'admin@example.com', passwordHash: adminHash, role: 'admin' });
  const driver = await User.create({ name: 'Route Driver', email: 'driver@example.com', passwordHash: driverHash, role: 'driver' });
  const userCust = await User.create({ name: 'Customer User', email: 'customer@example.com', passwordHash: custHash, role: 'customer' });

  const r = await Route.create({ name: 'Route A', driverId: driver.id });
  const c1 = await Customer.create({ name: 'John Doe', email: 'john@example.com', phone: '9999999999', routeId: r.id, balance: 100 });
  const c2 = await Customer.create({ name: 'Jane Roe', email: 'jane@example.com', phone: '8888888888', routeId: r.id, balance: 0 });

  await Bottle.create({ kind: '20L', quantity: 50 });
  await Jag.create({ kind: 'small', quantity: 100 });

  await Delivery.create({ routeId: r.id, customerId: c1.id, driverId: driver.id, delivered: false, bottles: 1 });

  console.log('Seeded DB with admin/driver/customer');
  process.exit(0);
}

seed();