const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const productsData = require('./data/products.json');
const usersData = require('./data/users.json');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('Inserting new products...');
    await Product.insertMany(productsData);
    
    console.log('Inserting new users...');
    const bcrypt = require('bcryptjs');
    const hashedUsers = await Promise.all(usersData.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.pass = await bcrypt.hash(user.pass, salt);
      return user;
    }));
    await User.insertMany(hashedUsers);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
