import User from "../Models/UserSchmea.js";
import Event from "../Models/EventSchema.js";
import Category from "../Models/CategorySchema.js";
import Review from "../Models/ReviewSchema.js";
import Chat from "../Models/ChatSchema.js";
import Consultation from "../Models/ConsultationSchema.js";

/* ================= GET DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalEvents = await Event.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalConsultations = await Consultation.countDocuments();
        
        // Active chats (unique roomIds in the last 24 hours)
        const activeChats = await Chat.distinct('roomId', {
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // Growth data (last 7 months)
        const monthlyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('default', { month: 'short' });
            
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const userCount = await User.countDocuments({ 
                role: 'user',
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            });
            
            const eventCount = await Event.countDocuments({ 
                createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
            });

            monthlyData.push({
                name: monthName,
                users: userCount,
                events: eventCount
            });
        }

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                totalCategories,
                totalReviews,
                totalConsultations,
                activeChatsCount: activeChats.length
            },
            monthlyData
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET ALL USERS (with search, sort, filter, pagination) ================= */
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            role = "",
            status = "",
            sortField = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by status (active/inactive)
        if (status) {
            query.active = status === "active";
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sorting
        const sort = {};
        sort[sortField] = sortOrder === "desc" ? -1 : 1;

        const users = await User.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .select("-password"); // Exclude passwords

        const totalUsers = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                total: totalUsers,
                page: Number(page),
                pages: Math.ceil(totalUsers / limit),
            },
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= TOGGLE USER STATUS (Active/Inactive) ================= */
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle the active status
        user.active = !user.active;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.active ? "activated" : "deactivated"} successfully`,
            data: { id: user._id, active: user.active },
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
