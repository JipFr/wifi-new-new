
const interval = 1 * 60e3;
const fs = require("fs");
const getConnected = require("./getConnected");
if(!fs.existsSync("data.json")) {
	fs.writeFileSync("data.json", JSON.stringify({
		devices: {}
	}));
}
let data = require("./data.json");
if(!data.devices) data.devices = {}

const app = require("./web");
app.listen(80, () => {
	console.log("Web server is live");
});

const main = async () => {
	const connected = await getConnected();
	
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