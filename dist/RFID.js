"use strict";
/**
 * RFID module get information about RFID states
 * @module RFID
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRFIDEvent = exports.removeAll = exports.removeAlias = exports.setRFIDAlias = exports.clearLast = exports.getLast = exports.getAll = exports.RFIDUpdate = void 0;
const lodash_isobjectlike_1 = __importDefault(require("lodash.isobjectlike"));
const Redis_1 = require("./Redis");
const Utils = __importStar(require("./Utils"));
/**
 * Event published by the sdk composed of multiple RFID
 * authorized contains events from RFID
 * @class RFIDUpdate
 */
class RFIDUpdate {
    constructor() {
        this.last = null;
        this.authorized = {};
    }
    digest(event) {
        this.last = event;
        if (event === null || event === void 0 ? void 0 : event.whitelisted) {
            this.authorized.last = event;
        }
        return this;
    }
}
exports.RFIDUpdate = RFIDUpdate;
// TODO: Check getAll()
function getAll() {
    return Utils.OSExecute(`apx-serial-rfid list`);
}
exports.getAll = getAll;
function getLast() {
    return Utils.OSExecute(`apx-serial-rfid get --last`);
}
exports.getLast = getLast;
function clearLast() {
    return Utils.OSExecute(`apx-serial-rfid clear --last`);
}
exports.clearLast = clearLast;
function setRFIDAlias(id, alias) {
    if (alias == "")
        throw "Alias Name is required";
    if (id == "")
        throw "RFID id is required";
    return Utils.OSExecute(`apx-serial set --id=${id} --alias=${alias}`);
}
exports.setRFIDAlias = setRFIDAlias;
function removeAlias(id) {
    if (id == "")
        throw "Id is required";
    return Utils.OSExecute(`apx-serial-rfid remove --id=${id}`);
}
exports.removeAlias = removeAlias;
function removeAll() {
    return Utils.OSExecute('apx-serial-rfid remove --all');
}
exports.removeAll = removeAll;
async function onRFIDEvent(callback, errorCallback) {
    const topic = "serial/notification/rfid/state";
    const topic2 = "rfid/notification/state";
    // GET last RFID data
    let rfid_update = new RFIDUpdate();
    let last_rfid_event = await getLast().catch(console.error);
    if (last_rfid_event) {
        callback(rfid_update.digest(last_rfid_event));
    }
    // Subscribe to receive updates
    var state;
    var handler = (channel, data) => {
        if (channel == "serial/notification/rfid/state" || channel == "rfid/notification/state") {
            try {
                state = JSON.parse(data);
                if (!(0, lodash_isobjectlike_1.default)(state))
                    throw 'not objectLike';
                callback(rfid_update.digest(state));
            }
            catch (error) {
                console.log('onRFIDevent syntax error:', error);
            }
        }
    };
    try {
        Redis_1.SystemRedisSubscriber.subscribe(topic, topic2);
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error('onRFIDEvent error:', error);
        errorCallback(error);
    }
    let returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(topic, topic2);
        },
        off: function () { this.unsubscribe(); }
    };
    return returnable;
}
exports.onRFIDEvent = onRFIDEvent;
