const Article = require("../models/article.model");
const scraperService = require("../services/scraper.service");

// Get all articles
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ publishedDate: -1 });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });
        console.log("Fetched article from DB:", article);
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create an article manually
exports.createArticle = async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an article
exports.updateArticle = async (req, res) => {
    try {
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedArticle) return res.status(404).json({ message: "Article not found" });
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) return res.status(404).json({ message: "Article not found" });
        res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Trigger Scraper
exports.scrapeArticles = async (req, res) => {
    try {
        await scraperService.getOldestArticles();
        res.status(200).json({ message: "Scraping completed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Scraping failed", error: error.message });
    }
};
