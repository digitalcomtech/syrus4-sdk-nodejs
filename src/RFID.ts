/**
 * RFID module get information about RFID states
 * @module RFID
 */

import _isObjectLike from 'lodash.isobjectlike'
import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"


/**
 * RFIDEvent published via the broker from the core tools
 * @interface RFIDEvent
 */
export interface RFIDEvent {
  id: string | null,
  alias: string | null,
  whitelisted: boolean | false,
  conn_epoch: number,
}

/**
 * Event published by the sdk composed of multiple RFID
 * authorized contains events from RFID
 * @class RFIDUpdate
 */
export class RFIDUpdate{
  // TODO: alias lookups form initial fetch + publishes
  // alias: {[alias: string]: IButtonEvent}
    public last?: RFIDEvent;
    public authorized: {
        last?: RFIDEvent;
    }

    constructor() {
        this.last = null;
        this.authorized = {};
    }

    public digest( event: RFIDEvent ) {
        this.last = event;
        if ( event?.whitelisted ) {
            this.authorized.last = event;
        }
        return this
    }

}

// TODO: Check getAll()
export function getAll(): Promise<RFIDEvent[]> {
  return Utils.OSExecute(`apx-serial-rfid list`);
}

export function getLast(): Promise<RFIDEvent>{
  return Utils.OSExecute(`apx-serial-rfid get --last`);
}

export function clearLast(): Promise<RFIDEvent>{
  return Utils.OSExecute(`apx-serial-rfid clear --last`);
}

export function setRFIDAlias(id: string, alias: string): Promise<void>{
  if(alias == "") throw "Alias Name is required";
  if(id == "") throw "RFID id is required";
  return Utils.OSExecute(`apx-serial set --id=${id} --alias=${alias}`);
}

export function removeAlias(id: string): Promise<void>{
  if(id == "") throw "Id is required";
  return Utils.OSExecute(`apx-serial-rfid remove --id=${id}`);
}

export function removeAll(): Promise<void>{
  return Utils.OSExecute('apx-serial-rfid remove --all');
}

export async function onRFIDEvent( 
  callback:(arg: RFIDUpdate) => void, 
  errorCallback:(arg: Error) => void) : Promise<{ unsubscribe: () => void, off: () => void}> {
  
    const topic = "serial/notification/rfid/state";
    const topic2 = "rfid/notification/state";

  // GET last RFID data
  let rfid_update = new RFIDUpdate()
  let last_rfid_event = await getLast().catch(console.error)
  if(last_rfid_event) {
    callback(rfid_update.digest(last_rfid_event))
  }
  // Subscribe to receive updates
 
    var state: RFIDEvent;
    var handler = (channel: string, data: any) => {
      if ( channel =="serial/notification/rfid/state" || channel == "rfid/notification/state") {
        try {
          state = JSON.parse(data);
          if (!_isObjectLike(state)) throw 'not objectLike'
          callback(rfid_update.digest(state))
        } catch (error) {
          console.log('onRFIDevent syntax error:', error);
        }
      }
    };

  try { 
    subscriber.subscribe(topic, topic2);
    subscriber.on("message", handler);

  } catch (error) {
    console.error('onRFIDEvent error:', error);
    errorCallback(error);
  }


  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic, topic2);
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}


