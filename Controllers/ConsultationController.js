import Consultation from "../Models/ConsultationSchema.js";

/* ================= CREATE CONSULTATION ================= */
export const createConsultation = async (req, res) => {
    try {
        const { name, email, phone, eventDate, eventType, message } = req.body;

        if (!name || !email || !phone || !eventType || !message) {
            return res.status(400).json({ success: false, message: "All required fields must be filled" });
        }

        const newConsultation = new Consultation({
            name,
            email,
            phone,
            eventDate,
            eventType,
            message,
        });

        await newConsultation.save();

        res.status(201).json({
            success: true,
            message: "Consultation request submitted successfully!",
            data: newConsultation,
        });
    } catch (error) {
        console.error("Create consultation error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET ALL CONSULTATIONS ================= */
export const getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: consultations,
        });
    } catch (error) {
        console.error("Get consultations error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
