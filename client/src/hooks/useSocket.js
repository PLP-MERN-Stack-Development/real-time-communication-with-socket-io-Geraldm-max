import { useEffect } from "react";
import { socket } from "../socket/socket";

export default function useSocket({ username, onMessage, onPresence, onTyping }) {
  useEffect(() => {
    if (!username) return;
    socket.connect();
    socket.emit('join', { username });

    socket.on('chat-message', onMessage);
    socket.on('presence', onPresence);
    socket.on('typing', onTyping);

    return () => {
      socket.off('chat-message', onMessage);
      socket.off('presence', onPresence);
      socket.off('typing', onTyping);
      socket.disconnect();
    };
  }, [username]);

  return socket;
}
