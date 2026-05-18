const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://trungnho0512:SLcFnHfHcPdrpWnr@loom.zgmkxfv.mongodb.net/data?appName=loom';

const testDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const product = await Product.findOne();
    console.log(JSON.stringify(product, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testDB();
