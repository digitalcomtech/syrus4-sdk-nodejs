"use strict";
/**
 * Fatigue module, get fatigue sensor information and events
 * @module Fatigue
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onFatigueEvent = void 0;
const Redis_1 = require("./Redis");
const Utils = __importStar(require("./Utils"));
async function onFatigueEvent(callback, errorCallback) {
    const serial_state_topic = "serial/notification/fatigue_s/state";
    const serial_photo_topic = "serial/notification/fatigue_s/photo";
    const serial_event_topic = "serial/notification/fatigue_s/event";
    const mdsm7_topic = "fatigue/notification/mdsm7";
    const mdsm7_topic_update = "ndm/notification/mdsm7/update";
    const mdsm7_topic_event = "ndm/notification/mdsm7/event";
    const cipia_topic_update = "ndm/notification/cipia/update";
    const cipia_topic_event = "ndm/notification/cipia/event";
    const all_topics = [
        serial_state_topic, serial_photo_topic,
        mdsm7_topic, mdsm7_topic_event, mdsm7_topic_update,
        cipia_topic_event, cipia_topic_update, serial_event_topic,
    ];
    // subscribe to receive updates
    try {
        var state = await Utils.OSExecute('apx-serial fatigue_sensor state');
        state.photos = {};
        state.channel = 'serial';
        if (state.latest_photo) {
            state.channel = 'serial';
            state.epoch = Number(state.latest_photo.split('-')[0]);
            state.event = state.latest_photo.split('-')[1].split('.')[0];
        }
        callback(state);
        var handler = (channel, data) => {
            if (!all_topics.includes(channel))
                return;
            if (channel == serial_state_topic) {
                state.channel = 'serial';
                state.state = data;
            }
            if (channel == serial_photo_topic) {
                let photo_type = data.split('-')[1].split('.')[0];
                state.latest_photo = data;
                state.photos[photo_type] = data;
            }
            if (state.latest_photo) {
                state.channel = 'serial';
                state.epoch = Number(state.latest_photo.split('-')[0]);
                state.event = state.latest_photo.split('-')[1].split('.')[0];
            }
            if (channel == serial_event_topic) {
                data = JSON.parse(data);
                state.channel = 'serial';
                state.epoch = data.system_epoch;
                state.event = data.event;
            }
            if ([mdsm7_topic, mdsm7_topic_event].includes(channel)) {
                data = JSON.parse(data);
                state.channel = 'mdsm7';
                state.epoch = data.system_epoch;
                state.event = data.event;
            }
            if (channel == mdsm7_topic_update) {
                data = JSON.parse(data);
                state.channel = 'mdsm7';
                state = { ...state, ...data };
            }
            if (channel == cipia_topic_event) {
                data = JSON.parse(data);
                state.channel = 'cipia';
                state.epoch = data.system_epoch;
                state.event = data.event;
                state = { ...state, ...data };
            }
            if (channel == cipia_topic_update) {
                data = JSON.parse(data);
                state.channel = 'cipia';
                state = { ...state, ...data };
            }
            state.media = data.media || null;
            callback(state);
        };
        all_topics.map((t) => Redis_1.SystemRedisSubscriber.subscribe(t));
        Redis_1.SystemRedisSubscriber.on("message", handler);
    }
    catch (error) {
        console.error(error);
        errorCallback(error);
    }
    let returnable = {
        unsubscribe: () => {
            Redis_1.SystemRedisSubscriber.off("message", handler);
            all_topics.map((t) => Redis_1.SystemRedisSubscriber.unsubscribe(t));
        },
        off: function () { this.unsubscribe(); }
    };
    return returnable;
}
exports.onFatigueEvent = onFatigueEvent;
