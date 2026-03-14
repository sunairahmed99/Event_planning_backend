import multer from 'multer';

// Use memory storage to process file before uploading to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
});

export default upload;
