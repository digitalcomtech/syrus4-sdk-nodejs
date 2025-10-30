'use strict';
/**
 * IButton module get information about onewire
 * @module IButton
 */
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
exports.onIButtonChange =
  exports.removeIButtonAlias =
  exports.setIButtonAlias =
  exports.getLast =
  exports.getIButton =
  exports.getIButtons =
  exports.IButtonUpdate =
    void 0;
const Redis_1 = require('./Redis');
const Utils = __importStar(require('./Utils'));
/**
 * Event published by the sdk composed of of multiple IButtonEvent
 * authorized contains events from whitelisted ibuttons
 * @class IButtonUpdate
 */
class IButtonUpdate {
  // TODO: alias lookups form initial fetch + publishes
  // alias: {[alias: string]: IButtonEvent}
  constructor() {
    this.authorized = {};
    this.last = null;
    this.connected = null;
  }
  digest(event) {
    this.last = event;
    if (event.connected) this.connected = event;
    else this.connected = null;
    this.last = event;
    if (event.whitelisted) {
      this.authorized.last = event;
      if (event.connected) this.authorized.connected = event;
      else this.authorized.connected = null;
    }
    return this;
  }
}
exports.IButtonUpdate = IButtonUpdate;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getIButtons() {
  return Utils.OSExecute('apx-onewire ibutton getall');
}
exports.getIButtons = getIButtons;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function getIButton(iButton) {
  if (iButton == '') throw 'iButton is required';
  return Utils.OSExecute(`apx-onewire ibutton get ${iButton}`);
}
exports.getIButton = getIButton;
function getLast() {
  return Utils.OSExecute(`apx-onewire ibutton get_last`);
}
exports.getLast = getLast;
/**
 * allow to get al lthe state of the ibuttons connected
 */
function setIButtonAlias(iButton, aliasName) {
  if (aliasName == '') throw 'Alias Name is required';
  if (iButton == '') throw 'iButton is required';
  return Utils.OSExecute(`apx-onewire ibutton create ${iButton} ${aliasName}`);
}
exports.setIButtonAlias = setIButtonAlias;
/**
 * remove Alias from ibutton whitelist
 */
function removeIButtonAlias(aliasName) {
  if (aliasName == '') throw 'aliasName is required';
  return Utils.OSExecute(`apx-onewire ibutton delete ${aliasName}`);
}
exports.removeIButtonAlias = removeIButtonAlias;
/**
 * monitor iButton notifications
 */
async function onIButtonChange(callback, errorCallback) {
  const topic = 'onewire/notification/ibutton/state';
  // execute callback with last data
  let ib_update = new IButtonUpdate();
  let last_ib_event = await getLast().catch(console.error);
  if (last_ib_event) {
    callback(ib_update.digest(last_ib_event));
  }
  // set up subscribe to receive updates
  try {
    var handler = (channel, raw) => {
      if (channel != topic) return;
      let data = JSON.parse(raw);
      callback(ib_update.digest(data));
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  var returnable = {
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
exports.onIButtonChange = onIButtonChange;
