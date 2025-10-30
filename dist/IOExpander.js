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
exports.onIOExpanderEvent = exports.setState = exports.setOutput = exports.getLast = void 0;
/**
 * Logrotate module setup get and set counters from APEX OS
 * @module IOExpander
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
const lodash_isobjectlike_1 = __importDefault(require('lodash.isobjectlike'));
async function getLast() {
  try {
    return await Utils.OSExecute(`apx-onewire iosexpander status`);
  } catch (error) {
    console.log('getLastIOExpander error:', error);
    return { connected: false };
  }
}
exports.getLast = getLast;
async function setOutput(name, value = true) {
  if (!name) throw 'Name is required';
  const ioName = name.toLocaleUpperCase();
  return await Utils.OSExecute(`apx-onewire iosexpander set ${ioName} ${value}`);
}
exports.setOutput = setOutput;
async function setState(name) {
  if (!name) throw 'Name is required';
  const ioName = name.toLocaleUpperCase();
  return await Utils.$to(Utils.OSExecute(`apx-onewire iosexpander get ${ioName}`));
}
exports.setState = setState;
async function onIOExpanderEvent(callback, errorCallback) {
  const topic = 'onewire/notification/iosexpander/*';
  // Get the current state of the IOExpander
  try {
    await getLast()
      .then(response => {
        const state = JSON.parse(JSON.stringify(response));
        const last_io_event = {
          topic: 'onewire/notification/iosexpander/update',
          payload: state,
        };
        callback(last_io_event);
      })
      .catch(console.error);
  } catch (error) {
    console.log('onIOExpanderEvent error:', error);
  }
  // Subscribe to receive redis updates
  try {
    var handler = (patthern, channel, data) => {
      if (!channel.startsWith('onewire/notification/iosexpander')) return;
      try {
        const state = JSON.parse(data);
        if (!(0, lodash_isobjectlike_1.default)(state)) throw 'not JSON';
        callback({ topic: channel, payload: state });
      } catch (error) {
        console.log('onIOExpanderEvent syntax error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.psubscribe(topic);
    Redis_1.SystemRedisSubscriber.on('pmessage', handler);
  } catch (error) {
    console.error('onIOExpanderEvent error:', error);
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
exports.onIOExpanderEvent = onIOExpanderEvent;
