import express from "express";
import {
  registerUser,
  verifyuer,
  login,
  forgotpassword,
  resetpassword,
  editprofile,
  editpassword,
  resendCode,
  googleAuthCallback,
  getMe,
} from "../Controllers/UserController.js";
import passport from "passport";
import { createConsultation } from "../Controllers/ConsultationController.js";
import { getEvents, getEventById } from "../Controllers/EventController.js";
import { getCategories } from "../Controllers/CategoryController.js";
import { saveMessage, getChatHistory } from "../Controllers/ChatController.js";
import { createReview, getReviews } from "../Controllers/ReviewController.js";

import authUser from "../Middleware/Authuser.js";

import upload from "../Middleware/Multer.js";

const UserRouter = express.Router();

/* ===== PUBLIC ROUTES ===== */
UserRouter.post("/register", upload.single("image"), registerUser);
UserRouter.post("/verify", verifyuer);
UserRouter.post("/login", login);
UserRouter.post("/forgot-password", forgotpassword);
UserRouter.post("/reset-password", resetpassword);
UserRouter.post("/resend-code", resendCode);
UserRouter.post("/consultation", createConsultation);
UserRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
UserRouter.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleAuthCallback);


/* ===== EVENT ROUTES ===== */
UserRouter.get("/events", getEvents);
UserRouter.get("/events/:id", getEventById);
UserRouter.get("/categories", getCategories);
UserRouter.get("/reviews", getReviews);

/* ===== CHAT ROUTES ===== */
UserRouter.post("/chat", saveMessage);
UserRouter.get("/chat/:roomId", getChatHistory);

/* ===== PROTECTED ROUTES ===== */
UserRouter.put("/edit-profile", authUser, upload.single("image"), editprofile);
UserRouter.put("/edit-password", authUser, editpassword);
UserRouter.get("/me", authUser, getMe);
UserRouter.post("/reviews", authUser, createReview);

export default UserRouter;
