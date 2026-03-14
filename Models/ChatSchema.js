import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            index: true,
        },
        senderId: {
            type: String, // Changed to String to support guests
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
