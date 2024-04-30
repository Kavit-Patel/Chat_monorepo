import mongoose from "mongoose";

export const ConnectDB = async () => {
  const options = { dbName: "Chat_monorepo" };
  const connection = mongoose.connection;
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
      options
    );
    console.log(
      `Database Connected at ${connection.host}:${connection.port}/${connection.name}`
    );
  } catch (error) {
    console.log(`DB connection Failed !`);
  }
};
