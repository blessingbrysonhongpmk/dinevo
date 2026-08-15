import { io } from 'socket.io-client';
import { getSocketServerUrl } from '../api/axios';

let socket = null;

export function getSocket() {
  if (!socket) {
    const serverUrl = getSocketServerUrl();
    console.log('[DINEVO Socket] Connecting to backend at:', serverUrl);
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[DINEVO Socket] Connected successfully! ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[DINEVO Socket] Connection error:', err.message);
    });
  }
  return socket;
}

export default getSocket;
