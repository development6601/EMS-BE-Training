require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const logger = require('./logger');

// Admin user data
const adminUser = {
  email: 'admin@eventmanagement.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  phone: '+1234567890',
  address: {
    street: '123 Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    zipCode: '12345',
  },
};

// Sample regular users
const sampleUsers = [
  {
    email: 'john.doe@example.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    phone: '+1234567891',
    address: {
      street: '456 User Street',
      city: 'User City',
      state: 'User State',
      zipCode: '54321',
    },
  },
  {
    email: 'jane.smith@example.com',
    password: 'Password123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    phone: '+1234567892',
    address: {
      street: '789 Sample Street',
      city: 'Sample City',
      state: 'Sample State',
      zipCode: '67890',
    },
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data (optional - remove in production)
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Create admin user
    const admin = new User(adminUser);
    await admin.save();
    logger.info(`Admin user created: ${admin.email}`);

    // Create sample users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      logger.info(`Sample user created: ${user.email}`);
    }

    logger.info('Database seeding completed successfully');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Created users:');
    console.log(`👑 Admin: ${adminUser.email} / ${adminUser.password}`);
    console.log(`👤 User 1: ${sampleUsers[0].email} / ${sampleUsers[0].password}`);
    console.log(`👤 User 2: ${sampleUsers[1].email} / ${sampleUsers[1].password}`);
    console.log('\n💡 You can now test the authentication endpoints with these credentials.');

  } catch (error) {
    logger.error('Database seeding failed:', error);
    console.error('❌ Database seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
