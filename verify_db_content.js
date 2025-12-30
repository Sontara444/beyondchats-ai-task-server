const mongoose = require('mongoose');
const Article = require('./src/models/article.model');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beyondchats'); // Fallback if env missing in this context, but better to rely on what app uses.
        // Actually, let's just use the connection string from observing previous files or assume standard env usage if possible. 
        // Better: require the db config.
        // But db config probably connects immediately.
        console.log("Connected to DB");

        const articles = await Article.find().limit(3);

        console.log("\n--- Checking Articles ---");
        articles.forEach(a => {
            console.log(`\nTitle: ${a.title}`);
            console.log(`URL: ${a.url}`);
            console.log(`Content Start: ${a.content.substring(0, 100).replace(/\n/g, ' ')}...`);
            if (a.content.includes("Choosing the right AI chatbot")) {
                console.log("⚠️  WARNING: Still contains suspect text!");
            } else {
                console.log("✅ Content looks ok (different from suspect text).");
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

connectDB();
