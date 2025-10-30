'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.onSegmentEvent = void 0;
const Redis_1 = require('./Redis');
function tryJSONParse(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.log('segments json error:', error);
    return {};
  }
}
async function onSegmentEvent(callback, errorCallback) {
  const topic = 'segments/report/update';
  // Callback handler
  const handler = (channel, data) => {
    if (channel != topic) return;
    const obj = tryJSONParse(data);
    const event = obj;
    callback(event);
  };
  try {
    Redis_1.SystemRedisSubscriber.subscribe(topic);
    Redis_1.SystemRedisSubscriber.on('message', handler);
  } catch (error) {
    console.log('onSegmentEvent error:', error);
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
exports.onSegmentEvent = onSegmentEvent;
