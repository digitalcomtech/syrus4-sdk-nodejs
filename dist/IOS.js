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
 * IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
 * @module IOS
 */
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
/**
 * Allow to subcribe to changes in a input or output accepts sub patterns
 * @param inputName input or patter to subscribe
 * @param cb callback execute everytime the input state changed, first argument contains the new state
 * @param errorCallback
 */
function watchInputState(inputName = '*', cb, errorCallback) {
  let chn = `interface/input/${inputName}`;
  if (inputName == '*') {
    chn = `interface/*`;
  } else if (inputName[0] == 'O') {
    chn = `interface/output/${inputName}`;
  } else if (inputName[0] == 'A') {
    chn = `interface/analog/${inputName}`;
  }
  let callback = function (pattern, channel, raw) {
    if (pattern != chn) return;
    if (channel.includes('/desired')) return;
    let input = channel.split('/')[2];
    if (inputName == '*' || input == inputName) {
      let returnable = raw;
      if (raw == 'true') returnable = true;
      if (raw == 'false') returnable = false;
      let response = {};
      response[input] = returnable;
      cb(response);
    }
  };
  Redis_1.SystemRedisSubscriber.psubscribe(chn);
  Redis_1.SystemRedisSubscriber.on('pmessage', callback);
  return {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('pmessage', callback);
    },
  };
}
/**
 * get a promise that resolve the current input or output state
 * @param inputName the input/output requested
 */
async function getInputState(inputName = 'IGN') {
  var response = await Utils.OSExecute(`apx-io get ${inputName}`);
  return Boolean(response);
}
/**
 * Allow to change the state of an output
 * @param inputName the output to change state
 * @param state the new state  of the output
 */
async function setOutputState(inputName = 'OUT1', state = true) {
  await Utils.OSExecute(`apx-io set ${inputName} ${state}`);
  return `${state}` == 'true';
}
/**
 * Get the current state of all inputs, outputs and analogs in the Syrus4 device
 */
async function getAll() {
  let [inputs, ierr] = await Utils.$to(Utils.OSExecute(`apx-io getall inputs`));
  let [outputs, oerr] = await Utils.$to(Utils.OSExecute(`apx-io getall outputs`));
  let [analogs, anerror] = await Utils.$to(Utils.OSExecute(`apx-io getall analogs`));
  if (ierr) {
    inputs = {};
    console.error(ierr);
  }
  if (oerr) {
    outputs = {};
    console.error(oerr);
  }
  if (anerror) {
    analogs = {};
    console.error(anerror);
  }
  return { ...inputs, ...outputs, ...analogs };
}
exports.default = {
  watchInputState,
  getInputState,
  setOutputState,
  getAll,
};
