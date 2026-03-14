import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userImage: {
        type: String
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
