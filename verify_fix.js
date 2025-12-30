const mongoose = require('mongoose');
const Article = require('./src/models/article.model');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beyondchats');
        console.log("Connected to DB");

        const articles = await Article.find().limit(5);

        console.log("\n--- Checking for junk '0's ---");
        articles.forEach(a => {
            console.log(`\nTitle: ${a.title}`);
            const lines = a.content.split('\n').map(l => l.trim()).filter(l => l);
            const tail = lines.slice(-5);
            console.log("Tail lines:", tail);

            if (tail.includes('0')) {
                console.log("❌ FAILURE: Content still contains '0' lines.");
            } else {
                console.log("✅ SUCCESS: No '0' lines found in tail.");
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

verify();
