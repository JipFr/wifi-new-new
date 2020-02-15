const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/data/", async (req, res) => {
	let data = JSON.parse(fs.readFileSync("data.json"));
	res.json(data);
});

module.exports = app;