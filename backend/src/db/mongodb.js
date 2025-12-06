import mongoose from "mongoose";

const connectDb=async()=>{
    try{
        const localURI='mongodb://localhost:27017/medicreminder';
        const mongoURI=(process.env.NODE_ENV==='production')?process.env.MONGO_URI_ATLAS:localURI;
        
        mongoose.set('bufferMaxEntries', 0);
        const connectionInstance=await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0 // Disable mongoose buffering
        });
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MongoDB connection error:",err);
        console.log("Please make sure MongoDB is running locally or set MONGO_URI_ATLAS for production");
        process.exit(1);
    }
}

export {connectDb};