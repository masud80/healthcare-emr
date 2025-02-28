import { useEffect, useRef } from 'react';
import { WebSocketManager } from '../websocket/WebSocketManager';

function YourComponent() {
  const wsManager = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    // Initialize WebSocket
    wsManager.current = new WebSocketManager('YOUR_WEBSOCKET_URL');
    wsManager.current.connect();

    // Cleanup on unmount
    return () => {
      wsManager.current?.disconnect();
    };
  }, []);

  // Example function to send data
  const sendMessage = (data: any) => {
    wsManager.current?.send(data);
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}