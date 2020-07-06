"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const Redis_1 = require("./Redis");
/**
 * System module get information about ApexOS
 * @module System-Info
 */
/**
 * Get Info about the system like RAM,CPU,uptime, etc
 */
function info() {
    return Utils_1.default.OSExecute("apx-about");
}
function modem() {
    return __awaiter(this, void 0, void 0, function* () {
        var response = yield Redis_1.redisClient.hgetall("modem_information");
        return response;
    });
}
/**
 * hanlder to detect power save mode and execute callback 15 seconds before the device goes to sleep
 * @param callback callback to execute when power save mode is on and device is about to turn off
 * @param errorCallback callbac to execute in case of any error
 */
function onSleepOn(callback, errorCallback) {
    try {
        var handler = (channel, raw) => {
            if (channel !== "interface/notification/PSM" && channel !== "interface/notification/PSM_ACTIVATED")
                return;
            callback(raw);
        };
        Redis_1.redisSubscriber.subscribe("interface/notification/PSM");
        Redis_1.redisSubscriber.subscribe("interface/notification/PSM_ACTIVATED");
        Redis_1.redisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    var returnable = {
        unsubscribe: () => {
            Redis_1.redisSubscriber.off("message", handler);
        }
    };
    returnable.off = returnable.unsubscribe;
    return returnable;
}
/**
 * Get the latest wakeup reason and timestamp from sleep on from APEX OS
 */
function getLastWakeUp() {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield Redis_1.redisClient.lrange("psm_events", 0, 5);
        if (data.length === 0)
            return false;
        for (const entry of data) {
            if (entry.indexOf("PSM_ACTIVATED,") == -1) {
                var parts = entry.split(",");
                var unix = parts.pop();
                return {
                    wakeup_reason: parts[0],
                    reasons: parts,
                    timestamp: new Date(parseInt(unix) * 1000)
                };
            }
        }
        return false;
    });
}
/**
 * Get the latest time from  sleep on event from APEX OS
 */
function getlastSleepOn() {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield Redis_1.redisClient.lrange("psm_events", 0, 5);
        if (data.length === 0)
            return false;
        for (const entry of data) {
            if (entry.indexOf("PSM_ACTIVATED,") != -1) {
                var parts = entry.split(",");
                var unix = parts.pop();
                return {
                    event: "wakeup",
                    timestamp: new Date(parseInt(unix) * 1000)
                };
            }
        }
        return false;
    });
}
/**
 * Get the list of latets sleep on and wakeup events with reason and timestamp
 */
function getWakeUpList() {
    return __awaiter(this, void 0, void 0, function* () {
        var list = [];
        var data = yield Redis_1.redisClient.lrange("psm_events", 0, 5);
        if (data.length === 0)
            return [];
        for (const entry of data) {
            if (entry.indexOf("PSM_ACTIVATED,") == -1) {
                let parts = entry.split(",");
                let unix = parts.pop();
                list.push({
                    wakeup_reason: parts[0],
                    reasons: parts,
                    timestamp: new Date(parseInt(unix) * 1000),
                    event: "wakeup",
                });
            }
            else {
                let parts = entry.split(",");
                let unix = parts.pop();
                list.push({
                    timestamp: new Date(parseInt(unix) * 1000),
                    event: "sleep",
                });
            }
        }
        return list;
    });
}
exports.default = { info, modem, onSleepOn, getLastWakeUp, getlastSleepOn, getWakeUpList };
