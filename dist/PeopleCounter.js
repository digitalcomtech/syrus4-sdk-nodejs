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
exports.onPeopleCountingEvent = exports.getStatus = void 0;
/**
 * PeopleCounter module setup get and set Safe engine cut of from APEX OS
 * @module PeopleCounter
 */
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
async function getStatus({ from, to, type }) {
  if (!from) throw 'peopleCounting getStatus error: from required';
  if (!to) throw 'peopleCounting getStatus error: to required';
  if (!type) throw 'peopleCounting getStatus error: type required';
  return await Utils.OSExecute(`apx-ndm-pc report --from=${from} --to=${to} --type=${type}`);
}
exports.getStatus = getStatus;
async function onPeopleCountingEvent(callback, errorCallback) {
  const topic = 'ndm/notification/people_counting/event';
  // Callback handler
  const handler = (channel, data) => {
    if (channel != topic) return;
    const obj = JSON.parse(data);
    const event = obj;
    callback(event);
  };
  try {
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onPeopleCouningEvent error:', error);
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
exports.onPeopleCountingEvent = onPeopleCountingEvent;
