
import { useEffect } from "react";

export default function useSocket(socket, onEvents = {}) {
  useEffect(() => {
    Object.entries(onEvents).forEach(([event, callback]) => {
      socket.on(event, callback);
    });

    return () => {
      Object.keys(onEvents).forEach((event) => socket.off(event));
    };
  }, [socket, onEvents]);
}
