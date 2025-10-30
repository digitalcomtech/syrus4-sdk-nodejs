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
const Utils = __importStar(require('./Utils'));
/**
 * WIFI module to interacte with the enable/disable WIFI mode  with Apex OS
 * @module WIFI
 */
/**
 * It starts a WIFI scan and returns a list of SSIDs
 */
function scan() {
  return Utils.OSExecute('apx-wifi', 'scan');
}
/**
 * It returns the wifi status
 */
function state() {
  return Utils.OSExecute('apx-wifi', 'state');
}
/**
 * It returns the list of networks configured
 */
function list() {
  return Utils.OSExecute('apx-wifi', 'list');
}
/**
 * It enables the WIFI interface and starts the service for connecting with preconfigured networks
 */
function start() {
  return Utils.OSExecute('apx-wifi', 'start');
}
/**
 *  It stops the WIFI service and disables the interface
 */
function stop() {
  return Utils.OSExecute('apx-wifi', 'stop');
}
/**
 * It executes a stop-start in the same call
 */
function reset() {
  return Utils.OSExecute('apx-wifi', 'reset');
}
/**
 * It adds a new network to the WIFI configuration file, in this case you have to include the SSID and psk as parameters. Example apx-wifi add myNet myPass
 * @param ssid The name of SSID you want to connect
 * @param password the password of the SSID
 */
function add(ssid, password) {
  return Utils.OSExecute('apx-wifi', 'add', `"${ssid}"`, `"${password}"`);
}
/**
 * It removes a network from the WIFI configuration file, in this case you have to include the SSID as parametes
 * @param ssid Name of the SSID you want to remove
 */
function remove(ssid) {
  return Utils.OSExecute('apx-wifi', 'remove', `"${ssid}"`);
}
exports.default = { scan, state, list, start, stop, reset, add, remove };
