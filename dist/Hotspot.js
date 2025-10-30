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
 * Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS
 * @module Hotspot
 */
const Utils = __importStar(require('./Utils'));
/**
 * returns the list of the connected clients to the hotspot
 */
function list() {
  return Utils.OSExecute('apx-hotspot', 'list');
}
/**
 * returns the state of the connected clients to the hotspot
 */
function state() {
  return Utils.OSExecute('apx-hotspot', 'state');
}
/**
 * start the hotspot service, also stop wifi service
 */
function start() {
  return Utils.OSExecute('apx-hotspot', 'start');
}
/**
 *  stops the hotspot service
 */
function stop() {
  return Utils.OSExecute('apx-hotspot', 'stop');
}
/**
 *  executes a stop-start in the same call
 */
function reset() {
  return Utils.OSExecute('apx-hotspot', 'reset');
}
/**
 * Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface
 * @param netInterface Interface you ant allow internet access default="ppp0"
 */
function route(netInterface = 'ppp0') {
  return Utils.OSExecute('apx-hotspot', 'route', netInterface);
}
/**
 * edits the parameter received in the hotspot configuration file. <br>
 * Example apx-hotspot edit wpa_passphrase myNewPass1234
 * Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"
 * @param parameter param to edit config
 * @param newValue new value for the parameter
 */
function edit(parameter = 'wpa_passphrase', newValue) {
  return Utils.OSExecute('apx-hotspot', parameter, newValue);
}
exports.default = { list, state, start, stop, reset, route, edit };
