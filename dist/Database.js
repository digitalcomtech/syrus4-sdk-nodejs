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
 * Logrotate module setup get and set counters from APEX OS
 * @module Database
 */
const Utils = __importStar(require('./Utils'));
async function getStatus(path = '') {
  return await Utils.OSExecute(`apx-db status --database=${path}`);
}
async function query(path = '', command = '') {
  return await Utils.OSExecute(`apx-db query --database=${path} '${command}'`);
}
async function createDatabase(path = '') {
  return await Utils.OSExecute(`apx-db create --database=${path}`)
    .then(response => {
      console.log('createDatabase success:', response);
    })
    .catch(error => {
      console.log('createDatabase error:', error);
    });
}
async function createTable(path = '', tableName = 'default_table') {
  return await Utils.OSExecute(`apx-db create --database=${path} --table=${tableName}`)
    .then(response => {
      console.log('createTable success:', response);
    })
    .catch(error => {
      console.log('createTable error:', error);
    });
}
async function insertRow(path = '', tableName = 'default_table', payload = '') {
  const timestamp = Date.now();
  return await Utils.OSExecute(
    `apx-db write --database=${path} --table=${tableName} --timestamp=${timestamp} --payload='${payload}'`
  )
    .then(response => {
      console.log('insertRow success:', response);
    })
    .catch(error => {
      console.log('insertRow error:', error);
    });
}
async function readFromTo(path = '', tableName = 'default_table', from = 0, to = 100) {
  return await Utils.OSExecute(
    `apx-db read --database=${path} --table=${tableName} --from=${from} --to=${to}`
  );
}
exports.default = { createDatabase, insertRow, createTable, readFromTo, query };
