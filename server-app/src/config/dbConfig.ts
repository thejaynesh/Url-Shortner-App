import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongodInstance: MongoMemoryServer | null = null;

const connectDb = async () => {
    const connectionUri = process.env.CONNECTION_STRING || "mongodb://localhost:27017/urlshortener";
    try {
        const connect = await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 2500,
        });
        console.log(
            "Database connected: ", 
            connect.connection.host,
            connect.connection.name
        );
    } catch (error) {
        console.log(`External MongoDB not reachable at ${connectionUri}. Initializing embedded MongoDB engine...`);
        try {
            mongodInstance = await MongoMemoryServer.create({
                instance: {
                    dbName: "urlshortener",
                },
            });
            const fallbackUri = mongodInstance.getUri();
            const connect = await mongoose.connect(fallbackUri);
            console.log(
                "Embedded Database connected successfully: ",
                connect.connection.host,
                connect.connection.name
            );
        } catch (innerErr) {
            console.error("Failed to start embedded MongoDB:", innerErr);
            process.exit(1);
        }
    }
};

export default connectDb;
