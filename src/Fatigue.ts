/**
 * Fatigue module, get fatigue sensor information and events
 * @module Fatigue
 */

import { SystemRedisSubscriber as subscriber } from "./Redis";
import * as Utils from "./Utils"

interface FatigueState {
  state: "connected" | "disconnected",
  max_photos: number,
  nbr_photos: number,
  sensitivity: number,
  speaker_volume: number,
  min_speed: number,
  speeding: number,
  auto_upload: 1 | 0,
  latest_photo: string,
  photos: object,
  epoch: number,
  event: string,
  channel: string,
  media: object | null,
}
export async function onFatigueEvent(
  callback: (arg: FatigueState) => void,
  errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
  const serial_state_topic = "serial/notification/fatigue_s/state"
  const serial_photo_topic = "serial/notification/fatigue_s/photo"
  const serial_event_topic = "serial/notification/fatigue_s/event"
  const mdsm7_topic = "fatigue/notification/mdsm7"
  const mdsm7_topic_update = "ndm/notification/mdsm7/update"
  const mdsm7_topic_event = "ndm/notification/mdsm7/event"
  const cipia_topic_update = "ndm/notification/cipia/update"
  const cipia_topic_event = "ndm/notification/cipia/event"
  const all_topics = [
    serial_state_topic, serial_photo_topic,
    mdsm7_topic, mdsm7_topic_event, mdsm7_topic_update,
    cipia_topic_event, cipia_topic_update,serial_event_topic,
  ]
  // subscribe to receive updates
  try {
    var state: FatigueState = await Utils.OSExecute('apx-serial fatigue_sensor state')
    state.photos = {}
    state.channel = 'serial'
    if (state.latest_photo) {
      state.channel = 'serial'
      state.epoch = Number(state.latest_photo.split('-')[0])
      state.event = state.latest_photo.split('-')[1].split('.')[0]
    }
    callback(state)
    var handler = (channel: string, data: any) => {
      if (!all_topics.includes(channel)) return
      if (channel == serial_state_topic) {
        state.channel = 'serial'
        state.state = data
      }
      if (channel == serial_photo_topic) {
        let photo_type = data.split('-')[1].split('.')[0]
        state.latest_photo = data
        state.photos[photo_type] = data
      }
      if (state.latest_photo) {
        state.channel = 'serial'
        state.epoch = Number(state.latest_photo.split('-')[0])
        state.event = state.latest_photo.split('-')[1].split('.')[0]
      }
      if (channel == serial_event_topic) {
        data = JSON.parse(data)
        state.channel = 'serial'
        state.epoch = data.system_epoch
        state.event = data.event
      }
      if ([mdsm7_topic, mdsm7_topic_event].includes(channel)) {
        data = JSON.parse(data)
        state.channel = 'mdsm7'
        state.epoch = data.system_epoch
        state.event = data.event
      }
      if (channel == mdsm7_topic_update) {
        data = JSON.parse(data)
        state.channel = 'mdsm7'
        state = {...state, ...data}
      }
      if (channel == cipia_topic_event) {
        data = JSON.parse(data)
        state.channel = 'cipia'
        state.epoch = data.system_epoch
        state.event = data.event
        state = { ...state, ...data }
      }
      if (channel == cipia_topic_update) {
        data = JSON.parse(data)
        state.channel = 'cipia'
        state = { ...state, ...data }
      }
      state.media = data.media || null
      callback(state)
    };
    all_topics.map((t)=>subscriber.subscribe(t))
    subscriber.on("message", handler);
  } catch (error) {
    console.error(error);
    errorCallback(error);
  }
  let returnable = {
    unsubscribe: () => {
      subscriber.off("message", handler)
      all_topics.map((t) => subscriber.unsubscribe(t))
    },
    off: function () { this.unsubscribe() }
  };
  return returnable;
}
