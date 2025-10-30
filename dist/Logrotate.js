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
exports.onLogEvent =
  exports.deleteConfiguration =
  exports.setConfiguration =
  exports.getStatus =
  exports.getConfiguration =
  exports.listConfigurations =
    void 0;
/**
 * Logrotate module setup get and set counters from APEX OS
 * @module Logrotate
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
async function listConfigurations() {
  return JSON.parse(await Utils.OSExecute(`apx-logrotate read --name=all`));
}
exports.listConfigurations = listConfigurations;
async function getConfiguration(name) {
  if (!name) throw 'Name is required';
  return JSON.parse(await Utils.OSExecute(`apx-logrotate read --name=${name}`));
}
exports.getConfiguration = getConfiguration;
async function getStatus(name = 'all') {
  return JSON.parse(await Utils.OSExecute(`apx-logrotate status --name=${name}`));
}
exports.getStatus = getStatus;
async function setConfiguration(
  name,
  path,
  rotate = '1D',
  size = '100MB',
  compress = true,
  headers = ''
) {
  if (!name) throw 'Name is required';
  if (!path) throw 'Path is required';
  const rotation = rotate.slice(0, -1);
  const rotate_size = size.slice(0, -1);
  let period = rotate.slice(1);
  switch (period) {
    case 'H':
      period = 'hourly';
      break;
    case 'D':
      period = 'daily';
      break;
    case 'W':
      period = 'weekly';
      break;
    case 'Y':
      period = 'yearly';
      break;
    default:
      break;
  }
  let response = undefined;
  try {
    if (headers != '') {
      response = await Utils.OSExecute(
        `apx-logrotate configure --name=${name} --path=${path} --rotate=${rotation} --size=${rotate_size} --period=${period} --compress=${compress} --headers=${headers}`
      );
    } else {
      response = await Utils.OSExecute(
        `apx-logrotate configure --name=${name} --path=${path} --rotate=${rotation} --size=${rotate_size} --period=${period} --compress=${compress}`
      );
    }
  } catch (error) {
    console.log('setConfiguration error:', error);
  }
  return response;
}
exports.setConfiguration = setConfiguration;
function deleteConfiguration(name) {
  if (!name) throw 'Name is required';
  return Utils.OSExecute(`apx-logrotate remove --name=${name}`);
}
exports.deleteConfiguration = deleteConfiguration;
async function onLogEvent(callback, errorCallback) {
  const topic = 'logrotate/notification/state';
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
        console.log('onLogEvent syntax error:', error);
      }
      if (clearToSend) {
        callback(state);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error('onLogEvent error:', error);
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
exports.onLogEvent = onLogEvent;
