import mongoose from "mongoose";
const MONGODB_URI = "mongodb://127.0.0.1:27017/waller";
export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI as string);
    if (connection.readyState === 1) {
      console.log("Connected to MongoDB");
      return Promise.resolve(true);
    }
  } catch (error) {
    console.log("Error connecting to MongoDB: ");
    console.error(error);
    return Promise.reject(error);
  }
};
