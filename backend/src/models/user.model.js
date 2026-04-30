import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema({
    username:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true, // Single field index for faster lookups
    },
    email:{
        type: String,
        required: true,
        index: true, // Index for email searches
    },
    phone:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    avatar:{
        type:String,
        default: ""
    },
},{timestamps: true});

// ============================================
// INDEXES FOR MONGODB EVALUATION
// ============================================

// Single field indexes for faster queries
userSchema.index({ email: 1 });

// Compound index: search by username and creation date
userSchema.index({ username: 1, createdAt: -1 });

userSchema.pre('save',async function(next){
    if(!this.isModified("password")){
        next();
        return;
    }

    this.password=await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.setUser=async function(){
    const payload={
        _id: this._id,
        username: this.username,
        email: this.email
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || "sankalp";
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRY || "1d";
    return jwt.sign(payload, secret, { expiresIn });
}

export const User=mongoose.model('User',userSchema);