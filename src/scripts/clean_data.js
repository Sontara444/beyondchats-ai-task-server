const mongoose = require("mongoose");
const Article = require("../models/article.model");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const cleanData = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");

        // Remove ALL articles to start fresh
        const result = await Article.deleteMany({});
        console.log(`Deleted ${result.deletedCount} articles (All).`);

        // Check count
        const realCount = await Article.countDocuments({});
        console.log(`Remaining articles: ${realCount}`);

        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
};

cleanData();
