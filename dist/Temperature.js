'use strict';
/**
 * Temperature module get information about temperature sensors
 * @module Temperature
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.onTemperatureChange =
  exports.removeTemperatureAliases =
  exports.removeTemperatureAlias =
  exports.setTemperatureAlias =
  exports.getTemperature =
  exports.getTemperatures =
  exports.TemperatureUpdate =
    void 0;
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
/**
 * Event published by the sdk composed of multiple TemperatureEvents
 * authorized object contains events from whitelisted ibuttons
 * @class TemperatureUpdate
 */
class TemperatureUpdate {
  constructor() {
    this.last = null;
    this.aliases = {};
    this.sensors = {};
    this.sensor_list = [];
  }
  digest(event) {
    var _a, _b;
    if ((_a = event.alias) === null || _a === void 0 ? void 0 : _a.length) {
      this.aliases[event.alias] = event;
    }
    this.sensors[event.id] = event;
    if (
      !this.last ||
      ((_b = this.last) === null || _b === void 0 ? void 0 : _b.epoch) < event.epoch
    ) {
      this.last = event;
    }
    let replaced = false;
    for (const index in this.sensor_list) {
      let sensor = this.sensor_list[index];
      if (sensor.id == event.id) {
        this.sensor_list[index] = event;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      this.sensor_list.push(event);
    }
    return this;
  }
}
exports.TemperatureUpdate = TemperatureUpdate;
/**
 * get the current temperature state
 */
function getTemperatures() {
  return Utils.OSExecute('apx-onewire temperature get_all');
}
exports.getTemperatures = getTemperatures;
/**
 * get reading from a specific sensor, by id or alias
 */
function getTemperature(lookup) {
  if (lookup.length > 50) throw 'alias is too long (max 50)';
  return Utils.OSExecute(`apx-onewire temperature get ${lookup}`);
}
exports.getTemperature = getTemperature;
/**
 * set alias to a temperature sensor
 */
function setTemperatureAlias(sensorId, alias) {
  if (alias.length > 50) throw 'alias is too long (max 50)';
  if (sensorId.length != 15) throw 'sensorId must be 15 characters long';
  return Utils.OSExecute(`apx-onewire temperature add ${alias} ${sensorId}`);
}
exports.setTemperatureAlias = setTemperatureAlias;
/**
 * remove alias from temperature sensor
 */
function removeTemperatureAlias(lookup) {
  if (lookup.length > 50) throw 'alias is too long (max 50)';
  return Utils.OSExecute(`apx-onewire temperature remove ${lookup}`);
}
exports.removeTemperatureAlias = removeTemperatureAlias;
/**
 * remove aliases from all temperature sensors
 */
function removeTemperatureAliases() {
  return Utils.OSExecute(`apx-onewire temperature remove_all`);
}
exports.removeTemperatureAliases = removeTemperatureAliases;
/**
 * monitor temperature notifications
 */
async function onTemperatureChange(callback, errorCallback) {
  const topic = 'onewire/notification/temperature/state';
  // execute callback with last data
  const update = new TemperatureUpdate();
  try {
    var state = await getTemperatures();
  } catch (error) {
    throw error;
  }
  if (state === null || state === void 0 ? void 0 : state.temperatures) {
    state.temperatures.map(temp => {
      update.digest(temp);
    });
    callback(update);
  }
  // set up subscribe to receive updates
  try {
    var handler = (channel, raw) => {
      if (channel != topic) return;
      let data = JSON.parse(raw);
      callback(update.digest(data));
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('message', handler);
      Redis_1.SystemRedisSubscriber.unsubscribe(topic);
    },
    off: function () {
      this.unsubscribe();
    },
  };
  return returnable;
}
exports.onTemperatureChange = onTemperatureChange;
