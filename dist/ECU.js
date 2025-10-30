'use strict';
/**
 * ECU module get information about EcU monitor and vehicle in ApexOS
 * @module ECU
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.onEcuConfigChangeEvent =
  exports.onECUWarningEvent =
  exports.getECUList =
  exports.getECUParams =
  exports.watchECUParams =
  exports.getECUInfo =
    void 0;
const fs = __importStar(require('fs'));
const tag_params_1 = require('tag-params');
const Utils = __importStar(require('./Utils'));
const Redis_1 = require('./Redis');
const lodash_isobjectlike_1 = __importDefault(require('lodash.isobjectlike'));
let { SYRUS4G_APP_NAME, APP_DATA_FOLDER } = process.env;
/**
 * ECU PARAM LIST from the ecu monitor
 */
async function getECUInfo() {
  var resp = await Utils.OSExecute(`apx-ecu configure`);
  var resp2 = await Redis_1.SystemRedisClient.hgetall(`ecumonitor_current_state`);
  return {
    primary_can: resp.PRIMARY_CAN,
    secondary_can: resp.SECONDARY_CAN,
    J1708: resp.J1708,
    listen_only_mode: resp.LISTEN_ONLY_MODE,
    version: resp2.ECUMONITOR_VERSION,
  };
}
exports.getECUInfo = getECUInfo;
function template(strings, ...keys) {
  let result = [strings[0]];
  keys.forEach((key, i) => {
    result.push(key, strings[i + 1]);
  });
  return result.join('');
}
/**
 *  allows to subscribe for ECU parameter changes
 * @param cb calbback to execute when new ECU data arrives
 * @param errorCallback errorCallback when something wrong goes with the subscription
 */
function watchECUParams(cb, errorCallback) {
  let ECU_PARAM_LIST = getECUList();
  const errors_cache = {};
  const error_pgn = 'feca_3-6';
  try {
    var handler = async (channel, raw) => {
      if (channel != 'ecumonitor/parameters') return;
      const ecu_values = {};
      raw.split('&').map(param => {
        const [key, value] = param.split('=');
        const element = ECU_PARAM_LIST[key] || {};
        const { $name, $tokenizer, $itemizer, $item_name, $signals } = element;
        // save values directly, even if broken down
        let fvalue = isNaN(Number(value)) ? value : Number(value);
        if ($name) {
          ecu_values[$name] = fvalue;
        }
        if (fvalue && Array.isArray($signals)) {
          $signals.map(signal => (ecu_values[`@${signal}`] = true));
        }
        ecu_values[key] = fvalue;
        if (!($tokenizer || $itemizer)) return;
        if (!value.includes($tokenizer)) return;
        let tokens;
        let regex = /(?<value>.*)/;
        if ($itemizer) {
          regex = new RegExp($itemizer);
        }
        tokens = [value];
        if ($tokenizer) {
          tokens = value.split($tokenizer);
        }
        for (const token of tokens) {
          try {
            let skey = $name;
            let { groups } = regex.exec(token);
            let tags;
            if ($item_name) {
              tags = (0, tag_params_1.params)($item_name, groups);
              skey = `${template(...tags)}`;
            }
            let svalue = isNaN(Number(groups.value)) ? groups.value : Number(groups.value);
            ecu_values[skey] = svalue;
          } catch (error) {
            console.error({ error, key, token, regex });
          }
        }
      });
      // handle error codes
      const encoded_error = ecu_values[error_pgn];
      if (encoded_error) {
        let error_codes = { spn: 0, fmi: 0, cm: 0, oc: 0 };
        let cached = errors_cache[encoded_error];
        if (!cached) {
          let [decoded, decoded_error] = await Utils.$to(
            Utils.OSExecute(`apx-ecu decode --unique_id=${error_pgn} --value=${encoded_error}`)
          );
          if (decoded_error) console.error(decoded_error);
          if (decoded) {
            cached = errors_cache[encoded_error] = decoded;
          }
        }
        error_codes = { ...error_codes, ...cached };
        ecu_values['error_codes'] = error_codes;
      }
      cb(ecu_values);
    };
    Redis_1.SystemRedisSubscriber.subscribe('ecumonitor/parameters');
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  const returnable = {
    unsubscribe: () => {
      Redis_1.SystemRedisSubscriber.off('message', handler);
    },
  };
  returnable.off = returnable.unsubscribe;
  return returnable;
}
exports.watchECUParams = watchECUParams;
/**
 * Get all the most recent data from ECU parameters
 */
async function getECUParams() {
  const ecu_params = await Utils.OSExecute('apx-ecu list_parameters');
  const ecu_values = {};
  for (const key in ecu_params) {
    const value = ecu_params[key];
    ecu_values[`${key}`] = isNaN(Number(value)) ? value : Number(value);
  }
  return ecu_values;
}
exports.getECUParams = getECUParams;
/**
 * get ecu paramas list associated to all the pgn and id for ecu and taip tag associated
 */
function getECUList(reload = false) {
  // Try to find EcuImports.json if not present fall back to ECU.d local.json
  if (fs.existsSync('/data/users/syrus4g/ecumonitor/EcuImports.json')) {
    let parameters = {};
    try {
      let sharedEcuList = fs
        .readFileSync('/data/users/syrus4g/ecumonitor/EcuImports.json')
        .toString();
      sharedEcuList = JSON.parse(sharedEcuList);
      // Convert it to object
      const paramArray = {};
      Object.assign(paramArray, sharedEcuList);
      for (const parameterNumber in paramArray) {
        const id = paramArray[parameterNumber].$id;
        parameters[id] = paramArray[parameterNumber];
      }
    } catch (error) {
      console.log('getECUList error:', error);
    }
    return parameters;
  } else {
    // Download and load ECU tags
    console.log('getEcuList: EcuImports.json file not found');
    return {};
  }
}
exports.getECUList = getECUList;
async function onECUWarningEvent(callback, errorCallback) {
  const topic = 'ecumonitor/notification/warning';
  try {
    var handler = (channel, data) => {
      if (!channel.startsWith('ecumonitor/notification/warning')) return;
      try {
        const state = JSON.parse(data);
        if (!(0, lodash_isobjectlike_1.default)(state)) throw 'not objectLike';
        callback(state);
      } catch (error) {
        console.log('onECUWarningEvent error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onECUWarningEvent error:', error);
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
exports.onECUWarningEvent = onECUWarningEvent;
/* Inform that ecumonitor configuration file changed */
async function onEcuConfigChangeEvent(callback, errorCallback) {
  const topic = 'ecumonitor/notification/newconfig';
  try {
    var handler = (channel, data) => {
      if (!channel.startsWith('ecumonitor/notification/newconfig')) return;
      try {
        console.log('onEcuConfigChangeEvent:', data);
        const state = {
          hash: data,
          folderName: APP_DATA_FOLDER,
        };
        callback(state);
      } catch (error) {
        console.log('onEcuConfigurationChangeEvent error:', error);
      }
    };
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onEcuConfigurationChangeEvent error:', error);
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
exports.onEcuConfigChangeEvent = onEcuConfigChangeEvent;
exports.default = {
  getECUParams,
  getECUList,
  watchECUParams,
  getECUInfo,
  onECUWarningEvent,
  onEcuConfigChangeEvent,
};
