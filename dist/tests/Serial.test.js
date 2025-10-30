'use strict';
//import { expect } from 'chai';
Object.defineProperty(exports, '__esModule', { value: true });
const Redis_1 = require('../Redis');
const Serial_1 = require('../Serial');
const RFID_1 = require('../RFID');
const Technoton_1 = require('../Technoton');
console.log('Begin unit testing');
/***/
describe('Fatigue Tests', () => {
  const TIMEOUT = 60000;
  let watcher;
  let callbacks = {};
  // set up watcher
  before(async function () {
    console.log('setting up watcher');
    watcher = (0, Serial_1.onFatigueEvent)(
      update => {
        for (let key in callbacks) {
          callbacks[key](update);
        }
      },
      error => {
        throw error;
      }
    );
  });
  it('detect fatigue event', function (done) {
    this.timeout(TIMEOUT);
    // register callback
    callbacks['$callback'] = function (update) {
      console.log(update);
      // expect(update[""]).to.exist
      // delete callbacks['$callback']
      // done()
    };
  });
  // cleanup
  after(function () {
    console.log('deregistering watcher');
    watcher.off();
    (0, Redis_1.disconnectAll)();
  });
});
describe('RFID Tests', () => {
  const TIMEOUT = 60000;
  let watcher;
  let callbacks = {};
  // set up watcher
  before(async function () {
    console.log('setting up watcher');
    watcher = await (0, RFID_1.onRFIDEvent)(
      update => {
        console.log('RFID update:', update);
        for (let key in callbacks) {
          callbacks[key](update);
        }
      },
      error => {
        throw error;
      }
    );
  });
  it('detect RFID event', function (done) {
    this.timeout(TIMEOUT);
    // register callback
    callbacks['$callback'] = function (update) {
      console.log(update);
      // expect(update[""]).to.exist
      delete callbacks['$callback'];
      done();
    };
  });
  // cleanup
  after(function () {
    console.log('deregistering watcher');
    watcher.off();
    (0, Redis_1.disconnectAll)();
  });
});
describe('fuel-event-test', () => {
  const TIMEOUT = 60000;
  let watcher;
  let callbacks = {};
  // set up watcher
  before(async function () {
    console.log('setting up watcher');
    watcher = await (0, Technoton_1.onFuelEvent)(
      update => {
        console.log('Fuel event update:', update);
        for (let key in callbacks) {
          callbacks[key](update);
        }
      },
      error => {
        throw error;
      }
    );
  });
  it('Detect Fuel event', function (done) {
    this.timeout(TIMEOUT);
    // register callback
    callbacks['$callback'] = function (update) {
      console.log(update);
      // expect(update[""]).to.exist
      delete callbacks['$callback'];
      done();
    };
  });
  // cleanup
  after(function () {
    console.log('deregistering watcher');
    watcher.off();
    (0, Redis_1.disconnectAll)();
  });
});
