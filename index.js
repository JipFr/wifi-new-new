
const interval = 1 * 60e3;
const fs = require("fs");
const getConnected = require("./getConnected");
if(!fs.existsSync("data.json")) {
	fs.writeFileSync("data.json", JSON.stringify({
		devices: {}
	}));
}
let data = require("./data.json");

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

		// let jip = Object.values(data.devices).find(d => d.device.HostName === "Jips-iPhone");
		for(let jip of Object.values(data.devices)) {
			console.log((jip.device.HostName || jip.device.IPAddress) + ":");
			console.log(jip.sessions.map(session => {
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
			device,
			sessions: [
				{
					from: Date.now(),
					to: Date.now()
				}
			]
		}
	}
}