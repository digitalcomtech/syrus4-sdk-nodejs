/**
 * Serial module, get information about serial state
 * @module Serial
 */
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

// backwards compatability
export { onFatigueEvent } from './Fatigue'

/**
 * TemperatureEvent published via the broker from the core tools
 * @interface TemperatureEvent
 */
interface ModemEvent {
  type: "satcom" | "console" | "fatigue_sensor" | "mdt",
  id: number,
  pack: string,
  version: string,
  signal: number,
  state: "connected",
  msg_st: number,
  buff_size: number,
  buff_count: number,
}

/**
 * get serial mode: Promise<"console"|"modem"|"unmanaged"|"rfid"|"mdt"|"faitgue_sensor"|"fuel_sensor"|"user">
 */
export function getSerialMode(){
  return Utils.OSExecute("apx-serial mode");
}

/**
 * set serial mode (console or modem)
 */
export function setSerialMode(mode: 'modem' | 'console' | 'mdt' | 'fatigue_sensor' | 'fuel_sensor' | 'rfid' | 'unmanaged' | 'user' | 'pressurepro' ): Promise<ModemEvent> {
    if ( mode.includes('user') || mode.includes('unmanaged') ) {
      return Utils.OSExecute(`apx-serial set --mode=${mode}`);
    } else {
      return Utils.OSExecute(`apx-serial mode ${mode}`);
    }
}

/**
 * get serial modem state
 */
export function getSerialModemState(): Promise<ModemEvent> {
  return Utils.OSExecute("apx-serial modem state");
}

/**
 * get modem buffer size
 */
export function getModemBufferSize(): Promise<number> {
  return Utils.OSExecute(`apx-serial modem buffer_size`);
}

/**
 * set the buffer size
 */
export function setModemBufferSize(size:number): Promise<void> {
  if (size < 10 || size > 500) throw "invalid buffer size, min: 10, max: 500";
  return Utils.OSExecute(`apx-serial modem buffer_size ${size}`);
}

/**
 * send a message
 */
export function send(message:string, mode:string = 'console'): Promise<void>{
    switch (mode) {
      case 'modem':
          if (!message.length || message.length > 340) throw "invalid message length (max 340)";
          return Utils.OSExecute(`apx-serial modem send "${message}"`);
        break;

      case 'console':
        return Utils.OSExecute(`apx-serial send --msg="${message}"`);
      break;

      case 'mdt':
        return Utils.OSExecute(`apx-serial-mdt send --msg="${message}"`);
      break;

      case 'unmanaged':
        return Utils.OSExecute(`apx-serial-umg send --msg="${message}"`);
      break;

      case 'user':
        return Utils.OSExecute(`apx-serial-user send --msg="${message}"`);
      break;

      default:
        break;
    }

}

interface SerialEvent {
  topic: string,
  payload: string | null,
}

export async function onSerialEvent(
  callback: (arg: SerialEvent) => void,
  errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {

  const pattern = "serial/notification/*"

  // Callback Handler
  const handler = (patt:string, channel: string, data: any) => {
    if (pattern != patt) return;

    let event: SerialEvent = {
      topic: channel,
      payload: data,
    };
    callback(event);
  }

  try {
      subscriber.on("pmessage", handler);
      subscriber.psubscribe(pattern);
  } catch (error) {
      console.log("onSerialEvent error:", error );
      errorCallback(error);
  }

  return {
    unsubscribe: () => {
			subscriber.off("pmessage", handler);
			subscriber.punsubscribe(pattern);
    },
    off: function () { this.unsubscribe() }
  }
}

