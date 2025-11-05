import React, { useState } from 'react';
import useSocket from './hooks/useSocket';

export default function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useSocket({
    username,
    onMessage: (msg) => setMessages(m => [...m, msg]),
    onPresence: (p) => console.log('presence', p),
    onTyping: (t) => console.log('typing', t)
  });

  const send = () => {
    socket.emit('chat-message', { room: 'global', text: 'Hello!', from: username });
  };

  return (
    <div>
      {!username ? (
        <input placeholder="Enter username" onBlur={(e)=>setUsername(e.target.value)} />
      ) : (
        <>
          <button onClick={send}>Send hello</button>
          <ul>{messages.map(m => <li key={m._id || m.createdAt}>{m.from}: {m.text}</li>)}</ul>
        </>
      )}
    </div>
  );
}
