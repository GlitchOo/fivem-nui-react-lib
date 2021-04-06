import { MutableRefObject, useEffect, useRef } from "react";
import { eventNameFactory } from "../utils/eventNameFactory";

function addEventListener<T extends EventTarget, E extends Event>(
  element: T,
  type: string,
  handler: (this: T, evt: E) => void
) {
  element.addEventListener(type, handler as (evt: Event) => void);
}

/**
 * A hook that manage events listeners for receiving data from the NUI
 * @param app The app name in which this hoook is used
 * @param method The specific `method` field that should be listened for.
 * @param handler The callback function that will handle data relayed by this hook
 **/
export const useNuiEvent = <D = unknown>(app: string, method: string, handler: (r: D) => void): void => {
  const savedHandler: MutableRefObject<(r: D) => void> = useRef();

  // When handler value changes set mutable ref to handler val
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // Will run every rerender
  useEffect(() => {
    const eventName = eventNameFactory(app, method);
    const eventListener = (event) => {
      if (savedHandler.current && savedHandler.current.call) {
        const { data } = event;
        const newData = data;
        savedHandler.current(newData as D);
      }
    };

    addEventListener(window, eventName, eventListener);
    // Remove Event Listener on component cleanup
    return () => window.removeEventListener(eventName, eventListener);
  }, [app, method]);
};
