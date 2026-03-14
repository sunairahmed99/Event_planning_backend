import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../Models/CategorySchema.js';
import Event from '../Models/EventSchema.js';

dotenv.config({ path: './.env' });

const categories = [
    { categoryName: 'Music & Concerts', showOnHome: true },
    { categoryName: 'Tech & Business', showOnHome: true },
    { categoryName: 'Weddings & Social', showOnHome: true },
    { categoryName: 'Art & Culture', showOnHome: true },
    { categoryName: 'Sports & Fitness', showOnHome: true }
];

const dummyImages = {
    'Music & Concerts': [
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop'
    ],
    'Tech & Business': [
        'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000'
    ],
    'Weddings & Social': [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1465495910483-34a1d374bb36?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522673607200-164883eecd4c?q=80&w=1000&auto=format&fit=crop'
    ],
    'Art & Culture': [
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518998053574-53ee75de7a93?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508191702642-07c728b4998c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492037766660-2a56f9eb3fcb?q=80&w=1000&auto=format&fit=crop'
    ],
    'Sports & Fitness': [
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1530549387633-f71af9941f17?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1000&auto=format&fit=crop'
    ]
};

const generateDummyEvents = (categoryName) => {
    const events = [];
    for (let i = 1; i <= 5; i++) {
        events.push({
            title: `${categoryName} Event ${i}`,
            category: categoryName,
            description: `This is a premium dummy event for ${categoryName}. Join us for an unforgettable experience filled with excitement and networking opportunities. Event ${i} is designed to be world-class.`,
            date: new Date(Date.now() + i * 86400000 * 7).toISOString().split('T')[0], // Sparse dates in future
            location: ['New York, NY', 'London, UK', 'Dubai, UAE', 'Tokyo, JP', 'Berlin, DE'][i-1],
            guests: `${Math.floor(Math.random() * 500) + 50}+ Guests`,
            tag: i % 2 === 0 ? 'Premium' : 'Exclusive',
            images: dummyImages[categoryName]
        });
    }
    return events;
};

const seed = async () => {
    try {
        const DB = process.env.DATABASE;
        if (!DB) throw new Error('DATABASE URI is missing in .env');

        console.log('Connecting to MongoDB...');
        await mongoose.connect(DB);
        console.log('Connected!');

        // 1. Seed Categories
        console.log('Seeding Categories...');
        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { categoryName: cat.categoryName },
                cat,
                { upsert: true, new: true }
            );
        }
        console.log('Categories seeded!');

        // 2. Seed Events
        console.log('Seeding Events...');
        // Optional: Clear existing dummy events to avoid clutter if re-running
        // await Event.deleteMany({ title: /Event [1-5]/ }); 

        for (const cat of categories) {
            const dummyEvents = generateDummyEvents(cat.categoryName);
            for (const event of dummyEvents) {
                await Event.findOneAndUpdate(
                    { title: event.title, category: event.category },
                    event,
                    { upsert: true, new: true }
                );
            }
        }
        console.log('Events seeded!');

        console.log('Data Seeding Completed Successfully! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seed();
