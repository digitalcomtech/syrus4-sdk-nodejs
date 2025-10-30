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
/**
 * Counters module setup get and set counters from APEX OS
 * @module Counters
 */
const Utils = __importStar(require('./Utils'));
async function exists(name) {
  var counters = await Utils.OSExecute(`apx-counter list`);
  return !!counters[`${name}`] || !!counters[`counter_${name}`];
}
const COUNTER_KEYS = [
  'odometer',
  'ignition_time',
  'idle_time',
  'over_speed',
  'over_rpm',
  'hard_brakes',
  'harsh_fwd_acceleration',
  'rpm_threshold',
  'speed_threshold',
  'begin_idle_time',
  'distance',
];
async function startCounters(config) {
  const name = config.name;
  if (!name) throw 'name is required';
  const shouldSet = config.forceSet || !(await exists(name));
  await Utils.OSExecute(`apx-counter start ${name}`);
  if (!shouldSet) return;
  for (const key of COUNTER_KEYS) {
    if (config[key] == undefined) continue;
    console.log('SDK setCounter:', `apx-counter set ${name} ${key.toUpperCase()} ${config[key]}`);
    Utils.OSExecute(`apx-counter set ${name} ${key.toUpperCase()} ${config[key]}`);
  }
}
async function getCounters(name) {
  if (!name) throw 'name is required';
  return await Utils.OSExecute(`apx-counter getall ${name}`);
}
async function watchCounters(name, cb, cbError, interval = 15) {
  if (!name) throw 'name is required';
  if (!(await exists(name))) throw 'counter does not exists';
  try {
    var intervalHandler = setInterval(async () => {
      var results = await getCounters(name);
      cb(results);
    }, interval * 1000);
  } catch (error) {
    cbError(error);
  }
  return {
    off() {
      clearInterval(intervalHandler);
    },
    unsubscribe() {
      clearInterval(intervalHandler);
    },
  };
}
async function stopCounters(name) {
  if (!name) throw 'name is required';
  await Utils.OSExecute(`apx-counter stop ${name}`);
}
async function resetCounters(name) {
  if (!name) throw 'name is required';
  await Utils.OSExecute(`apx-counter reset ${name}`);
}
async function deleteCounters(name) {
  if (!name) throw 'name is required';
  await Utils.OSExecute(`apx-counter delete ${name}`);
}
async function listCounters() {
  var _counters = await Utils.OSExecute(`apx-counter list`);
  var counters = {};
  for (const key in _counters) {
    counters[`${key.replace('counter_', '')}`];
  }
  return counters;
}
async function setCounter(name = 'globals', key = undefined, value = undefined) {
  if (name == undefined) throw 'Counter name is required';
  if (key == undefined) throw 'Counter key is required';
  if (value == undefined) throw 'Counter value is required';
  if (COUNTER_KEYS.indexOf(key) > -1) {
    await Utils.OSExecute(`apx-counter set ${name} ${key.toUpperCase()} ${value}`);
  }
}
exports.default = {
  startCounters,
  stopCounters,
  resetCounters,
  watchCounters,
  listCounters,
  deleteCounters,
  setCounter,
};
