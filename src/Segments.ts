/**
 * Segments module
 * @module Segments
 */
import * as Utils from "./Utils";
import { SystemRedisSubscriber as subscriber } from "./Redis";

interface SegmentEvent {
    label: string,
    event: string,
    segment_status: string,
    id: string,
    time: number,
    coord:{
        lat: number,
        lon: number,
    }
    payload:{
        summary: {
            distance: number,
            duration: number,
            ign_time: number,
            idle_time: number,
            over_speed: number,
            over_rpm: number
        },
        speed: {
            average: {
                value: number,
                accum: number,
                samples: number
            },
            max: {
                value: number,
                speed: number,
                hdop: number,
                time: number,
                coord:{
                    lat: number,
                    lon: number,
                }
            }
        },
        elevation:{
            uphill: number,
            downhill: number,
            constant: number
            unavailable: number
        },
        accel: {
            positive: {
                max: {
                    value: number,
                    speed: number,
                    hdop: number,
                    time: number,
                    coord:{
                        lat: number,
                        lon: number,
                    }
                }
            },
            negative: {
                max: {
                    value: number,
                    speed: number,
                    hdop: number,
                    time: number,
                    coord:{
                        lat: number,
                        lon: number,
                    }
                }
            }
        },
        gps_qlty: {
            unavailable: number,
            good: number,
            bad: number
        },
        comm:{
            no_gprs: number,
            no_gsm: number,
            tx: number,
            rx: number
        },
        customs: {
            [key: string]: any
        }
    } | null,

}

function tryJSONParse(data: any) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.log("segments json error:", error);
        return {};
    }
}

export async function onSegmentEvent(callback: (arg: SegmentEvent) => void, errorCallback: (arg: Error) => void): Promise<{ unsubscribe: () => void, off: () => void }> {
    const topic = "segments/report/update";

    // Callback handler 
    const handler = (channel: string, data: any) => {
        if (channel != topic) return

        const obj = tryJSONParse(data);
        const event: SegmentEvent = obj;
        callback(event);
    }

    try {
        subscriber.subscribe(topic);
        subscriber.on("message", handler);
    } catch (error) {
        console.log("onSegmentEvent error:", error);
        errorCallback(error);
    }

    return {
        unsubscribe: () => {
            subscriber.off("message", handler);
            subscriber.unsubscribe(topic);
        },
        off: () => {
            this.unsubscribe();
        }
    }
}