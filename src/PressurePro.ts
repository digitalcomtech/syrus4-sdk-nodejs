/**
 * PressurePro module, get information about the TPMS (tire pressure monitoring) gateway
 * @module PressurePro
 */
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

/**
 * Decoded state of a single tire location
 * @interface TyreEvent
 */
export interface TyreEvent {
  sensor_id: number,
  location: number,
  temperature: number,
  psi: number,
  reference_psi: number,
  rf_quality: number,
  new_air: boolean,
  timeout: number,
  alarm_flags: number,
}

/**
 * TpmsEvent published via the broker from the core tool
 * @interface TpmsEvent
 */
export interface TpmsEvent {
  connected: boolean,
  system_epoch: number,
  last_contact: number,
  wheels: number,
  axles: number,
  tires: TyreEvent[],
}

export function getStatus(): Promise<TpmsEvent> {
  return Utils.OSExecute(`apx-serial-pp state`);
}

export function getUnit(): Promise<number> {
  return Utils.OSExecute(`apx-serial-pp get --unit`);
}

export function setUnit(unit: number): Promise<void> {
  if (unit == undefined) throw "Unit required";
  if (!Number.isInteger(unit)) throw "invalid unit, must be an integer";
  if (unit < 0 || unit > 255) throw "invalid unit, min: 0, max: 255";
  return Utils.OSExecute(`apx-serial-pp set --unit=${unit}`);
}

// Tracks active watchers per topic so the shared subscriber connection is only unsubscribed once none remain
const topicWatcherCounts = new Map<string, number>();

export async function onTpmsEvent( callback:(arg: TpmsEvent) => void, errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  const topic = "serial/notification/tpms/state";
  // Get last TPMS data
  let last_data = await getStatus().catch(console.error);

  // Response not void and valid
  if (last_data && (last_data.tires != undefined)) {
    callback(last_data);
  } else {
    // Response not there
    const tpms_event: TpmsEvent = {
      connected: false,
      system_epoch: 0,
      last_contact: 0,
      wheels: 0,
      axles: 0,
      tires: [],
    };
    callback(tpms_event);
  }

  // Subscribe to receive redis updates
  try {
    var state: TpmsEvent;
    var handler = (channel: string, data: any) => {
      if (channel != topic) return
      let clearToSend = true;
      try {
        state = JSON.parse(data);
      } catch (error) {
        clearToSend = false;
        console.info('onTpmsEvent syntax error:', error);
      }

      if (clearToSend) {
        callback(state);
      }

    };
    // Only the first watcher for this topic needs to actually subscribe on the shared connection
    const watcherCount = (topicWatcherCounts.get(topic) ?? 0) + 1;
    topicWatcherCounts.set(topic, watcherCount);
    if (watcherCount === 1) subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onTpmsEvent error:', error);
    errorCallback(error);
  }
  let unsubscribed = false;
  let returnable = {
    unsubscribe: () => {
      if (unsubscribed) return;
      unsubscribed = true;
      subscriber.off("message", handler);
      // Only unsubscribe on the shared connection once the last watcher for this topic is gone
      const watcherCount = (topicWatcherCounts.get(topic) ?? 1) - 1;
      topicWatcherCounts.set(topic, watcherCount);
      if (watcherCount <= 0) {
        topicWatcherCounts.delete(topic);
        subscriber.unsubscribe(topic);
      }
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}
