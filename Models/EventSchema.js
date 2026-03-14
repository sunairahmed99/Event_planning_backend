import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        guests: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            default: "Classic",
        },
        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, '{PATH} must have at least 5 images']
        },
    },
    {
        timestamps: true,
    }
);

function arrayLimit(val) {
    return val.length >= 5;
}

const Event = mongoose.model("Event", eventSchema);

export default Event;
