import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    public_id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    phone: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    verifycode: {
      type: Number,
    },

    verifyuser: {
      type: Boolean,
      default: false
    },

    verifycodeexp: {
      type: Date,
    },

    verifypassword: {
      type: Boolean,
      default: false,
    },

    forgotcode: {
      type: Number,
    },

    forgotcodeexp: {
      type: Date,
    },

    forgotpassword: {
      type: Boolean,
      default: false,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResendTime: {
      type: Date,
    },
    active:{
      type:Boolean,
      default:true
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User
