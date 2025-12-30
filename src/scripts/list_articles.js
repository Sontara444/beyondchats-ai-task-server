const mongoose = require('mongoose');
const Article = require('../models/article.model');
require('dotenv').config({ path: '../.env' });

const checkArticles = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beyondchats';
        await mongoose.connect(mongoURI);
        console.log('Connected to DB.');

        const articles = await Article.find({}, '_id title url');
        console.log(`Found ${articles.length} articles.`);
        articles.forEach(a => {
            console.log(`ID: ${a._id} | Title: ${a.title}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkArticles();
