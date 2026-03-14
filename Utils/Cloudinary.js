import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.Cloudinaryname,
    api_key: process.env.Cloudinarykey,
    api_secret: process.env.Cloudinarysecret
});

export default cloudinary;
