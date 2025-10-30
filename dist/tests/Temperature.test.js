'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const chai_1 = require('chai');
const Redis_1 = require('../Redis');
const Temperature_1 = require('../Temperature');
console.log('Begin unit testing');
describe('Temperature Tests', function () {
  const TIMEOUT = 60000;
  let watcher;
  let last_update;
  let callbacks = {};
  // set up watcher
  before(async function () {
    this.timeout(TIMEOUT);
    console.log('setting up watcher');
    watcher = await (0, Temperature_1.onTemperatureChange)(
      temp_event => {
        last_update = temp_event;
        console.log('received temperature update', temp_event);
        for (let key in callbacks) {
          callbacks[key](temp_event);
        }
      },
      error => {
        throw error;
      }
    );
  });
  it('detect temperature', function () {
    (0, chai_1.expect)(last_update.last.value).to.exist;
  });
  it('detect aliased temperature', function () {
    (0, chai_1.expect)(last_update.aliases['office'].value).to.exist;
  });
  it('detect temperature update', function (done) {
    this.timeout(TIMEOUT);
    //register callback
    callbacks['update'] = function (update) {
      (0, chai_1.expect)(update.last.value).to.exist;
      delete callbacks['update'];
      done();
    };
    console.log('SEND TEMP UPDATE...');
  });
  // cleanup
  after(function () {
    console.log('deregistering watcher');
    watcher === null || watcher === void 0 ? void 0 : watcher.off();
    (0, Redis_1.disconnectAll)();
  });
});
