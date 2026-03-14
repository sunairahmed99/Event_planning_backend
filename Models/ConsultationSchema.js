import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        eventDate: {
            type: Date,
        },
        eventType: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "Pending",
            enum: ["Pending", "Contacted", "Resolved"],
        },
    },
    {
        timestamps: true,
    }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
