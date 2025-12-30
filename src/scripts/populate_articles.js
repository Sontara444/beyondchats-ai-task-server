const mongoose = require('mongoose');
const { getOldestArticles } = require('../services/scraper.service');
const Article = require('../models/article.model');
require('dotenv').config({ path: '../.env' });

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beyondchats';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected.');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
};

const runPopulation = async () => {
    await connectDB();

    console.log('Checking article count...');
    const count = await Article.countDocuments();
    console.log(`Current article count: ${count}`);

    if (count < 5) {
        console.log('Fewer than 5 articles found. Triggering scraper...');
        try {
            await getOldestArticles();
            console.log('Scraping finished.');

            const newCount = await Article.countDocuments();
            console.log(`New article count: ${newCount}`);
        } catch (error) {
            console.error('Scraping failed:', error);
        }
    } else {
        console.log('Database already has articles. You can clear them if you want to re-scrape.');
    }

    console.log('Done.');
    process.exit(0);
};

runPopulation();
