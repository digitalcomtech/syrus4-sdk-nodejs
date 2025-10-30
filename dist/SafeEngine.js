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
exports.onSafeEngineEvent = exports.getStatus = exports.setEngineCutOff = void 0;
/**
 * SafeEngine module setup get and set Safe engine cut of from APEX OS
 * @module SafeEngine
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
async function setEngineCutOff(config) {
  let response = undefined;
  try {
    response = await Utils.OSExecute(`apx-seco set ${config}`);
  } catch (error) {
    console.log('SafeEngine setCutOff error:', error);
  }
  return response;
}
exports.setEngineCutOff = setEngineCutOff;
async function getStatus() {
  return await Utils.OSExecute('apx-seco status');
}
exports.getStatus = getStatus;
async function onSafeEngineEvent(callback, errorCallback) {
  const topic = 'seco/notification/state';
  // Get last state
  //const lastSecoState = await getStatus().catch(console.error);
  //const lastSecoObject = JSON.parse(JSON.stringify(lastSecoState));
  //if (lastSecoState != undefined) {
  //     callback(lastSecoObject);
  //}
  // Callback Handler
  const handler = (channel, data) => {
    if (channel != topic) return;
    const event = JSON.parse(data);
    callback(event);
  };
  try {
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onSafeEngineEvent error:', error);
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
exports.onSafeEngineEvent = onSafeEngineEvent;
