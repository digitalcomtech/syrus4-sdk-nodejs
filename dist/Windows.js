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
exports.onWindowEvent = exports.deleteWindow = exports.getStatus = exports.setWindow = void 0;
/**
 * Time Windows module setup get and set counters from APEX OS
 * @module Windows
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
async function setWindow(config) {
  console.log('setWindow:', config);
  if (!config.name) throw 'name property is required!';
  let response = undefined;
  try {
    response = await Utils.OSExecute(
      `apx-time-window set --name=${config.name} --type=${config.type} --start=${config.start} --end=${config.end} --from=${config.from} --to=${config.to} --days=${config.days} --timezone=${config.timezone} --enabled=${config.enabled}`
    );
  } catch (error) {
    console.log('setConfiguration error:', error);
  }
  return response;
}
exports.setWindow = setWindow;
async function getStatus(name = 'all') {
  return await Utils.OSExecute(`apx-time-window status --name=${name}`);
}
exports.getStatus = getStatus;
function deleteWindow(name) {
  if (!name) throw 'Name is required';
  return Utils.OSExecute(`apx-time-window remove --name=${name}`);
}
exports.deleteWindow = deleteWindow;
async function onWindowEvent(callback, errorCallback) {
  const topic = 'window/notification/state';
  /**
    const windows_status = await getStatus('all').catch(console.error);
    const window_object = JSON.parse(JSON.stringify(windows_status));
    if (windows_status != undefined) {
        window_object.forEach(element => {
            callback(element);
        });
    }*/
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
        console.log('onWindowEvent syntax error:', error);
      }
      if (clearToSend) {
        callback(state);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error('onWindowEvent error:', error);
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
exports.onWindowEvent = onWindowEvent;
