import Review from "../Models/ReviewSchema.js";

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { name, image } = req.user; // Assuming req.user is populated by authUser middleware

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        const review = await Review.create({
            userName: name,
            userImage: image,
            rating,
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const toggleReviewApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        review.isApproved = !review.isApproved;
        await review.save();

        res.json({ success: true, message: `Review ${review.isApproved ? 'approved' : 'disapproved'} successfully`, data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
