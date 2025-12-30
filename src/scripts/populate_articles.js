const mongoose = require("mongoose");
const scraperService = require("../services/scraper.service");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const runScraper = async () => {
    try {
        await connectDB();
        console.log("Connected to DB. Starting scraper...");
        await scraperService.getOldestArticles();
        console.log("Scraping finished.");
        process.exit(0);
    } catch (error) {
        console.error("Scraping failed:", error);
        process.exit(1);
    }
};

runScraper();
