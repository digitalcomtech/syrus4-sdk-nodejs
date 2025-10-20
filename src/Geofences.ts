import * as Utils from "./Utils";
import _isObjectLike from "lodash.isobjectlike";
import { SystemRedisSubscriber as subscriber } from "./Redis";
import semver from "semver";

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

  if (!type) type = !!radius ? "circular" : "poly";
  if (type != "poly" && type != "circular")
    throw "unrecognized type of geofence";
  if (Array.isArray(lngLats))
    lngLats = lngLats.map((coord) => coord.join(",")).join(" ");

  return Utils.OSExecute(
    `apx-geofences add ${namespace} ${group} ${type} ${name} ${
      radius || ""
    } ${lngLats}`
  );
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
  var results: any = await Utils.OSExecute(
    `apx-geofences getstatus ${namespace}`
  );

  results = results.map((fence) => {
    if (!fence.name) fence.name = fence.geo_name;
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
async function watchGeofencesSpeedLimits(
  callback,
  errorCb,
  { namespace = null } = {}
) {
  if (!namespace) {
    namespace = Utils.getPrefix();
  }

  var handler = function (pattern, channel, data) {
    if (pattern !== `geofences/notification/warning/${namespace}/*`) return;
    try {
      let state = JSON.parse(data);
      if (!_isObjectLike(state)) throw "not objectLike";
      state.is_inside = true;
      callback(state);
    } catch (error) {
      console.log("watchGeofencesSpeedLimits Error:", error);
    }
  };
  try {
    subscriber.psubscribe(`geofences/notification/warning/${namespace}/*`);
    subscriber.on("pmessage", handler);
  } catch (error) {
    errorCb(error);
  }
  return {
    unsubscribe: () => {
      subscriber.off("pmessage", handler);
      subscriber.unsubscribe(`geofences/notification/warning/${namespace}/*`);
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
    if (pattern !== `geofences/notification/${namespace}/*`) return;
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
    subscriber.psubscribe(`geofences/notification/${namespace}/*`);
    subscriber.on("pmessage", handler);
  } catch (error) {
    errorCb(error);
  }
  return {
    unsubscribe: () => {
      subscriber.off("pmessage", handler);
      subscriber.unsubscribe(`geofences/notification/${namespace}/*`);
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
    if (pattern !== `geofences/group/notification/${namespace}/*`) return;
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
    subscriber.psubscribe(`geofences/group/notification/${namespace}/*`);
    subscriber.on("pmessage", handler);
  } catch (error) {
    errorCb(error);
  }
  return {
    unsubscribe: () => {
      subscriber.off("pmessage", handler);
      subscriber.unsubscribe(`geofences/group/notification/${namespace}/*`);
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
async function getGroupsStatus({ namespace = "", name = null } = {}): Promise<Array<any> | object> {
  if (!namespace) {
    namespace = Utils.getPrefix();
  }

  const versionData: any = await Utils.OSExecute(`apx-geofences version`);
  const versionString = versionData.version || versionData;
  
  if (!semver.gte(versionString, "1.4.2")) {
    console.log("Invalid Geofences version to consult group status.");
    return [];
  }

  var results: any = await Utils.OSExecute(
    `apx-geofences groupstatus ${namespace}`
  );

  results = results.map(
    (group: { group: string; is_inside: boolean; time: number }) => {
      return {
        name: group.group,
        namespace: namespace,
        is_inside: group.is_inside,
        timestamp: new Date(group.time * 1000),
      };
    }
  );

  if (name) {
    return results.find((group: { name: string }) => group.name == name);
  }

  return results;
}

/**
 * Watch for geofence removal events
 * @param {Function} callback - Callback function invoked when a geofence is removed
 * @param {Function} errorCb - Error callback function invoked if subscription fails
 * @returns {Object} Object with unsubscribe method to stop watching
 */
function watchRemoves(
  callback: (arg0: any) => void,
  errorCb: (arg0: any) => void
): object {
  var handler = function (channel: string, data: string) {
    if (channel !== `geofences/configuration/remove`) return;
    callback(data);
  };

  try {
    subscriber.subscribe(`geofences/configuration/remove`);
    subscriber.on("message", handler);
  } catch (error) {
    errorCb(error);
  }
  return {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(`geofences/configuration/remove`);
    },
  };
}

export default {
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
