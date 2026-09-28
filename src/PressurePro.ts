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
  if (unit < 0 || unit > 255) throw "invalid unit, min: 0, max: 255";
  return Utils.OSExecute(`apx-serial-pp set --unit=${unit}`);
}

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
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error('onTpmsEvent error:', error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}
