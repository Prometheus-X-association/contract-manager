import mongoose from "mongoose";

export const connect = async () => {
  if (!process.env.MONGO_URL) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URL);
};
