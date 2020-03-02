/**
 * GPS module get information about gps and location in ApexOS
 * @module GPS
 */
import * as Redis from "ioredis";
import utils from "./Utils";
const MAX_TRIES = 3;
const SPEED_THRESHOLD = 3;
var redis = new Redis();
var tries = 0;
function rawdataToCoordinates(raw: string) {
	var gps = JSON.parse(raw);
	return {
		coords: {
			latitude: gps.lat,
			longitude: gps.lon,
			speed: gps.speed >= SPEED_THRESHOLD ? gps.speed : 0,
			accuracy: 5 * gps.hdop,
			altitude: gps.alt,
			bearing: gps.speed >= SPEED_THRESHOLD ? gps.track : 0,
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

function evaluateCriteria(current, last = null, config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }): boolean {
	if (config.accuracy > 0 && current.coords.accuracy > config.accuracy) {
		tries++;
		if (tries > MAX_TRIES) {
			tries = 0;
			return true;
		} else {
			return false;
		}
	}

	if (!last) return true;
	var criteria = config.distance == 0 && config.time == 0 && config.bearing == 0;
	var distance = utils.distanceBetweenCoordinates(last, current);
	var secs = Math.abs(new Date(current.timestamp).getTime() - new Date(last.timestamp).getTime()) / 1000;
	var bearing = Math.abs(last.coords.bearing - current.coords.bearing);
	if (config.distance > 0 && distance >= config.distance) criteria = true;
	if (config.time > 0 && secs >= config.time) criteria = true;
	if (config.bearing > 0 && bearing >= config.bearing) criteria = true;
	return criteria;
}

/**
 * Get last current location from GPS
 */
function getCurrentPosition(config = { accuracy: 0, distance: 0, time: 0, bearing: 0 }) {
	return new Promise((resolve, reject) => {
		var sub = new Redis();
		var handler = function(_channel, gps) {
			var position = rawdataToCoordinates(gps);
			if (evaluateCriteria(position)) {
				resolve(position);
				sub.off("gps", handler);
			}
		};
		sub.subscribe("gps");
		sub.on("message", handler);
	});
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
		if (evaluateCriteria(position, last, config)) {
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
	getCurrentPosition,
	watchPosition,
	watchGPS
};
