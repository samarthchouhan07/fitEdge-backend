import Otp from "../models/otp.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/sendOTP.js";
import user from "../models/user.js";

export const requestOtp = async (req, res) => {
  const { email, role } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.log("error in register controller:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    let user_ = await user.findOne({ email });

    let isNew = false;
    if (!user_) {
      user_ = await user.create({ email, role: "user" });
      isNew = true;
    }

    const token = jwt.sign(
      { userId: user_._id, role: user_.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    await Otp.deleteMany({ email });
    return res.json({
      token,
      isNew,
      user: { id: user_._id, email: user_.email, role: user_.role },
    });
  } catch (error) {
    console.log("Error in verifyOtp:", error);
    return res.status(500).json({
      error: "Imternal server error",
    });
  }
};
