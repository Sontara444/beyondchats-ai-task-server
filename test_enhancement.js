const mongoose = require("mongoose");
const Article = require("./src/models/article.model");
const { runEnhancement } = require("./src/scripts/content_generator");
require("dotenv").config();

const testEnhancement = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Reset one article for testing
        const article = await Article.findOne({ isEnhanced: true });

        if (article) {
            console.log("\n=== Resetting article for testing ===");
            console.log("Title:", article.title);

            article.isEnhanced = false;
            article.references = [];
            article.content = article.originalContent || article.content;
            await article.save();

            console.log("Article reset. Running enhancement...\n");

            // Run enhancement
            await runEnhancement();

            // Check the result
            const enhanced = await Article.findById(article._id);
            console.log("\n=== Enhancement Result ===");
            console.log("Title:", enhanced.title);
            console.log("Is Enhanced:", enhanced.isEnhanced);
            console.log("References Count:", enhanced.references?.length || 0);
            console.log("\nReferences:");
            enhanced.references?.forEach((ref, idx) => {
                console.log(`${idx + 1}. ${ref.title}`);
                console.log(`   ${ref.url}`);
            });
        } else {
            console.log("No enhanced articles found to test");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

testEnhancement();
