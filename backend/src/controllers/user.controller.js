import { User } from "../models/user.model.js";

const register = async (req, res) => {
  const { username, email, phone, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return res.json({ status: 400, message: "User already exists" });
  }

  const newUser = await User.create({ username, email, phone, password });

  res.json({
    status: 201,
    message: "User created successfully",
    user: newUser,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.json({ status: 400, message: "User not found" });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.json({ status: 400, message: "Invalid password" });
  }
  const token = await user.setUser();
  res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV==="production",
      sameSite: process.env.NODE_ENV==="production"?"None":"Lax",
      maxAge: 24*60*60*1000
  });
  // sanitize user before sending to client
  const safeUser = user.toObject ? user.toObject() : user;
  if (safeUser && safeUser.password !== undefined) delete safeUser.password;
  res.json({
    status: 200,
    message: "User logged in successfully",
    user: safeUser,
  });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.json({
      status: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("accessToken",{
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
        sameSite: process.env.NODE_ENV==="production"?"None":"Lax",
  });
  res.json({ status: 200, message: "User logged out successfully" });
};

export { register, login, getCurrentUser, logout };
