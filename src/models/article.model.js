const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
    },
    description: {
        type: String,
    },
    publishedDate: {
        type: Date,
    },
    author: {
        type: String,
    },
    source: {
        type: String,
        default: "BeyondChats",
    },
    isEnhanced: {
        type: Boolean,
        default: false
    },
    originalContent: {
        type: String
    },
    references: [{
        title: String,
        url: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Article", articleSchema);
