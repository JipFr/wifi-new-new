
const interval = 1 * 60e3;
const fs = require("fs");
const TeleBot = require("telebot");
const getConnected = require("./getConnected");
if(!fs.existsSync("data.json")) {
	fs.writeFileSync("data.json", JSON.stringify({}));
}
let data = require("./data.json");
if(!data.devices) data.devices = {}
if(!data.active) data.active = {}

const app = require("./web");
app.listen(80, () => {
	console.log("Web server is live");
});

const main = async () => {
	const connected = await getConnected();
	const connectedMacs = connected.map(device => device.MACAddress);

	for(let mac of connectedMacs) {
		if(!data.active[mac]) {

			let device = connected.find(obj => obj.MACAddress === mac);
			let deviceName = device.HostName || device.IPAddress || device.MACAddress;
			data.active[mac] = true;
			bot.sendMessage(process.env.toid, `Y: ${deviceName} (${mac} / ${device.IPAddress}) is nu verbonden`)
		}
	}

	Object.keys(data.active).forEach(mac => {
		if(data.active[mac] && !connectedMacs.includes(mac)) {

			data.active[mac] = false;
			let allDevices = Object.values(data.devices).map(obj => obj.meta);

			let device = allDevices.find(obj => obj.MACAddress === mac);
			let deviceName = device.HostName || device.IPAddress || device.MACAddress;
			bot.sendMessage(process.env.toid, `N: ${deviceName} (${mac} / ${device.IPAddress}) is NIET LANGER verbonden`)
		
		}
	});

	for(let device of connected) {
		let identifier = device.MACAddress;
		
		validateEntry(identifier, device);

		let sessions = data.devices[identifier].sessions;
		let lastSession = sessions[sessions.length - 1];

		let now = Date.now();
		let difference = now - lastSession.to;
		
		if(difference < interval + 60e3) {
			lastSession.to = now;
		} else {
			sessions.push({
				from: now,
				to: now
			});
		}

	}

	console.log("Updated: " + new Date().toLocaleString("it-IT"));
	
	fs.writeFileSync("data.json", JSON.stringify(data, null, "\t"));
}

main();
setInterval(main, interval);

function validateEntry(mac, device) {
	if(!data.devices[mac]) {
		data.devices[mac] = {
			meta: device,
			sessions: [
				{
					from: Date.now(),
					to: Date.now()
				}
			]
		}
	}
}



const bot = new TeleBot(process.env.botid);
bot.start();   
