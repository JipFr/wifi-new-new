
const months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

let data;
let devices;
let activeDevices;
let toRender;
let currentFocus;

async function main() {
	dataReq = await fetch("/data/");
	data = await dataReq.json();
	
	devices = Object.values(data.devices)
	  .sort((b, a) => a.sessions.length - b.sessions.length);
	
	activeDevices = devices
	  .filter(obj => Date.now() - obj.sessions[obj.sessions.length - 1].to < 3 * (1e3 * 60))
	  .map(obj => obj.meta.MACAddress);

	devices = devices.sort((a, b) => activeDevices.includes(b.meta.MACAddress) - activeDevices.includes(a.meta.MACAddress))
	
	if(typeof currentFocus === "undefined") currentFocus = devices[Math.floor(Math.random() * devices.length)].meta.MACAddress; 
	render(devices);
}

function init() {
	main();
	setInterval(main, 20e3);
	document.querySelector(".searchInput").addEventListener("input", search);
	search(document.querySelector(".searchInput"));
}

function render(renderDevices = devices) {
	toRender = renderDevices;
	renderSidebar();
	renderCore();
}

function renderSidebar() {
	let sidebar = document.querySelector("aside.allViews");
	let devicesDiv = sidebar.querySelector(".devicesDiv");

	devicesDiv.innerHTML = "";

	for(let device of toRender) {
		let node = document.importNode(document.querySelector("template.sidebarItem").content, true);
		
		node.querySelector("*").setAttribute("data-mac", device.meta.MACAddress)
		node.querySelector(".deviceName").innerText = getDisplayName(device);
		node.querySelector("*").setAttribute("data-active", activeDevices.includes(device.meta.MACAddress) ? 1 : 0);
		
		let sessionLength = device.sessions.length;
		node.querySelector(".deviceSessionCount").innerText = `${sessionLength} sessie${sessionLength !== 1 ? "s" : ""}`;

		node.querySelector("*").addEventListener("click", evt => {
			let mac = evt.currentTarget.dataset.mac;
			currentFocus = mac;
			render();
		});

		if(device.meta.MACAddress === currentFocus) {
			node.querySelector("*").classList.add("currentFocus")	
		}

		devicesDiv.appendChild(node);
	}

	search(document.querySelector(".searchInput"));

}

function renderCore() {
	let current = devices.find(device => device.meta.MACAddress === currentFocus);
	if(!current) {
		console.log("No selected device found");
		document.querySelector(".deviceCore .title").innerText = "Device not found";
		return null;
	}

	let displayName = getDisplayName(current);
	document.querySelector(".deviceCore .title").innerText = displayName;

	let coreContent = document.querySelector(".coreContent");
	coreContent.innerHTML = "";

	current.sessions = current.sessions.sort((a, b) => b.from - a.from);
	for(let session of current.sessions) {
		let node = document.importNode(document.querySelector("template.card").content, true);

		let startDate = new Date(session.from)
		let startDateStr = `${startDate.getDate()} ${months[startDate.getMonth()].toLowerCase()} ${startDate.getFullYear()}`

		let minuteCount = Math.round((session.to - session.from) / (1e3 * 60));

		node.querySelector(".content").innerHTML = `<b>${minuteCount}</b> ${minuteCount !== 1 ? "minuten" : "minuut"} vanaf <b>${getTime(session.from)}</b> tot <b>${getTime(session.to)}</b> op ${startDateStr}`

		coreContent.appendChild(node);
	}

}

function getDisplayName(device) {
	return (device.meta.customName || device.meta.HostName || device.meta.IPAddress).replace(/-/g, " ")
}

function getTime(num) {
	return new Date(num).toLocaleTimeString("it-IT").split(":").slice(0, 2).join(":")
}

function search(evt) {
	let el = evt.currentTarget || evt;
	let v = el.value.split(", ").filter(i => i).map(q => q.toLowerCase().trim());
	
	document.querySelectorAll(".allViews .deviceName").forEach(el => {
		let sidebarItem = el.closest(".sidebarItem")
		if(v.length > 0 && !v.find(q => el.innerText.toLowerCase().includes(q) )) {
			sidebarItem.classList.add("noMatch");
		} else {
			sidebarItem.classList.remove("noMatch");
		}
	});

	const noResults =document.querySelector(".devicesDivWrapper .noResults")
	if(document.querySelectorAll(".devicesDiv .sidebarItem:not(.noMatch)").length === 0) {
		noResults.classList.remove("hide");
	} else {
		noResults.classList.add("hide");
	}


}

window.addEventListener("load", init);