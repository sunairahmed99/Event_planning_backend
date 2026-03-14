import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../Models/UserSchmea.js';
import Review from '../Models/ReviewSchema.js';

dotenv.config({ path: './.env' });

const dummyReviews = [
    "Absolutely amazing experience! The team was very professional.",
    "Breathtaking decorations and seamless execution. Highly recommended!",
    "The best event planning service I have ever used. 5 stars!",
    "Highly impressed with the attention to detail. Great job!",
    "A truly unforgettable night. Thank you for making it so special.",
    "Everything was perfect from start to finish. Loved it!",
    "Professional, creative, and very easy to work with.",
    "Exceeded all my expectations. Use them for your next event!",
    "Beautiful execution of our vision. Simply magical.",
    "The coordination was flawless. We didn't have to worry about a thing."
];

const seedReviews = async () => {
    try {
        const DB = process.env.DATABASE;
        if (!DB) throw new Error('DATABASE URI is missing in .env');

        console.log('Connecting to MongoDB...');
        await mongoose.connect(DB);
        console.log('Connected!');

        console.log('Fetching users...');
        const users = await User.find({ role: 'user' });
        console.log(`Found ${users.length} users.`);

        console.log('Seeding Reviews...');

        for (const user of users) {
            // Generate 2 reviews per user
            for (let i = 0; i < 2; i++) {
                const randomReview = dummyReviews[Math.floor(Math.random() * dummyReviews.length)];
                const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 star rating

                await Review.create({
                    userName: user.name,
                    userImage: user.image || 'https://placehold.co/150',
                    rating: randomRating,
                    comment: `${randomReview} (Review ${i + 1} by ${user.name})`,
                    isApproved: true, // Auto-approve for seeding
                    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000) // Random date in last 30 days
                });
            }
        }

        console.log('Reviews seeded successfully! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedReviews();
