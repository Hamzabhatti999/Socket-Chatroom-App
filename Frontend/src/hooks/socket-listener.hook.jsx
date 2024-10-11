import { useEffect, useState } from "react";

const useSocketListener = (eventName, socket) => {
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on(eventName, (data) => {
      setEventData(data);
    });

    return () => {};
  }, [eventName, socket]);

  return eventData;
};

export default useSocketListener;
