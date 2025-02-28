import { WebSocketWithReconnect } from "expo/src/devtools/WebSocketWithReconnect";

export class WebSocketManager {
  private ws: WebSocketWithReconnect | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  constructor(private url: string) {}

  connect() {
    this.ws = new WebSocketWithReconnect(this.url, {
      retriesInterval: 2000,
      maxRetries: 5,
      connectTimeout: 10000,
      onError: this.handleError.bind(this),
      onReconnect: this.handleReconnect.bind(this)
    });

    this.setupHeartbeat();
  }

  private setupHeartbeat() {
    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Setup new heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.warn('Failed to send heartbeat:', error);
          this.reconnect();
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private handleError(error: Error) {
    console.warn('WebSocket error:', error);
    // Implement your error handling logic
  }

  private handleReconnect(reason: string) {
    console.log('Reconnecting:', reason);
    this.setupHeartbeat(); // Reset heartbeat on reconnection
  }

  private reconnect() {
    if (this.ws) {
      this.ws.close();
      this.connect();
    }
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.reconnect();
      }
    } else {
      console.warn('WebSocket is not connected');
      this.reconnect();
    }
  }
}