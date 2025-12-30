const mongoose = require("mongoose");
const Article = require("./src/models/article.model");
require("dotenv").config();

const checkReferences = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const enhancedArticle = await Article.findOne({ isEnhanced: true }).lean();

        if (enhancedArticle) {
            console.log("\n=== Enhanced Article ===");
            console.log("Title:", enhancedArticle.title);
            console.log("URL:", enhancedArticle.url);
            console.log("Source:", enhancedArticle.source);
            console.log("\nReferences:", JSON.stringify(enhancedArticle.references, null, 2));
            console.log("\nReferences count:", enhancedArticle.references?.length || 0);
        } else {
            console.log("No enhanced articles found");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkReferences();
