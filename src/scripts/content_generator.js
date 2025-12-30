const mongoose = require("mongoose");
const Article = require("../models/article.model");
const searchService = require("../services/search.service");
const externalScraper = require("../services/external_scraper.service");
const llmService = require("../services/llm.service");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const generateContent = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1. Fetch articles that haven't been processed yet 
        // fetch at most 5 that are not enhanced
        const articles = await Article.find({ source: "BeyondChats", isEnhanced: false }).sort({ publishedDate: 1 }).limit(5);

        if (articles.length === 0) {
            console.log("No un-enhanced articles found to process.");
            process.exit(0);
        }

        console.log(`Found ${articles.length} articles to enhance.`);

        for (const article of articles) {
            console.log(`Processing article: "${article.title}"`);

            // 2. Search Google
            const searchResults = await searchService.searchGoogle(article.title);

            // 3. Scrape Top 2 Results
            const sourceContents = [];
            if (searchResults && searchResults.length > 0) {
                for (const url of searchResults) {
                    if (url) {
                        const content = await externalScraper.scrapeExternalArticle(url);
                        if (content) sourceContents.push(content);
                    }
                }
            }

            console.log(`Scraped ${sourceContents.length} external sources.`);

            // 4. Update Article with LLM
            const newContent = await llmService.rewriteArticle(article, sourceContents);

            // 5. Store Updated Article
            if (!article.isEnhanced) {
                article.originalContent = article.content;
            }
            article.content = newContent;

            // Update description to reflect the enhancement (or just take 1st paragraph of new content)
            // Remove markdown headers for description
            const plainText = newContent.replace(/^#+\s+/gm, '').replace(/\*\*/g, '');
            article.description = plainText.substring(0, 150) + "...";

            article.isEnhanced = true;
            article.source = "BeyondChats+AI";

            await article.save();
            console.log("Article updated successfully!");
        }

        console.log("All articles processed.");
        process.exit(0);

    } catch (error) {
        console.error("Content Generator Error:", error);
        process.exit(1);
    }
};

generateContent();
