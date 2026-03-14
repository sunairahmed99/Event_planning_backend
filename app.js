import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserRouter from './Routes/UserRouter.js';
import AdminRouter from './Routes/AdminRouter.js';
import AppError from './Utils/AppError.js';
import globalErrorHandler from './Middleware/errorMiddleware.js';
import passport from 'passport';
import './Utils/passport.js';

const app = express();

dotenv.config({ quiet: true });

app.set('trust proxy', 1);


app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://placehold.co", "*"],
                connectSrc: ["'self'", "http://localhost:9000", "http://127.0.0.1:9000", "https://event-planning-backend.vercel.app/", "wss://mern1-theta.vercel.app"],
            },
        },
    })
);


const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(cors());


app.use(express.json({ limit: '10kb' }));
app.use(passport.initialize());





const DB = process.env.DATABASE;

try {
    mongoose.connect(DB);
    console.log("connected to MongoDB");
} catch (err) {
    console.error(err);
    console.log('not connected to MongoDB');
}

app.use('/user', UserRouter);
app.use('/admin', AdminRouter);


app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

export default app;