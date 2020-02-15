
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

		// Logging, temporarily
		for(let device of Object.values(data.devices)) {
			console.log((device.meta.HostName || device.meta.IPAddress) + ":");
			console.log(device.sessions.map(session => {
				return `  From: ${new Date(session.from).toLocaleTimeString()}    To: ${new Date(session.to).toLocaleTimeString()}`;
			}).join("\n") + "\n")
		}
	
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