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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.onModemChange = exports.set = exports.getInfo = void 0;
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
const System_1 = __importDefault(require('./System'));
/**
 * returns a JSON with the configured values in RF
 */
function getInfo() {
  return Utils.OSExecute('apx-mdm state');
}
exports.getInfo = getInfo;
/**
 * Use this option to configure the network variable for mobile networks
 * @param key the paramter to be configured, posible values are: "apn", "user", "pin", "pass"
 * @param value the new value of the parameter
 */
function set(key, value) {
  if (key == 'pin' && value.length != 4) {
    return new Promise((_resolve, reject) => {
      reject('Pin must be exaclty four characters');
    });
  }
  return Utils.OSExecute('apx-mdm', key, value);
}
exports.set = set;
async function onModemChange(callback, errorCallback) {
  const topic = 'modem/notification/*';
  // subscribe to receive updates
  try {
    var state = await System_1.default.modem();
    var handler = (pattern, channel, data) => {
      if (pattern != topic) return;
      let key = channel.split('/')[2];
      if ('VOICE_CALL,SMS_RX'.includes(key)) data = JSON.parse(data);
      state[key] = data;
      state['TOPIC'] = channel;
      callback(state);
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
exports.onModemChange = onModemChange;
