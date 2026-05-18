const mongoose = require('mongoose');
require('dotenv').config();

async function dropEmailIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop the email index if it exists
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index successfully');
    } catch (err) {
      console.log('ℹ️  email_1 index not found or already removed:', err.message);
    }

    const remainingIndexes = await collection.indexes();
    console.log('Remaining indexes:', remainingIndexes.map(i => i.name));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  }
}

dropEmailIndex();
