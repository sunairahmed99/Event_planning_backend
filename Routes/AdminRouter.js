import express from "express";
import { getAllUsers, toggleUserStatus, getDashboardStats } from "../Controllers/AdminController.js";
import { createCategory, getCategories, updateCategory, deleteCategory, toggleCategoryHome } from "../Controllers/CategoryController.js";
import { createEvent, getEvents, updateEvent, deleteEvent } from "../Controllers/EventController.js";
import { saveMessage, getChatHistory, getActiveChats } from "../Controllers/ChatController.js";
import { getConsultations } from "../Controllers/ConsultationController.js";
import { getAllReviewsAdmin, toggleReviewApproval, deleteReview } from "../Controllers/ReviewController.js";
import authUser from "../Middleware/Authuser.js";
import adminAuth from "../Middleware/AdminMiddleware.js";
import upload from "../Middleware/Multer.js";

const AdminRouter = express.Router();

// Enable protection for all admin routes
AdminRouter.use(authUser, adminAuth);

// Dashboard Stats
AdminRouter.get("/stats", getDashboardStats);

// User Management Routes
AdminRouter.get("/users", getAllUsers);
AdminRouter.patch("/users/:id/status", toggleUserStatus);

// Category Management Routes
AdminRouter.post("/categories", createCategory);
AdminRouter.get("/categories", getCategories);
AdminRouter.put("/categories/:id", updateCategory);
AdminRouter.delete("/categories/:id", deleteCategory);
AdminRouter.patch("/categories/:id/home", toggleCategoryHome);

// Event Management Routes
AdminRouter.post("/events", upload.array('images', 5), createEvent);
AdminRouter.get("/events", getEvents);
AdminRouter.put("/events/:id", upload.array('images', 5), updateEvent);
AdminRouter.delete("/events/:id", deleteEvent);

// Chat Management Routes
AdminRouter.get("/chat/active", getActiveChats);
AdminRouter.get("/chat/:roomId", getChatHistory);
AdminRouter.post("/chat", saveMessage);

// Consultation Management Routes
AdminRouter.get("/consultations", getConsultations);

// Review Management Routes
AdminRouter.get("/reviews", getAllReviewsAdmin);
AdminRouter.patch("/reviews/:id/approve", toggleReviewApproval);
AdminRouter.delete("/reviews/:id", deleteReview);

export default AdminRouter;
