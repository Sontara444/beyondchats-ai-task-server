const mongoose = require("mongoose");
const Article = require("../models/article.model");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const resetEnhanced = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");

        const result = await Article.updateMany({}, { $set: { isEnhanced: false, source: "BeyondChats" } });
        console.log(`Reset ${result.modifiedCount} articles to isEnhanced: false`);

        process.exit(0);
    } catch (error) {
        console.error("Reset failed:", error);
        process.exit(1);
    }
};

resetEnhanced();
