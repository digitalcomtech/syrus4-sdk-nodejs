/**
 * SafeEngine module setup get and set Safe engine cut of from APEX OS
 * @module SafeEngine
 */
import * as Utils from "./Utils";
import { SystemRedisSubscriber as subscriber } from "./Redis";

interface SecoEvent {
  mode: string;
  trigger: string;
  state: number;
}

export async function setEngineCutOff(config) {
  let response = undefined;
  try {
    response = await Utils.OSExecute(`apx-seco set ${config}`);
  } catch (error) {
    console.log("SafeEngine setCutOff error:", error);
  }
  return response;
}

export async function getStatus(): Promise<SecoEvent> {
  return await Utils.OSExecute("apx-seco status");
}

export async function onSafeEngineEvent(
  callback: (arg: SecoEvent) => void,
  errorCallback: (arg: Error) => void
): Promise<{ unsubscribe: () => void; off: () => void }> {
  const topic = "seco/notification/state";

  const lastSecoState: SecoEvent | undefined = await getStatus().catch((err) => {
    console.error(err);
    return undefined;
  });
  if (lastSecoState != undefined) {
    const lastSecoObject = JSON.parse(JSON.stringify(lastSecoState));
    callback(lastSecoObject);
  }

  // Callback Handler
  const handler = async (channel: string, data: any) => {
    if (channel != topic) return;
    const status: SecoEvent | undefined = await getStatus().catch((err) => {
      console.error(err);
      return undefined;
    });
    
    const event: SecoEvent = {
      mode: status?.mode ?? null,
      trigger: status?.trigger ?? null,
      state: Number(data),
    };

    callback(event);
  };

  try {
    subscriber.subscribe(topic);
    subscriber.on("message", handler);
  } catch (error) {
    console.log("onSafeEngineEvent error:", error);
    errorCallback(error);
  }

  return {
    unsubscribe: () => {
      subscriber.off("message", handler);
      subscriber.unsubscribe(topic);
    },
    off: () => {
      this.unsubscribe();
    },
  };
}
