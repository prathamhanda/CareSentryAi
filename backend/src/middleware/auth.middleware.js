import jwt from "jsonwebtoken";

const authenticate=async(req,res,next)=>{
    const token=req.cookies?.accessToken;
    if (!token) {
        return res.status(400).json({ status: 400,message: "Token Not Found" });
    }

    try {
        const user=jwt.verify(token,"sankalp");
        req.user=user;
        return next();
    } catch (err) {
        return res.status(401).json({ status: 401,message: "Invalid Token" });
    }
};

export { authenticate }