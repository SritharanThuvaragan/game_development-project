require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const clearDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    console.log('All users removed from database.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearDb();
