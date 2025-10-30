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
exports.onPulseEvent = exports.getLast = void 0;
/**
 * Logrotate module setup get and set counters from APEX OS
 * @module PulseCounter
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
async function getLast() {
  try {
    const pulse = await Utils.OSExecute(`apx-io pulse_counter --status`).catch(console.error);
    const pulseCount = JSON.parse(JSON.stringify(pulse));
    return pulseCount.count;
  } catch (error) {
    console.log('getLastPulseCount error:', error);
    return 0;
  }
}
exports.getLast = getLast;
async function onPulseEvent(callback, errorCallback) {
  const topic = 'interface/pulse_counter/*'; // update and event
  // Get the current state of pulse counter
  try {
    await getLast()
      .then(response => {
        const lastPulseEvent = {
          topic: 'interface/pulse_counter/update',
          payload: response,
        };
        callback(lastPulseEvent);
      })
      .catch(console.error);
  } catch (error) {
    console.log('onPulseEvent error:', error);
  }
  // Subscribe to receive redis updates
  try {
    var handler = (pattern, channel, data) => {
      if (!channel.startsWith('interface/pulse_counter/')) return;
      callback({ topic: channel, payload: data });
    };
    Redis_1.SystemRedisSubscriber.psubscribe(topic);
    Redis_1.SystemRedisSubscriber.on('pmessage', handler);
  } catch (error) {
    console.error('onPulseEvent error:', error);
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
exports.onPulseEvent = onPulseEvent;
