const express = require("express");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/articles", require("./routes/article.routes"));

module.exports = app;