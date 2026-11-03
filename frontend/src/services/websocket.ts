type Callback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Callback[]> = new Map();
  private url: string;

  constructor() {
    this.url = 'ws://localhost:8000/ws';
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { eventType, payload } = data;
          this.emit(eventType, payload);
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      this.socket.onclose = () => {
        setTimeout(() => this.connect(), 5000); // Reconnect
      };
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to polling');
    }
  }

  subscribe(eventType: string, callback: Callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
    
    return () => {
      const callbacks = this.listeners.get(eventType) || [];
      this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
    };
  }

  private emit(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(cb => cb(data));
  }
}

export const wsService = new WebSocketService();
