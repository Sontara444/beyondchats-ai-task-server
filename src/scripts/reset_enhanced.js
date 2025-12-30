const mongoose = require("mongoose");
const Article = require("../models/article.model");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const resetEnhanced = async () => {
    try {
        await connectDB();
        console.log("Connected to DB.");

        // Revert content for articles that have originalContent saved
        const articlesToRevert = await Article.find({ originalContent: { $exists: true, $ne: null } });
        console.log(`Found ${articlesToRevert.length} articles to revert content.`);

        for (const article of articlesToRevert) {
            article.content = article.originalContent;
            article.originalContent = undefined;
            await article.save();
        }

        const result = await Article.updateMany({}, {
            $set: {
                isEnhanced: false,
                source: "BeyondChats",
                references: []
            }
        });

        console.log(`Reverted content for ${articlesToRevert.length} articles.`);
        console.log(`Reset flags for ${result.modifiedCount} articles.`);

        process.exit(0);
    } catch (error) {
        console.error("Reset failed:", error);
        process.exit(1);
    }
};

resetEnhanced();
