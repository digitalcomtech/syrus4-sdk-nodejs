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
 * Apps module to start/stop/enable/disable/install third parts apps running in apex-os
 * @module Apps
 */
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const Utils = __importStar(require('./Utils'));
// Environment
let { APP_DATA_FOLDER } = process.env;
let { SYRUS4G_APP_DATA_DIR, SYRUS4G_APP_CONF_FILE } = process.env;
if (!SYRUS4G_APP_DATA_DIR) SYRUS4G_APP_DATA_DIR = '/data/app_data';
if (!SYRUS4G_APP_CONF_FILE) SYRUS4G_APP_CONF_FILE = '.configuration.json';
/**
 * allows to execute commands from the apps-manager utility from ApexOs
 * @param action action to execute
 * @param app the name of the App
 * @param zipPath the zip location under where unzip the app
 * @param instance
 * @param ver
 */
function execute(action, app = null, zipPath = null, instance = null, ver = null) {
  return Utils.OSExecute('syrus-apps-manager', action, instance, app, zipPath, ver);
}
/***************************************************************************************************
 * Apps
 **************************************************************************************************/
/**
 *  Allows to install an app receive as parameter the name of the app and the zip
 *  location or the data of the zip in question.
 * @param zipPath the zip location
 */
function installApp(zipPath) {
  if (!zipPath) {
    return Promise.reject(new Error('zipPath is required'));
  }
  return new Promise((resolve, reject) => {
    fs.access(zipPath, fs.constants.F_OK, err => {
      if (err) {
        return reject(new Error('App ZIP file does not exist.'));
      } else {
        return execute('install-app', zipPath).then(resolve).catch(reject);
      }
    });
  });
}
/**
 * Uninstall and deletes the data from an app
 * @param app the name of the app
 * @param ver
 */
function uninstallApp(app, ver) {
  return execute('delete-app', app, ver);
}
/**
 * Lists all the installed applications.
 *
 * This function executes the "list-apps" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of the command execution.
 *
 * @returns A promise that resolves with the list of installed applications.
 */
function listApps() {
  return execute('list-apps');
}
/***************************************************************************************************
 * Instances
 **************************************************************************************************/
/**
 * Creates an instance of an application.
 *
 * This function executes the "create-instance" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of the command execution.
 *
 * @param {string} name - The name of the instance to create.
 * @param {string} app - The name of the application.
 * @param {string} ver - The version of the application.
 * @returns A promise that resolves with the result of the instance creation.
 */
function createInstance(name, app, ver) {
  return execute('create-instance', app, null, name, ver);
}
/**
 * Deletes an instance of an application.
 *
 * This function executes the "delete-instance" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of the instance deletion.
 *
 * @param {string} name - The name of the instance to delete.
 * @returns A promise that resolves with the result of the instance deletion.
 */
function deleteInstance(name) {
  return execute('delete-instance', name);
}
/**
 * Lists all instances of an application.
 *
 * This function executes the "list-instances" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the list of instances.
 *
 * @returns A promise that resolves with the list of instances.
 */
function listInstances() {
  return execute('list-instances');
}
/**
 * Starts an instance of an application.
 *
 * This function executes the "start-instance" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of starting the instance.
 *
 * @param {string} name - The name of the instance to start.
 * @returns A promise that resolves with the result of starting the instance.
 */
function startInstance(name) {
  return execute('start', name);
}
/**
 * Stops an instance of an application.
 *
 * This function executes the "stop-instance" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of stopping the instance.
 *
 * @param {string} name - The name of the instance to stop.
 * @returns A promise that resolves with the result of stopping the instance.
 */
function stopInstance(name) {
  return execute('stop', name);
}
/**
 * Restarts an instance of an application.
 *
 * This function executes the "restart-instance" action using the `execute` function
 * from the `Utils` module. It returns a promise that resolves with the result
 * of restarting the instance.
 *
 * @param {string} name - The name of the instance to restart.
 * @returns A promise that resolves with the result of restarting the instance.
 */
function restartInstance(name) {
  return execute('restart', name);
}
/**
 * write .env file configuration of the app, if the .env exists, replace it
 * @param app the name of the app
 * @param newConfig
 */
function setConfiguration(app, newConfig) {
  if (!app) {
    app = Utils.getPrefix();
  }
  return new Promise((resolve, reject) => {
    let conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE);
    fs.writeFile(conf_path, newConfig, function (err) {
      if (err) reject(err);
      resolve({ status: 'ok' });
    });
  });
}
/**
 * Get the contents of SYRUS4G_APP_CONF_FILE file where it stored the configuration of the app
 * @param app the name of the app
 */
function getConfiguration(app) {
  if (!app) {
    app = Utils.getPrefix();
  }
  return new Promise((resolve, reject) => {
    try {
      let conf_path;
      if (
        APP_DATA_FOLDER === null || APP_DATA_FOLDER === void 0 ? void 0 : APP_DATA_FOLDER.length
      ) {
        conf_path = path.join(APP_DATA_FOLDER, SYRUS4G_APP_CONF_FILE);
      } else {
        conf_path = path.join(SYRUS4G_APP_DATA_DIR, app, SYRUS4G_APP_CONF_FILE);
      }
      let data = fs.readFileSync(conf_path);
      resolve(JSON.parse(data.toString()));
    } catch (error) {
      reject(error);
    }
  });
}
exports.default = {
  installApp,
  uninstallApp,
  listApps,
  createInstance,
  deleteInstance,
  listInstances,
  startInstance,
  stopInstance,
  restartInstance,
  getConfiguration,
  setConfiguration,
};
