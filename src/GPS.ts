/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils";

function deg2rad(deg: number) {
	return deg * (Math.PI / 180);
}

/**
 * return distance in km between two coordinates points
 * @param coord1 first coordinate to calculate the distance
 * @param coord2 second coordinate to calculate the distance
 */
function distanceBetweenCoordinates(coord1, coord2) {
	if (!coord1 || !coord2) return null;
	var lat1 = coord1.coords.latitude;
	var lon1 = coord1.coords.longitude;
	var lat2 = coord2.coords.latitude;
	var lon2 = coord2.coords.longitude;
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function rawdataToCoordinates(raw: string) {
	var gps = JSON.parse(raw);
	var speed = Number(gps.speed) * 0.277778;

	// Determine acceleration in mph.
	var accel = 0; 
	if ("mphs" in gps) {
		accel = gps.mphs;
	} else if ("kphs" in gps) {
		accel = gps.kphs * 0.621371; // Convert kph to mph.
	}

	if (gps.timestamp != undefined) {
			return { 
				coords: {
				latitude: gps.lat || 0,
				longitude: gps.lon || 0,
				speed: speed,
				accuracy: 5 * gps.hdop || 20000,
				altitude: gps.alt || 0,
				bearing: gps.track,
				altitudeAccuracy: 5 * gps.vdop || 0,
                altitude_accuracy: 5 * gps.vdop || 0
			},
			timestamp: gps.timestamp,
			time: gps.time,
			extras: {
				hdop: gps.hdop,
				vdop: gps.vdop,
				pdop: gps.pdop,
				quality: gps.quality,
				fix: gps.fix,
				satsActive: gps.satused,
				sats_active: gps.satused,
				satsVisible: gps.satview,
				sats_visible: gps.satview,
				criteria: gps.type || null,
				acceleration: accel 	 
			}
		};
	}

	return {
		coords: {
			latitude: gps.lat || 0,
			longitude: gps.lon || 0,
			speed: speed,
			accuracy: 5 * gps.hdop || 20000,
			altitude: gps.alt || 0,
			bearing: gps.track,
			altitudeAccuracy: 5 * gps.vdop || 0,
            altitude_accuracy: 5 * gps.vdop || 0
		},
		timestamp: new Date(gps.time).getTime() / 1000,
		extras: {
			hdop: gps.hdop,
			vdop: gps.vdop,
			pdop: gps.pdop,
			quality: gps.quality,
			fix: gps.fix,
			satsActive: gps.satused,
			sats_active: gps.satused,
			satsVisible: gps.satview,
			sats_visible: gps.satview,
			criteria: gps.type || null,
			acceleration: accel	 
		}
	};
}

function evaluateCriteria(current, last = null, config = { hdop: 3, distance: 0, time: 0, heading: 0 }) {
	if (config.hdop > 0 && current.extras.hdop > config.hdop) {
		return false;
	}
	if (!last) return "signal";
	var criteria = config.distance == 0 && config.time == 0 && config.heading == 0 ? "accuracy" : false;
	var distance = distanceBetweenCoordinates(last, current) * 1000;
	var secs = Math.abs(new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime()) / 1000;
	var heading = Math.abs(last.coords.heading - current.coords.heading);
	if (config.distance > 0 && distance >= config.distance) criteria = "distance";
	if (config.time > 0 && secs >= config.time) criteria = "time";
	if (config.heading > 0 && heading >= config.heading) criteria = "heading";
	return criteria;
}

/**
 * Get last current location from GPS
 */
function getCurrentPosition(config = { hdop: 0, distance: 0, time: 0, heading: 0 }) {
	return new Promise(async (resolve, reject) => {
		try {
			var timeoutToTransmit;
			var handler = function (channel, gps) {
				if (channel != "gps") return;
				var position: any = rawdataToCoordinates(gps);
				if (!position.coords.latitude) return;
				var criteria = evaluateCriteria(position);
				if (!config || !!criteria) {
					subscriber.off("message", handler);
					position.extras.criteria = criteria;
					resolve(position);
					clearTimeout(timeoutToTransmit);
				}
			};
			subscriber.on("message", handler);
			if (config.time > 0) {
				clearTimeout(timeoutToTransmit);
			}
			subscriber.subscribe("gps");
			if (config.time > 0) {
				timeoutToTransmit = setTimeout(() => {
					subscriber.off("message", handler);
					resolve(rawdataToCoordinates("{}"));
				}, config.time);
			}
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * allows to subscribe to position events in GPS module
 * @param callback handler to execute when new gps position arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 * @param config Object coniguration how evaluate criteria for watchPosition
 */
function watchPosition(callback: Function, errorCallback: Function) {
	try {
		var handler = function (channel, gps) {
			if (channel !== "gps") return;
			var position = rawdataToCoordinates(gps);
			if (!position.coords.latitude) return;
			callback(position, "time");
		};
		subscriber.subscribe("gps");
		subscriber.on("message", handler);
		return {
			unsubscribe: () => {
				subscriber.off("message", handler);
			}
		};

	} catch (error) {

	}
}

/**
 * allows to subscribe to gps data changes in GPS module
 * @param callback handler to execute when new gps data arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 */
function watchGPS(callback, errorCallback: Function) {
	try {
		subscriber.subscribe("gps");
		var cb = function (channel, gps) {
			if (channel !== "gps") return;
			callback(gps);
		};
		subscriber.on("message", cb);
		return {
			unsubscribe: () => {
				subscriber.off("message", cb);
			}
		};
	} catch (error) {
		if (errorCallback) errorCallback(error);
		else console.error(error);
	}
}

/**
 * define a tracking resolution using apx-tracking tool to receive filtered data gps
 * @param callback callback to execute when new data arrive from tracking resolution
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
async function watchTrackingResolution(callback, { distance = 0, heading = 0, time = 0, namespace, prefix, deleteOnExit = true, posAcc = 0, negAcc = 0, posUnits = "", negUnits = "" }) {
	
	if (!prefix) {
		prefix = Utils.getPrefix();
	}
	if (!namespace) {
		throw "Namespace is required";
	}
	var name = `${prefix}_${namespace}`;
	posUnits = posUnits || "";
	negUnits = negUnits || "";

	if (!(!heading && !time && !distance)) {
		//Utils.OSExecute(`apx-tracking set  --namespace="${name}" --heading=${heading} --time=${time} --distance=${distance} --pacc=${posAcc}${posUnits} --nacc=${negAcc}${negUnits}`); // Adde accel variables
		const command = `apx-tracking set --namespace="${name}" --heading=${heading} --time=${time} --distance=${distance} --pacc=${posAcc}${posUnits} --nacc=${negAcc}${negUnits}`;
		try {
		  await Utils.OSExecute(command);
		} catch (error) {
		  console.error('Error executing tracking command:', error);
		}
	}
	
	var handler = function (channel, gps) {
		if (channel !== `tracking/notification/${name}`) return;
		var position = rawdataToCoordinates(gps);
		callback(position, position.extras.criteria);
	};
	subscriber.subscribe(`tracking/notification/${name}`);

	subscriber.on("message", handler);
	if (deleteOnExit) {
		function exitHandler() {
			process.stdin.resume();
			Utils.OSExecute(`apx-tracking delete "${name}"`);
			setTimeout(() => {
				process.exit();
			}, 10);
		}
		//do something when app is closing
		process.on("exit", exitHandler);
		//catches ctrl+c event
		process.on("SIGINT", exitHandler);
		// catches "kill pid" (for example: nodemon restart)
		process.on("SIGUSR1", exitHandler);
		process.on("SIGUSR2", exitHandler);
		//catches uncaught exceptions
		process.on("uncaughtException", exitHandler);
	}
	return {
		unsubscribe: () => {
			Utils.OSExecute(`apx-tracking delete "${name}"`);
			subscriber.off("message", handler);
			subscriber.unsubscribe(`tracking/notification/${name}`);
		}
	};
}

/**
 *  get all the active tracking resolutions`in the apex tol apx-tracking
 * @param prefixed prefix to lookup tracking_resolution
 */
async function getActiveTrackingsResolutions(prefixed = "") {
	var tracks: any = await Utils.OSExecute(`apx-tracking getall`);
	var response = {};
	for (const key in tracks) {
		if (!key.startsWith(prefixed)) continue;
		const track = tracks[key];
		response[key] = { heading: track[0], time: track[1], distance: track[2] };
	}
	return response;
}

const tracking_resolutions = {
	initialized: false,
	names: []
}
function __initExitHandlers() {
	if (tracking_resolutions.initialized) return
	function exitHandler() {
		process.stdin.resume();
		for (let name of tracking_resolutions.names) {
			Utils.OSExecute(`apx-tracking delete "${name}"`);
		}
		setTimeout(() => {
			process.exit();
		}, 10);
	}
	process.on("exit", exitHandler) // self terminate
	process.on("SIGINT", exitHandler) // ctrl+c
	process.on("SIGUSR1", exitHandler) // "kill pid"
	process.on("SIGUSR2", exitHandler) // "kill pid"
	process.on("uncaughtException", exitHandler);
	tracking_resolutions.initialized = true
}

/**
 * set options for a tracking_resolution for the apex tool apx-tracking
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000)
 */
async function setTrackingResolution({ distance=0, heading=0, time=0, namespace, prefix, deleteOnExit=true, posAcc = 0, negAcc = 0, posUnits = "", negUnits = "" }) {
	if (!prefix) {
		prefix = Utils.getPrefix();
	}
	if (!namespace) {
		throw "Namespace is required";
	}
	var name = `${prefix}_${namespace}`;
	posUnits = posUnits || "";
	negUnits = negUnits || "";

	const command = `apx-tracking set --namespace="${name}" --heading=${heading} --time=${time} --distance=${distance} --pacc=${posAcc}${posUnits} --nacc=${negAcc}${negUnits}`;
	try {
	  await Utils.OSExecute(command);
	} catch (error) {
	  console.error('Error executing tracking command:', error);
	}

	//await Utils.OSExecute(`apx-tracking set --namespace="${name}" --heading=${heading} --time=${time} --distance=${distance} --pacc=${posAcc}${posUnits} --nacc=${negAcc}${negUnits}`); // "${name}" ${heading} ${time} ${distance} --pacc=${posAcc} --nacc=${negAcc}
	if (deleteOnExit) {
		tracking_resolutions.names.push(name)
		__initExitHandlers()
	}
	return true;
}

/**
 * get options for a tracking_resolution for the apex tool apx-tracking
 * @param opts tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.
 */
async function getTrackingResolution({ namespace, prefix }) {
	if (!prefix) {
		prefix = Utils.getPrefix();
	}
	if (!namespace) {
		throw "Namespace is required";
	}
	var name = `${prefix}_${namespace}`;
	var resp = await Utils.OSExecute(`apx-tracking get "${name}"`);
	if (!resp[name] || resp[name].length == 0) return null;
	return {
		heading: resp[name][0],
		time: resp[name][1],
		distance: resp[name][2]
	};
}

export default {
	deg2rad,
	distanceBetweenCoordinates,
	getCurrentPosition,
	watchPosition,
	watchGPS,
	watchTrackingResolution,
	setTrackingResolution,
	getTrackingResolution,
	getActiveTrackingsResolutions
};
