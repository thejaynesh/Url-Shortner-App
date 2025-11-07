import mongoose from "mongoose";

const connectDb = async () => {
  let connectionUri = process.env.CONNECTION_STRING?.trim();

  // If a cloud MongoDB URI is provided (e.g. MongoDB Atlas) or in production
  if (connectionUri && (connectionUri.startsWith("mongodb+srv://") || process.env.NODE_ENV === "production")) {
    // If the database name was omitted in Atlas URI, auto-insert 'linkflow'
    if (connectionUri.includes(".mongodb.net/?")) {
      connectionUri = connectionUri.replace(".mongodb.net/?", ".mongodb.net/linkflow?");
    } else if (connectionUri.endsWith(".mongodb.net/")) {
      connectionUri = `${connectionUri}linkflow`;
    } else if (connectionUri.endsWith(".mongodb.net")) {
      connectionUri = `${connectionUri}/linkflow`;
    }

    try {
      console.log("Connecting to MongoDB Atlas cloud database...");
      const connect = await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 30000, // 30s timeout for cold cloud connection & DNS SRV resolution
      });
      console.log(
        "Database connected successfully to host: ",
        connect.connection.host,
        "| DB:",
        connect.connection.name
      );
      return;
    } catch (error: any) {
      console.error("Failed to connect to MongoDB Atlas cloud database:", error?.message || error);
      process.exit(1);
    }
  }

  // Local development fallback (localhost)
  const localUri = connectionUri || "mongodb://localhost:27017/linkflow";
  try {
    const connect = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(
      "Local Database connected: ",
      connect.connection.host,
      connect.connection.name
    );
  } catch (error) {
    console.log(`Local MongoDB not detected at ${localUri}. Starting local dev memory engine...`);
    try {
      // Dynamic import so production cloud builds don't depend on MongoMemoryServer
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: "linkflow",
        },
      });
      const fallbackUri = mongodInstance.getUri();
      const connect = await mongoose.connect(fallbackUri);
      console.log(
        "Local embedded Database connected: ",
        connect.connection.host,
        connect.connection.name
      );
    } catch (innerErr: any) {
      console.error("Could not start local embedded MongoDB:", innerErr?.message || innerErr);
      process.exit(1);
    }
  }
};

export default connectDb;
