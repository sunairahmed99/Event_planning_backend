import User from "../Models/UserSchmea.js";
import { sendMail } from "../Utils/SendMailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../Utils/Cloudinary.js";
import { Readable } from "stream";

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  console.log("Registration request received for:", req.body.email);
  try {
    const { name, email, password, cpassword, phone } = req.body;
    console.log("Body fields:", { name, email, phone, hasPassword: !!password });

    if (!name || !email || !password || !cpassword || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.verifyuser) {
        return res.status(400).json({ success: false, message: "User already registered" });
      } else {
        // If user is not verified, delete and allow re-registration
        await User.deleteOne({ _id: existingUser._id });
        // Also delete old image from cloudinary if it exists
        if (existingUser.public_id) {
          await cloudinary.uploader.destroy(existingUser.public_id);
        }
      }
    }

    if (password !== cpassword) {
      return res.status(400).json({ success: false, message: "Password not match" });
    }



    let imageResult = null;
    if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: "Image size is too large. Maximum allowed size is 10MB. Please compress your image." });
      }

      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "users_backend" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          Readable.from(req.file.buffer).pipe(stream);
        });
      };
      try {
        imageResult = await uploadStream();
        console.log("Image uploaded to Cloudinary");
      } catch (error) {
        console.error("Cloudinary Upload Error (Registration continuing without image):", error.message);
        imageResult = null;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send email but don't fail registration if email fails
    try {
      await sendMail({
        to: email,
        subject: "Verify Account",
        text: `Your verification code is: ${code}`,
        html: `<h2>Email Verification</h2><p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 24 hours.</p>`,
      });
      console.log(`Verification email sent to ${email}`);
    } catch (mailError) {
      console.error("Email send failed (registration will still succeed):", mailError.message);
    }

    console.log(`Verification code for ${email}: ${code}`);

    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      verifycode: code,
      verifycodeexp: Date.now() + 24 * 60 * 60 * 1000, // 1 day
      verifyuser: false,
      image: imageResult?.secure_url || null,
      public_id: imageResult?.public_id || null,
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully, please verify email",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }

};

/* ================= VERIFY USER ================= */
export const verifyuer = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (Number(user.verifycode) !== Number(code) || user.verifycodeexp < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    user.verifyuser = true;
    user.verifycode = undefined;
    user.verifycodeexp = undefined;
    await user.save();

    res.json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.verifyuser) {
      return res.status(400).json({ success: false, message: "User not registered or not verified" });
    }

    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({ success: false, message: "This account was registered via Google. Please log in with Google." });
    }

    if (!password || !user.password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.verifyuser) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.forgotcode = code;
    user.forgotcodeexp = Date.now() + 24 * 60 * 60 * 1000; // 1 day
    await user.save();

    await sendMail({
      to: email,
      subject: "Reset Password",
      text: `Your reset code is ${code}`,
    });

    res.json({ success: true, message: "Reset code sent to email" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetpassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.verifyuser) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    if (Number(user.forgotcode) !== Number(code) || user.forgotcodeexp < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.forgotcode = undefined;
    user.resetcodeexp = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= EDIT PROFILE ================= */
export const editprofile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let imageResult = null;
    if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: "Image size is too large. Maximum allowed size is 10MB. Please compress your image." });
      }

      // Delete old image if exists
      if (user.public_id) {
        await cloudinary.uploader.destroy(user.public_id);
      }

      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "users_backend" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          Readable.from(req.file.buffer).pipe(stream);
        });
      };
      try {
        imageResult = await uploadStream();
      } catch (error) {
        console.error("Cloudinary Upload Error (Profile Update continuing without image):", error.message);
        imageResult = null;
      }
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (imageResult) {
      user.image = imageResult.secure_url;
      user.public_id = imageResult.public_id;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("EDIT PROFILE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= EDIT PASSWORD ================= */
export const editpassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldpassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password wrong" });
    }

    user.password = await bcrypt.hash(newpassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("EDIT PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= RESEND CODE ================= */
export const resendCode = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'verify' or 'forgot'

    if (!email || !type) {
      return res.status(400).json({ success: false, message: "Email and type are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Rate limiting logic
    const COOLDOWN_TIME = 15 * 60 * 1000; // 15 minutes
    const MAX_RESENDS = 3;

    if (user.resendCount >= MAX_RESENDS) {
      const lastResendTime = user.lastResendTime ? new Date(user.lastResendTime).getTime() : 0;
      const timeSinceLastResend = Date.now() - lastResendTime;

      if (timeSinceLastResend < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - timeSinceLastResend) / (60 * 1000));
        return res.status(429).json({
          success: false,
          message: `Too many attempts. Please try again after ${remainingTime} minutes.`
        });
      } else {
        // Cooldown passed, reset count
        user.resendCount = 0;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    if (type === 'verify') {
      user.verifycode = code;
      user.verifycodeexp = expiry;
    } else if (type === 'forgot') {
      user.forgotcode = code;
      user.forgotcodeexp = expiry;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    user.resendCount += 1;
    user.lastResendTime = Date.now();
    await user.save();

    await sendMail({
      to: email,
      subject: type === 'verify' ? "Verify Account" : "Reset Password",
      text: `Your new code is ${code}. Previous codes are now invalid.`,
    });

    console.log(`Resent ${type} code for ${email}: ${code}`);

    res.json({ success: true, message: "New code sent to email" });
  } catch (error) {
    console.error("RESEND CODE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

/* ================= GOOGLE AUTH CALLBACK ================= */
export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token in query params
    const frontendUrl = "https://event-planning-frontend.vercel.app/"; 
    res.redirect(`${frontendUrl}?token=${token}`);
  } catch (error) {
    console.error("GOOGLE CALLBACK ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET CURRENT USER ================= */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


