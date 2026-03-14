import Event from "../Models/EventSchema.js";
import cloudinary from "../Utils/Cloudinary.js";

/* ================= CREATE EVENT ================= */
export const createEvent = async (req, res) => {
    try {
        const { title, category, description, date, location, guests, tag } = req.body;

        if (!title || !category || !description || !date || !location || !guests) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            // Upload images to Cloudinary
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'events' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                });
            });

            imageUrls = await Promise.all(uploadPromises);
        } else {
            // Fallback for when images might be sent as URLs (e.g. from existing system if not fully migrated)
            imageUrls = req.body.images;
        }

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 5) {
            return res.status(400).json({ success: false, message: "At least 5 images are required" });
        }

        const newEvent = await Event.create({
            title,
            category,
            description,
            date,
            location,
            guests,
            tag,
            images: imageUrls
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: newEvent,
        });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/* ================= GET ALL EVENTS ================= */
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= GET EVENT BY ID ================= */
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error("Get event by ID error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UPDATE EVENT ================= */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, date, location, guests, tag } = req.body;
        let { images } = req.body; // Existing URLs

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Parse images if it's a string (FormData might send it this way)
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = [images];
            }
        }

        let imageUrls = Array.isArray(images) ? [...images] : [];

        if (req.files && req.files.length > 0) {
            // Upload new images to Cloudinary
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'events' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    ).end(file.buffer);
                });
            });

            const newUploadedUrls = await Promise.all(uploadPromises);
            
            // In a real app, we might want to replace specific indices or just append
            // For now, let's append new uploads if we have less than 5, or just replace the whole array if that's what's intended
            // Given the requirement of 5 images, we'll assume the client sends the remaining URLs and the new files
            imageUrls = [...imageUrls, ...newUploadedUrls];
        }

        if (imageUrls.length < 5) {
            return res.status(400).json({ success: false, message: "At least 5 images are required" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, category, description, date, location, guests, tag, images: imageUrls },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent,
        });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/* ================= DELETE EVENT ================= */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
