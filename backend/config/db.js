import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in env');
  }

  try {
    await mongoose.connect(uri);
  } catch (err) {
    throw new Error(`MongoDB connection error: ${err.message}`);
  }
};

export default connectDB;
