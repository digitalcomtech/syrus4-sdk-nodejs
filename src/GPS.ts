/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
import * as Redis from "ioredis";
import utils from "./Utils";
var redis = new Redis();
const MAX_TRIES = 3;
var tries = 0;

function rawdataToCoordinates(raw: string) {
	var gps = JSON.parse(raw);
	return {
		coords: {
			latitude: gps.lat,
			longitude: gps.lon,
			speed: gps.speed,
			accuracy: 5 * gps.hdop,
			altitude: gps.alt,
			bearing: gps.track,
			altitudeAccuracy: 5 * gps.vdop
		},
		timestamp: new Date(gps.time).getTime() / 1000,
		extras: {
			hdop: gps.hdop,
			vdop: gps.vdop,
			pdop: gps.pdop,
			quality: gps.quality,
			fix: gps.fix,
			satsActive: gps.satsActive,
			satsVisible: gps.satsVisible
		}
	};
}

function evaluateCriteria(current, last, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }): boolean {
	if (config.accuracy > 0 && current.coords.accuracy > config.accuracy) {
		tries++;
		if (tries > MAX_TRIES) {
			tries = 0;
		} else {
			return false;
		}
	}
	if (!last) return true;
	if (config.distance > 0 && utils.distanceBetweenCoordinates(last, current) > config.distance) return true;
	if (config.time > 0 && new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime() > config.time) return true;
	if (config.bearing > 0 && Math.abs(last.coords.bearing - current.coords.bearing) >= config.bearing) return true;
	return false;
}

/**
 * Get last current location from GPS
 */
async function getCurrentLocation() {
	return rawdataToCoordinates(await redis.get("gps"));
}

/**
 * allows to subscribe to position events in GPS module
 * @param callback handler to execute when new gps position arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 * @param config Object coniguration how evaluate criteria for watchPosition
 */
function watchPosition(callback: Function, errorCallback: Function, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
	var last = null;
	var handler = function(_channel, gps) {
		var position = rawdataToCoordinates(gps);
		if (evaluateCriteria(position, last)) {
			callback(position);
			last = position;
		}
	};
	redis.subscribe("gps");
	redis.on("message", handler);

	return {
		unsubscribe: () => {
			redis.off("gps", handler);
			redis.unsubscribe("gps");
		}
	};
}

/**
 * allows to subscribe to gps data changes in GPS module
 * @param callback handler to execute when new gps data arrives
 * @param errorCallback Errorcallback executes when is unable to get gps location
 */
function watchGPS(callback, errorCallback: Function) {
	redis.subscribe("gps");
	redis.on("message", function(_channel, gps) {
		callback(gps);
	});
	return {
		unsubscribe: () => {
			redis.off("gps", callback);
			redis.unsubscribe("gps");
		}
	};
}

export default {
	getCurrentLocation,
	watchPosition,
	watchGPS
};
