'use strict';
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
exports.onFuelEvent = exports.setFuelling = exports.setConsumption = exports.getStatus = void 0;
/**
 * Technoton module get information about Technoton fuel level
 * @module Technoton
 */
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
function getStatus() {
  return Utils.OSExecute(`apx-serial-fs status`);
}
exports.getStatus = getStatus;
function setConsumption(threshold, window) {
  if (threshold == undefined) throw 'Consumption threshold required';
  if (window == undefined) throw 'Consumption window required';
  return Utils.OSExecute(
    `apx-serial-fs set --consumption-threshold=${threshold} --consumption-window=${window}`
  );
}
exports.setConsumption = setConsumption;
function setFuelling(threshold) {
  if (threshold == undefined) throw 'Fuelling threshold required';
  return Utils.OSExecute(`apx-serial-fs set --fuelling-threshold=${threshold}`);
}
exports.setFuelling = setFuelling;
async function onFuelEvent(callback, errorCallback) {
  const topic = 'serial/notification/fuel_sensor/state';
  // Get last Fuel data
  let last_data = await getStatus().catch(console.error);
  // Response not void and valid
  if (last_data && last_data.level != undefined) {
    const fuel_event = {
      connected: last_data.state == 'connected' ? true : false,
      frequency: last_data.frequency,
      level: last_data.level,
      temperature: last_data.temperature,
      timestamp: last_data.timestamp,
      event: null,
    };
    callback(fuel_event);
  } else {
    // Response not there
    const fuel_event = {
      connected: false,
      frequency: 0,
      level: 0,
      temperature: 0,
      timestamp: 0,
      event: null,
    };
    callback(fuel_event);
  }
  // Subscribe to receive redis updates
  try {
    var state;
    var handler = (channel, data) => {
      if (channel != topic) return;
      let clearToSend = true;
      try {
        state = JSON.parse(data);
      } catch (error) {
        clearToSend = false;
        console.log('onFuelEvent syntax error:', error);
      }
      if (clearToSend) {
        callback(state);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error('onFuelEvent error:', error);
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
exports.onFuelEvent = onFuelEvent;
