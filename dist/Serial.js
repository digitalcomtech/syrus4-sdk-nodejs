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
exports.onSerialEvent =
  exports.send =
  exports.setModemBufferSize =
  exports.getModemBufferSize =
  exports.getSerialModemState =
  exports.setSerialMode =
  exports.getSerialMode =
  exports.onFatigueEvent =
    void 0;
/**
 * Serial module, get information about serial state
 * @module Serial
 */
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
// backwards compatability
var Fatigue_1 = require('./Fatigue');
Object.defineProperty(exports, 'onFatigueEvent', {
  enumerable: true,
  get: function () {
    return Fatigue_1.onFatigueEvent;
  },
});
/**
 * get serial mode: Promise<"console"|"modem"|"unmanaged"|"rfid"|"mdt"|"faitgue_sensor"|"fuel_sensor"|"user">
 */
function getSerialMode() {
  return Utils.OSExecute('apx-serial mode');
}
exports.getSerialMode = getSerialMode;
/**
 * set serial mode (console or modem)
 */
function setSerialMode(mode) {
  if (mode.includes('user') || mode.includes('unmanaged')) {
    return Utils.OSExecute(`apx-serial set --mode=${mode}`);
  } else {
    return Utils.OSExecute(`apx-serial mode ${mode}`);
  }
}
exports.setSerialMode = setSerialMode;
/**
 * get serial modem state
 */
function getSerialModemState() {
  return Utils.OSExecute('apx-serial modem state');
}
exports.getSerialModemState = getSerialModemState;
/**
 * get modem buffer size
 */
function getModemBufferSize() {
  return Utils.OSExecute(`apx-serial modem buffer_size`);
}
exports.getModemBufferSize = getModemBufferSize;
/**
 * set the buffer size
 */
function setModemBufferSize(size) {
  if (size < 10 || size > 500) throw 'invalid buffer size, min: 10, max: 500';
  return Utils.OSExecute(`apx-serial modem buffer_size ${size}`);
}
exports.setModemBufferSize = setModemBufferSize;
/**
 * send a message
 */
function send(message, mode = 'console') {
  switch (mode) {
    case 'modem':
      if (!message.length || message.length > 340) throw 'invalid message length (max 340)';
      return Utils.OSExecute(`apx-serial modem send "${message}"`);
      break;
    case 'console':
      return Utils.OSExecute(`apx-serial send --msg="${message}"`);
      break;
    case 'mdt':
      return Utils.OSExecute(`apx-serial-mdt send --msg="${message}"`);
      break;
    case 'unmanaged':
      return Utils.OSExecute(`apx-serial-umg send --msg="${message}"`);
      break;
    case 'user':
      return Utils.OSExecute(`apx-serial-user send --msg="${message}"`);
      break;
    default:
      break;
  }
}
exports.send = send;
async function onSerialEvent(callback, errorCallback) {
  const pattern = 'serial/notification/*';
  // Callback Handler
  const handler = (patt, channel, data) => {
    if (pattern != patt) return;
    let event = {
      topic: channel,
      payload: data,
    };
    callback(event);
  };
  try {
    Redis_1.SystemRedisSubscriber.on('pmessage', handler);
    Redis_1.SystemRedisSubscriber.psubscribe(pattern);
  } catch (error) {
    console.log('onSerialEvent error:', error);
    errorCallback(error);
  }
  return {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('pmessage', handler);
      Redis_1.SystemRedisSubscriber.punsubscribe(pattern);
    },
    off: () => {
      this.unsubscribe();
    },
  };
}
exports.onSerialEvent = onSerialEvent;
