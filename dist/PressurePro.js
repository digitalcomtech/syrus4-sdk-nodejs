"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTpmsEvent = exports.setUnit = exports.getUnit = exports.getStatus = void 0;
/**
 * PressurePro module, get information about the TPMS (tire pressure monitoring) gateway
 * @module PressurePro
 */
const Redis_1 = require("./Redis");
const Utils = __importStar(require("./Utils"));
function getStatus() {
    return Utils.OSExecute(`apx-serial-pp state`);
}
exports.getStatus = getStatus;
function getUnit() {
    return Utils.OSExecute(`apx-serial-pp get --unit`);
}
exports.getUnit = getUnit;
function setUnit(unit) {
    if (unit == undefined)
        throw "Unit required";
    if (unit < 0 || unit > 255)
        throw "invalid unit, min: 0, max: 255";
    return Utils.OSExecute(`apx-serial-pp set --unit=${unit}`);
}
exports.setUnit = setUnit;
async function onTpmsEvent(callback, errorCallback) {
    const topic = "serial/notification/tpms/state";
    // Get last TPMS data
    let last_data = await getStatus().catch(console.error);
    // Response not void and valid
    if (last_data && (last_data.tires != undefined)) {
        callback(last_data);
    }
    else {
        // Response not there
        const tpms_event = {
            connected: false,
            system_epoch: 0,
            last_contact: 0,
            wheels: 0,
            axles: 0,
            tires: [],
        };
        callback(tpms_event);
    }
    // Subscribe to receive redis updates
    try {
        var state;
        var handler = (channel, data) => {
            if (channel != topic)
                return;
            let clearToSend = true;
            try {
                state = JSON.parse(data);
            }
            catch (error) {
                clearToSend = false;
                console.info('onTpmsEvent syntax error:', error);
            }
            if (clearToSend) {
                callback(state);
            }
        };
        Redis_1.SystemRedisSubscriber.subscribe(topic);
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error('onTpmsEvent error:', error);
        errorCallback(error);
    }
    let returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(topic);
        },
        off: function () { this.unsubscribe(); }
    };
    return returnable;
}
exports.onTpmsEvent = onTpmsEvent;
