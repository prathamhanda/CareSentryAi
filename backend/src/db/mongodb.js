import mongoose from "mongoose";

const connectDb=async()=>{
    try{
        const localURI='mongodb://localhost:27017/medicreminder';
        const mongoURI=(process.env.NODE_ENV==='production')?process.env.MONGO_URI_ATLAS:localURI;
        const connectionInstance=await mongoose.connect(mongoURI);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MongoDB connection error:",err);
        process.exit(1);
    }
}

export {connectDb};