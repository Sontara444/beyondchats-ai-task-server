const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article.controller");

router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);
router.post("/", articleController.createArticle);
router.put("/:id", articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);
router.post("/scrape", articleController.scrapeArticles);

module.exports = router;
