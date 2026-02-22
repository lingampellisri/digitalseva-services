const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin if database is empty
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Seeding default admin...');
      await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      });
      console.log('✅ Admin user created successfully!');
    }
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
