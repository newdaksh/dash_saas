/**
 * WebSocket Service for Real-Time Updates
 * Manages WebSocket connection and event handling
 */

import { API_ENDPOINTS } from '../api.config';
import { getAccessToken } from './api';

// WebSocket Event Types (must match backend)
export const WebSocketEventType = {
  // Task events
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_DELETED: 'TASK_DELETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  
  // Project events
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  PROJECT_MEMBER_ADDED: 'PROJECT_MEMBER_ADDED',
  
  // User events
  USER_INVITED: 'USER_INVITED',
  USER_JOINED: 'USER_JOINED',
  USER_UPDATED: 'USER_UPDATED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  
  // Invitation events
  INVITATION_RECEIVED: 'INVITATION_RECEIVED',
  INVITATION_RESPONSE: 'INVITATION_RESPONSE',
  
  // Comment events
  COMMENT_ADDED: 'COMMENT_ADDED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  
  // Task History events
  TASK_HISTORY_UPDATED: 'TASK_HISTORY_UPDATED',
  
  // Notification events
  NOTIFICATION: 'NOTIFICATION',
  
  // Chatbot events
  CHATBOT_DB_CHANGE: 'CHATBOT_DB_CHANGE',
  
  // System events
  CONNECTION_ESTABLISHED: 'CONNECTION_ESTABLISHED',
  PING: 'PING',
  PONG: 'PONG',
} as const;

export type WebSocketEventTypeValue = typeof WebSocketEventType[keyof typeof WebSocketEventType];

export interface WebSocketMessage {
  type: WebSocketEventTypeValue;
  payload: any;
  timestamp?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private globalHandlers: Set<MessageHandler> = new Set();
  private isConnecting = false;
  private shouldReconnect = true;

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    const token = getAccessToken();
    
    if (!token) {
      console.warn('WebSocket: No access token available, skipping connection');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('WebSocket: Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const wsUrl = API_ENDPOINTS.WEBSOCKET.CONNECT(token);
      console.log('WebSocket: Connecting to', wsUrl.replace(token, '***'));
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket: Failed to create connection', error);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    console.log('WebSocket: Disconnected');
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: WebSocketEventTypeValue | 'all', handler: MessageHandler): () => void {
    if (eventType === 'all') {
      this.globalHandlers.add(handler);
      return () => this.globalHandlers.delete(handler);
    }

    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Remove all handlers for an event type
   */
  off(eventType: WebSocketEventTypeValue | 'all'): void {
    if (eventType === 'all') {
      this.globalHandlers.clear();
    } else {
      this.messageHandlers.delete(eventType);
    }
  }

  /**
   * Send a message to the server
   */
  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket: Cannot send message, not connected');
    }
  }

  /**
   * Send a ping to keep connection alive
   */
  private sendPing(): void {
    this.send({ type: WebSocketEventType.PING });
  }

  private handleOpen(): void {
    console.log('WebSocket: Connected successfully');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket: Received message', message.type, message);

      // Call global handlers
      this.globalHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (err) {
          console.error('WebSocket: Error in global handler', err);
        }
      });

      // Call type-specific handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        console.log(`WebSocket: Found ${handlers.size} handler(s) for ${message.type}`);
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (err) {
            console.error(`WebSocket: Error in handler for ${message.type}`, err);
          }
        });
      } else {
        console.warn(`WebSocket: No handlers registered for message type: ${message.type}`);
      }
    } catch (error) {
      console.error('WebSocket: Failed to parse message', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket: Connection closed', event.code, event.reason);
    this.isConnecting = false;
    this.stopHeartbeat();

    // Attempt to reconnect if it wasn't a clean close
    if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket: Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket: Error occurred', event);
    this.isConnecting = false;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export default for convenience
export default websocketService;
