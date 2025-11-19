// Server/models.js
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// MODELS
const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: DataTypes.STRING,
  lastLat: DataTypes.FLOAT,
  lastLng: DataTypes.FLOAT,
});

const Route = sequelize.define("Route", {
  name: DataTypes.STRING,
});

const Customer = sequelize.define("Customer", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING,
  balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  deposit: { type: DataTypes.FLOAT, defaultValue: 0 },
});

const Bottle = sequelize.define("Bottle", {
  kind: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Jag = sequelize.define("Jag", {
  kind: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Delivery = sequelize.define("Delivery", {
  date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
  bottles: { type: DataTypes.INTEGER, defaultValue: 1 },
});

const Payment = sequelize.define("Payment", {
  amount: DataTypes.FLOAT,
  method: DataTypes.STRING,
});

const Complaint = sequelize.define("Complaint", {
  message: DataTypes.TEXT,
  status: { type: DataTypes.STRING, defaultValue: "open" },
});

// RELATIONS
Route.belongsTo(User, { as: "driver" });
User.hasMany(Route, { foreignKey: "driverId" });

Customer.belongsTo(Route);
Route.hasMany(Customer);

Delivery.belongsTo(Route);
Delivery.belongsTo(Customer);
Delivery.belongsTo(User, { as: "driver" });

Payment.belongsTo(Customer);
Complaint.belongsTo(Customer);

module.exports = {
  sequelize,
  User,
  Route,
  Customer,
  Bottle,
  Jag,
  Delivery,
 Payment,
  Complaint
};
