import Category from "../Models/CategorySchema.js";

/* ================= CREATE CATEGORY ================= */
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await Category.create({ categoryName });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/* ================= GET ALL CATEGORIES ================= */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check if new name already exists in another category
        const duplicate = await Category.findOne({ categoryName, _id: { $ne: id } });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }

        category.categoryName = categoryName;
        await category.save();

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
/* ================= TOGGLE HOME VISIBILITY ================= */
export const toggleCategoryHome = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.showOnHome = !category.showOnHome;
        await category.save();

        res.json({
            success: true,
            message: `Category ${category.showOnHome ? 'enabled' : 'disabled'} for Home page`,
            data: category,
        });
    } catch (error) {
        console.error("Toggle home visibility error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    toggleCategoryHome
};
