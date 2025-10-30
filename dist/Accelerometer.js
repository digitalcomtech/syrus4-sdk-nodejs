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
/**
 * Accelerometer module get information about hardware acceleration and events in ApexOS
 * @module Accelerometer
 */
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
const lodash_isobjectlike_1 = __importDefault(require('lodash.isobjectlike'));
/**
 * Watch the motion state of the Syrus Apex accceleration hardware module
 * @param callback callback to executed when motion state changes
 * @param errorCallback callback to execute in case of error
 */
function onMotionChange(callback, errorCallback) {
  try {
    var handler = (channel, raw) => {
      if (channel != 'accel/events') return;
      var [eventType, isMoving] = raw.split(',');
      if (eventType == 'MOTION') {
        callback(isMoving == '1');
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe('accel/events');
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  var returnable = {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('message', handler);
      Redis_1.SystemRedisSubscriber.unsubscribe('accel/events');
    },
  };
  returnable.off = returnable.unsubscribe;
  return returnable;
}
/**
 * Watch for accelerations events in Apex OS. possible events:
 * FORWARD_COLLISION, BACKWARD_COLLISION, LAT_COLLISION_FROM_RIGHT, LAT_COLLISION_FROM_LEFT, HARSH_FWD_ACCELERATION, HARD_BRAKING, CORNERING_RIGHT, CORNERING_LEFT
 * @param callback callback to executed when new acceleration event received
 * @param errorCallback callback to execute in case of error
 */
function on(callback, errorCallback) {
  try {
    var handler = (channel, raw) => {
      if (channel != 'accel/events') return;
      var [eventType, ...results] = raw.split(',');
      if (eventType != 'MOTION') callback(eventType.toLowerCase(), results);
    };
    Redis_1.SystemRedisSubscriber.subscribe('accel/events');
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  var returnable = {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('message', handler);
      Redis_1.SystemRedisSubscriber.unsubscribe('accel/events');
    },
  };
  returnable.off = returnable.unsubscribe;
  return returnable;
}
/**
 * Set the state for the auto alignment procces of the APEX OS acceleration hardware
 * @param state desired state of auto alignment proccess
 */
function startAutoAlignment(state = true) {
  return Utils.OSExecute(`apx-imu self_alignment ${state ? 1 : 0}`);
}
/**
 * Set the state for the self acceleration test of the APEX OS acceleration hardware
 * @param state desired state of self acceleration test proccess
 */
function startSelfAccelerationTest(state = true) {
  return Utils.OSExecute(`apx-imu self_test ${state ? 1 : 0}`);
}
/**
 * check is hardware is on state auto aligning returns a promise with the state
 */
async function isAutoAligning() {
  return Utils.OSExecute('apx-imu self_alignment');
}
/**
 * check is hardware is on state acceleration test returns a promise with the state
 */
async function isAccelerationTest() {
  return Utils.OSExecute('apx-imu self_test');
}
/**
 * Check the current state of the acceloremeter hardware is moving
 */
async function isMoving() {
  var result = await Redis_1.SystemRedisClient.hget('accel_current_state', 'MOTION');
  return result == '1';
}
async function onAccelUpdate(callback, errorCallback) {
  const topic = 'accel/report';
  try {
    var handler = (channel, data) => {
      if (!channel.startsWith('accel/report')) return;
      try {
        const state = JSON.parse(data);
        if (!(0, lodash_isobjectlike_1.default)(state)) throw 'not objectLike';
        callback(state);
      } catch (error) {
        console.log('onAccelUpdate error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onAccelUpdate error:', error);
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
exports.default = {
  isMoving,
  onMotionChange,
  on,
  startAutoAlignment,
  startSelfAccelerationTest,
  isAutoAligning,
  isAccelerationTest,
  onAccelUpdate,
};
