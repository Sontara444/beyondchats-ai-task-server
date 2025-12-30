const mongoose = require("mongoose");
const Article = require("../models/article.model");
const connectDB = require("../config/db");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const seedArticles = async () => {
    try {
        await connectDB();
        console.log("Connected to DB for seeding...");

        await Article.deleteMany({ source: 'SeedScript' }); // Optional: clear previous seeds to avoid dupes if url clashes

        const articles = [
            {
                title: "The Future of Chatbots in Customer Service",
                url: "https://example.com/chatbots-future",
                content: "Chatbots are revolutionizing customer service by providing 24/7 support and instant responses. \n\nThey use NLP to understand user queries and provide relevant answers, reducing the load on human agents.",
                description: "Explore how AI-driven chatbots are transforming the customer support landscape.",
                publishedDate: new Date("2023-10-01"),
                author: "Sarah Connor",
                source: "SeedScript"
            },
            {
                title: "Understanding Large Language Models",
                url: "https://example.com/understanding-llms",
                content: "Large Language Models (LLMs) like GPT-4 have taken the world by storm. \n\nBut how do they actually work? It all starts with the transformer architecture and massive datasets.",
                description: "A deep dive into the technology behind ChatGPT and other LLMs.",
                publishedDate: new Date("2023-10-05"),
                author: "John Doe",
                source: "SeedScript"
            },
            {
                title: "AI in Healthcare: A New Era",
                url: "https://example.com/ai-healthcare",
                content: "From diagnosing diseases to personalizing treatment plans, AI is making significant strides in healthcare. \n\nDoctors are using AI tools to analyze medical images with greater accuracy than ever before.",
                description: "How artificial intelligence is saving lives and improving patient outcomes.",
                publishedDate: new Date("2023-10-10"),
                author: "Dr. Emily Smith",
                source: "SeedScript"
            },
            {
                title: "Ethical Considerations of AI",
                url: "https://example.com/ai-ethics",
                content: "As AI becomes more prevalent, ethical concerns regarding bias, privacy, and job displacement are coming to the forefront. \n\nIt is crucial to develop AI responsibly.",
                description: "Discussing the moral challenges posed by rapid AI advancement.",
                publishedDate: new Date("2023-10-15"),
                author: "Michael Chang",
                source: "SeedScript"
            },
            {
                title: "Building Your First React App",
                url: "https://example.com/first-react-app",
                content: "React is a powerful library for building user interfaces. \n\nIn this guide, we will walk through creating a simple todo application using functional components and hooks.",
                description: "A step-by-step tutorial for beginners to learn React.js.",
                publishedDate: new Date("2023-10-20"),
                author: "Jane Developer",
                source: "SeedScript"
            }
        ];

        await Article.insertMany(articles);
        console.log("Successfully seeded 5 articles!");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedArticles();
