// server/models.js
// Sequelize models and associations
const { Sequelize, DataTypes } = require('sequelize');
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: false },
  },
  logging: false,
});

module.exports = sequelize;


const User = sequelize.define('User', {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING },
  lastLat: { type: DataTypes.FLOAT },
  lastLng: { type: DataTypes.FLOAT }
});

const Route = sequelize.define('Route', {
  name: { type: DataTypes.STRING }
});

const Customer = sequelize.define('Customer', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING,
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  deposit: { type: DataTypes.FLOAT, defaultValue: 0 }
});

const Bottle = sequelize.define('Bottle', {
  kind: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Jag = sequelize.define('Jag', {
  kind: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Delivery = sequelize.define('Delivery', {
  date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
  bottles: { type: DataTypes.INTEGER, defaultValue: 1 }
});

const Payment = sequelize.define('Payment', {
  amount: DataTypes.FLOAT,
  method: DataTypes.STRING
});

const Complaint = sequelize.define('Complaint', {
  message: DataTypes.TEXT,
  status: { type: DataTypes.STRING, defaultValue: 'open' }
});

// Associations
Route.belongsTo(User, { as: 'driver' });
User.hasMany(Route, { foreignKey: 'driverId' });

Customer.belongsTo(Route);
Route.hasMany(Customer);

Delivery.belongsTo(Route);
Delivery.belongsTo(Customer);
Delivery.belongsTo(User, { as: 'driver' });

Payment.belongsTo(Customer);
Complaint.belongsTo(Customer);

module.exports = {
  sequelize, User, Route, Customer, Bottle, Jag, Delivery, Payment, Complaint
};