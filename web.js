const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/data/", async (req, res) => {
	let data = JSON.parse(fs.readFileSync("data.json"));
	res.json(data);
});

app.get("/connected/", async (req, res) => {
	let data = JSON.parse(fs.readFileSync("data.json"));

	let connectedMacs = Object.keys(data.active).filter(mac => data.active[mac]);

	let connected = connectedMacs
	  .map(mac => Object.values(data.devices).find(obj => obj.meta.MACAddress === mac))
	  .map(obj => obj.meta.HostName || obj.meta.IPAddress);

	res.send(connected);
});

module.exports = app;
