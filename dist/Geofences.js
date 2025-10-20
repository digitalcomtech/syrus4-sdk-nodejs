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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("./Utils"));
const lodash_isobjectlike_1 = __importDefault(require("lodash.isobjectlike"));
const Redis_1 = require("./Redis");
const semver_1 = __importDefault(require("semver"));
/**
 * Geofences module
 * @module Geofences
 */
/**
 * Add Geofence to the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * lngLats: array of (lon,lat) coordinate pairs;
 * group: group name;
 * namespace: namespace;
 * type: geofence type could be circular or poly;
 * radius: radius for circular fences, in meters, must be >= 50;
 */
function addGeofence({ name, lngLats, group = "", namespace, type, radius }) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    if (!type)
        type = !!radius ? "circular" : "poly";
    if (type != "poly" && type != "circular")
        throw "unrecognized type of geofence";
    if (Array.isArray(lngLats))
        lngLats = lngLats.map((coord) => coord.join(",")).join(" ");
    return Utils.OSExecute(`apx-geofences add ${namespace} ${group} ${type} ${name} ${radius || ""} ${lngLats}`);
}
/**
 * Update Geofence to the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * lngLats: array of (lon,lat) coordinate pairs;
 * group: group name;
 * namespace: namespace;
 * type: geofence type could be circular or poly;
 * radius: radius for circular fences, in meters, must be >= 50;
 */
function updateGeofence(opts) {
    addGeofence(opts);
}
/**
 * Remove Geofence from the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * group: group name;
 * namespace: namespace;
 */
function removeGeofence({ name, group = "", namespace }) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    return Utils.OSExecute(`apx-geofences remove ${namespace} ${group} ${name}`);
}
/**
 * get all available namespaces
 * @return {*}
 */
async function getNamespaces() {
    return Utils.OSExecute(`apx-geofences getns`);
}
/**
 * Get geofence state from the apx-tool
 * @param opts options hash
 * name: name of the fence;
 * namespace: namespace;
 */
async function get({ namespace = "", name = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var results = await Utils.OSExecute(`apx-geofences getstatus ${namespace}`);
    results = results.map((fence) => {
        if (!fence.name)
            fence.name = fence.geo_name;
        fence.time = new Date(parseInt(fence.time) * 1000);
        return fence;
    });
    if (name) {
        return results.find((fence) => fence.name == name);
    }
    return results;
}
/**
 * Get states from all Geofences for a given namespace
 * @param opts options hash
 * namespace: namespace that belongs of geofence;
 */
async function getAll(opts) {
    return await get(opts);
}
/**
 * remove all Geofences from the namespace
 * @param opts options hash
 * namespace: namespace that belongs of geofence;
 */
async function deleteAll({ namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    return Utils.OSExecute(`apx-geofences remove ${namespace}`);
}
/**
 *
 * @param callback callback to execute when the device enters or exits from a geofence
 * @param errorCb error callback to execute if there is an unexpected error
 * @param opts options hash
 * namespace: namespace to check if entered or exited from geofence;
 */
async function watchGeofencesSpeedLimits(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/notification/warning/${namespace}/*`)
            return;
        try {
            let state = JSON.parse(data);
            if (!(0, lodash_isobjectlike_1.default)(state))
                throw "not objectLike";
            state.is_inside = true;
            callback(state);
        }
        catch (error) {
            console.log("watchGeofencesSpeedLimits Error:", error);
        }
    };
    try {
        Redis_1.SystemRedisSubscriber.psubscribe(`geofences/notification/warning/${namespace}/*`);
        Redis_1.SystemRedisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/notification/warning/${namespace}/*`);
        },
    };
}
/**
 *
 * @param callback callback to execute when the device enters or exits from a geofence
 * @param errorCb error callback to execute if there is an unexpected error
 * @param opts options hash
 * namespace: namespace to check if entered or exited from geofence;
 */
async function watchGeofences(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/notification/${namespace}/*`)
            return;
        var [ns, group, name] = channel
            .replace(`geofences/notification/`, "")
            .split("/");
        var [is_inside, timestamp] = data.split(",");
        callback({
            name: name,
            namespace: ns,
            group: group,
            is_inside: `${is_inside}` == "true",
            timestamp: new Date(parseInt(timestamp) * 1000),
        });
    };
    try {
        Redis_1.SystemRedisSubscriber.psubscribe(`geofences/notification/${namespace}/*`);
        Redis_1.SystemRedisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/notification/${namespace}/*`);
        },
    };
}
/**
 *
 * @param callback callback to execute when the device enters or exits a geofence group
 * @param errorCb error callback to execute if something fails
 * @param opts
 * namespace: namespace to check if entered or exited from group of geofence;
 */
function watchGroups(callback, errorCb, { namespace = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    var handler = function (pattern, channel, data) {
        if (pattern !== `geofences/group/notification/${namespace}/*`)
            return;
        var [ns, group_name] = channel
            .replace(`geofences/group/notification/`, "")
            .split("/");
        var [is_inside, timestamp] = data.split(",");
        callback({
            name: group_name,
            namespace: ns,
            is_inside: `${is_inside}` == "true",
            timestamp: new Date(parseInt(timestamp) * 1000),
        });
    };
    try {
        Redis_1.SystemRedisSubscriber.psubscribe(`geofences/group/notification/${namespace}/*`);
        Redis_1.SystemRedisSubscriber.on("pmessage", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("pmessage", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/group/notification/${namespace}/*`);
        },
    };
}
/**
 * Get the status of geofence groups
 * @param {Object} opts - Options object
 * @param {string} opts.namespace - Namespace to query, defaults to current prefix if not provided
 * @param {string|null} opts.name - Optional group name to filter results
 * @returns {Promise<Array|Object>} Array of group status objects or single group if name is specified
 */
async function getGroupsStatus({ namespace = "", name = null } = {}) {
    if (!namespace) {
        namespace = Utils.getPrefix();
    }
    const versionData = await Utils.OSExecute(`apx-geofences version`);
    const versionString = versionData.version || versionData;
    if (!semver_1.default.gte(versionString, "1.4.2")) {
        console.log("Invalid Geofences version to consult group status.");
        return [];
    }
    var results = await Utils.OSExecute(`apx-geofences groupstatus ${namespace}`);
    results = results.map((group) => {
        return {
            name: group.group,
            namespace: namespace,
            is_inside: group.is_inside,
            timestamp: new Date(group.time * 1000),
        };
    });
    if (name) {
        return results.find((group) => group.name == name);
    }
    return results;
}
/**
 * Watch for geofence removal events
 * @param {Function} callback - Callback function invoked when a geofence is removed
 * @param {Function} errorCb - Error callback function invoked if subscription fails
 * @returns {Object} Object with unsubscribe method to stop watching
 */
function watchRemoves(callback, errorCb) {
    var handler = function (channel, data) {
        if (channel !== `geofences/configuration/remove`)
            return;
        callback(data);
    };
    try {
        Redis_1.SystemRedisSubscriber.subscribe(`geofences/configuration/remove`);
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        errorCb(error);
    }
    return {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            Redis_1.SystemRedisSubscriber.unsubscribe(`geofences/configuration/remove`);
        },
    };
}
exports.default = {
    addGeofence,
    updateGeofence,
    removeGeofence,
    getNamespaces,
    get,
    getAll,
    watchGeofences,
    watchGroups,
    watchGeofencesSpeedLimits,
    deleteAll,
    getGroupsStatus,
    watchRemoves,
};
