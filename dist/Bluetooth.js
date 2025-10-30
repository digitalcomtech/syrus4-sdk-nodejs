'use strict';
/**
 * Bluetooth module, get information about bluetooth state
 * @module Bluetooth
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.onBleUpdate = exports.onAppConsoleMessage = exports.onBluetoothUpdate = void 0;
const lodash_isobjectlike_1 = __importDefault(require('lodash.isobjectlike'));
const Redis_1 = require('./Redis');
// import * as Utils from "./Utils"
async function onBluetoothUpdate(callback, errorCallback) {
  const topic = 'bluetooth/notification/*';
  try {
    var handler = (pattern, channel, data) => {
      if (!channel.startsWith('bluetooth/notification')) return;
      // TODO: remove eventually
      if (channel == 'bluetooth/notification/MODE') {
        const enabled = data == 'ENABLED' ? true : false;
        callback(channel, { enabled });
        return;
      }
      try {
        const state = JSON.parse(data);
        if (!(0, lodash_isobjectlike_1.default)(state)) throw 'not objectLike';
        callback(channel, state);
      } catch (error) {
        console.log('onBluetoothUpdate error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.on('pmessage', handler);
    Redis_1.SystemRedisSubscriber.psubscribe(topic);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('pmessage', handler);
      Redis_1.SystemRedisSubscriber.punsubscribe(topic);
    },
    off: function () {
      this.unsubscribe();
    },
  };
  return returnable;
}
exports.onBluetoothUpdate = onBluetoothUpdate;
async function onAppConsoleMessage(callback, errorCallback) {
  const topic = 'bluetooth/messages/user_apps_console';
  // const topic = "bluetooth/user_apps_console/MESSAGE"
  // subscribe to receive updates
  try {
    var handler = (channel, data) => {
      if (channel != topic) return;
      callback(data);
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
exports.onAppConsoleMessage = onAppConsoleMessage;
async function onBleUpdate(callback, errorCallback) {
  const topic = 'ble/notification/scan';
  try {
    var handler = (channel, data) => {
      if (!channel.startsWith('ble/notification/scan')) return;
      try {
        const state = JSON.parse(data);
        if (!(0, lodash_isobjectlike_1.default)(state)) throw 'not objectLike';
        callback(state);
      } catch (error) {
        console.log('onBluetoothUpdate error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onBleUpdate error:', error);
    errorCallback(error);
  }
  return {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('message', handler);
      Redis_1.SystemRedisSubscriber.unsubscribe(topic);
    },
    off: () => {
      this.unsubscribe();
    },
  };
}
exports.onBleUpdate = onBleUpdate;
