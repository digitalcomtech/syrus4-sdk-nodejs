/**
 * Temperature module get information about temperature sensors
 * @module Temperature
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

/**
 * TemperatureEvent published via the broker from the core tools
 * @interface TemperatureEvent
 */
interface TemperatureEvent {
  id: string | null
  alias: string
  value: number
  connected: boolean
  epoch: number
}

/**
 * Event published by the sdk composed of multiple TemperatureEvents
 * authorized object contains events from whitelisted ibuttons
 * @class TemperatureUpdate
 */
export class TemperatureUpdate{
  public last?: TemperatureEvent
  public aliases: {[alias: string]: TemperatureEvent}
  public sensors: {[id: string]: TemperatureEvent}
  public sensor_list: TemperatureEvent[]

  constructor(){
    this.last = null
    this.aliases = {}
    this.sensors = {}
    this.sensor_list = []
  }

  public digest(event: TemperatureEvent){
    if (event.alias?.length){
      this.aliases[event.alias] = event
    }
    this.sensors[event.id] = event
    if (!this.last || this.last?.epoch < event.epoch){
      this.last = event
    }
    let replaced = false
    for (const index in this.sensor_list) {
      let sensor = this.sensor_list[index]
      if (sensor.id == event.id){
        this.sensor_list[index] = event
        replaced = true
        break
      }
    }
    if (!replaced){
      this.sensor_list.push(event)
    }
    return this
  }
}

/**
 * get the current temperature state
 */
export function getTemperatures(): Promise<{temperatures: TemperatureEvent[]}>{
  return Utils.OSExecute("apx-onewire temperature get_all");
}

/**
 * get reading from a specific sensor, by id or alias
 */
export function getTemperature(lookup:string): Promise<TemperatureEvent>{
  if (lookup.length > 50) throw "alias is too long (max 50)";
  return Utils.OSExecute(`apx-onewire temperature get ${lookup}`);
}

/**
 * set alias to a temperature sensor
 */
export function setTemperatureAlias(sensorId: string, alias: string): Promise<void>{
  if(alias.length > 50) throw "alias is too long (max 50)";
  if(sensorId.length != 15) throw "sensorId must be 15 characters long";
  return Utils.OSExecute(`apx-onewire temperature add ${alias} ${sensorId}`);
}

/**
 * remove alias from temperature sensor
 */
export function removeTemperatureAlias(lookup: string): Promise<void>{
  if (lookup.length > 50) throw "alias is too long (max 50)";
  return Utils.OSExecute(`apx-onewire temperature remove ${lookup}`);
}

/**
 * remove aliases from all temperature sensors
 */
export function removeTemperatureAliases(): Promise<void> {
  return Utils.OSExecute(`apx-onewire temperature remove_all`);
}

/**
 * monitor temperature notifications
 */
export async function onTemperatureChange(
  callback: (arg: TemperatureUpdate)=> void,
  errorCallback: (arg: Error)=> void): Promise<{unsubscribe: ()=>void, off: ()=> void}>{
  const topic = "onewire/notification/temperature/state"
  // execute callback with last data
  const update = new TemperatureUpdate()
  try{
    var state = await getTemperatures()
  } catch (error){
    throw error
  }
  if(state?.temperatures) {
    state.temperatures.map((temp)=>{update.digest(temp)})
    callback(update)
  }
  // set up subscribe to receive updates
  try {
    var handler = (channel:string, raw:string) => {
      if (channel != topic) return
      let data = JSON.parse(raw)
      callback(update.digest(data))
    };
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: function(){ this.unsubscribe() }
  };
  return returnable;
}
