import mongoose from 'mongoose';

const dbUrl = process.env.MONGODB_URI
const dbName = process.env.DB_NAME;
 
if (!dbUrl) {
  throw new Error('❌ Missing MongoDB URL in environment variables.');
}
if (!dbName) {
  throw new Error('❌ Missing MongoDB Name in environment variables.');
}
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, { dbName });
   // await mongoose.connect(`${dbUrl}/${dbName}`);
    console.log('MongoDB Connected to : ', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;

