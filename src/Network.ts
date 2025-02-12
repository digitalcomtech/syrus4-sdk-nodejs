/**
 * Network module get information about networks and events in ApexOS
 * @module Network
 */
import { SystemRedisSubscriber as subscriber, SystemRedisClient as redis } from "./Redis";
import * as Utils from "./Utils"

async function IsConnected(net){
	try {
		var raw: any = await Utils.OSExecute(`ip route | grep ${net}`);
	} catch (error) {
		// Error means no text so grep return empty which is means disconnected
		return false;
	}
	if (net != "ppp0") {
		return !(raw.length == 0 || raw.indexOf("linkdown") > -1);
	}
	else{
		const result = await redis.hget("modem_information", "NO_CONN_TIME");
		const no_conn_time = result !== null ? Number(result) : 0;
		const hasConnection = no_conn_time <= 0;
		const hasLink = !(raw.length === 0 || raw.indexOf("linkdown") > -1);
		return hasConnection && hasLink;
	}

}

/**
 * Watch the network state change
 * @param callback callback to executed when network state changes
 * @param errorCallback callback to execute in case of error
 */
function onNetworkChange(callback, errorCallback) {
	let handler;
	try {
		handler = (channel:string, raw:string) => {
			if(channel !== "network/interface") return;
			callback(raw);
		};
		subscriber.subscribe("network/interface");
		subscriber.on("message", handler);
	} catch (error) {
		console.error(error);
		errorCallback(error);
	}

	const returnable: any = {
		unsubscribe: () => {
			subscriber.off("message", handler);
		}
	};
	returnable.off = returnable.unsubscribe;
	return returnable;
}

/**
 * get the current state of the network of the APEX OS, returns a promise with the info
 */
async function getActiveNetwork() {
	let net: any = await redis.get("network_interface").catch(Utils.$throw)
	let data: any = {};
	if (net == "wlan0") {
		data = await Utils.OSExecute("apx-wifi", "state").catch(Utils.$throw)
	}
	data = Object.assign(data, await getNetworkInfo(net).catch(Utils.$throw))
	return { network: net, information: data };
}

/**
 * get Network Information about specific network
 * @param net  network that want to know the information valid options are: eth0, ppp0, wlan0
 */
async function getNetworkInfo(net:string) {
	let data: any = {};
	if (net == "none") {
		return {
			connected: false
		};
	}

	if (net == "ppp0") {
		let modemInfo: any = await redis.hgetall("modem_information");
		data.imei = modemInfo.IMEI;
		data.operator = modemInfo.OPERATOR;
		data.imsi = modemInfo.SIM_IMSI;
		data.iccid = modemInfo.SIM_ID;
		data.mcc = modemInfo.MCC_MNC.substring(0, 3);
		data.mnc = modemInfo.MCC_MNC.substring(3);
		data.connected = IsConnected('ppp0');
	}
	if (net == "wlan0") {
		try {
			let wifiInfo = await Utils.OSExecute("apx-wifi state");
			data = Object.assign(data, wifiInfo);
			data.signal = Number(data.signal);
			delete data.ip;
		} catch (error) {
			console.error(error);
		}
	}
	if ( await IsConnected(net) == true ) {
		let raw: any = await Utils.OSExecute(`ifconfig ${net}`).catch(Utils.$throw);

		let start = raw.indexOf("inet addr:") + 10;
		let end = raw.indexOf(" ", start);
		if (start > -1) data.ip_address = raw.substring(start, end);

		start = raw.indexOf("RX bytes:") + 9;
		end = raw.indexOf(" ", start);
		if (start > -1) data["rx_bytes"] = parseInt(raw.substring(start, end));

		start = raw.indexOf("TX bytes:") + 9;
		end = raw.indexOf(" ", start);
		if (start > -1) data["tx_bytes"] = parseInt(raw.substring(start, end));	
	}

	data.connected = await IsConnected(net).catch(Utils.$throw);
	if (data.ip_address == "") {
		data.ip_address = null;
	}
	return data;
}

/**
 * get network information about all the available networks on APEX OS
 */
async function getNetworks() {
	let nets: any = await Utils.OSExecute(`ifconfig | grep "Link encap:"`).catch(Utils.$throw);
	nets = nets
		.split("\n")
		.map((str:string) => str.split(" ")[0])
		.filter((str:string) => str);
	let info = {};
	if ( !nets.includes('ppp0') ) nets.push('ppp0');
	if ( !nets.includes('wlan0') ) nets.push('wlan0');
	if ( !nets.includes('eth0') ) nets.push('eth0');  
	for (const net of nets){
		let [resp, err] = await Utils.$to(getNetworkInfo(net))

		if (err) {
			console.error({ net, err });
			continue
		}
		info[net] = resp
	}
	return info;
}

export default {
	onNetworkChange,
	getActiveNetwork,
	getNetworkInfo,
	getNetworks
};
