const mongoose = require("mongoose");
const Article = require("../models/article.model");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const checkArticles = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");

        const articles = await Article.find({});
        console.log(`Total Articles: ${articles.length}`);
        articles.forEach((a, i) => {
            console.log(`\n${i + 1}. [${a.source}] ${a.title}`);
            console.log(`   Desc: ${a.description ? a.description.substring(0, 100) + "..." : "N/A"}`);
            // console.log(`   Content Start: ${a.content ? a.content.substring(0, 50) + "..." : "N/A"}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Check failed:", error);
        process.exit(1);
    }
};

checkArticles();
