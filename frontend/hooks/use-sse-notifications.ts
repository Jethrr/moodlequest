import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentUser } from "./useCurrentMoodleUser";

// API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002/api";

export interface SSENotificationData {
  id: string;
  type: "xp_reward" | "quest_completion" | "level_up" | "heartbeat" | "error";
  timestamp: string;
  user_id: number;
  title: string;
  message: string;
  xp_earned?: number;
  total_xp?: number;
  quest_data?: {
    source_type?: string;
    quest_title?: string;
    quest_id?: number;
    completion_percentage?: number;
  };
  // For level up notifications
  previous_level?: number;
  new_level?: number;
}

export interface SSEConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastHeartbeat: Date | null;
}

export function useSSENotifications() {
  const { user, isAuthenticated } = useCurrentUser();
  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastHeartbeat: null,
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second
  
  // Event handlers
  const [notificationHandlers, setNotificationHandlers] = useState<{
    [key: string]: (notification: SSENotificationData) => void;
  }>({});

  // Add notification handler
  const addNotificationHandler = useCallback(
    (type: string, handler: (notification: SSENotificationData) => void) => {
      setNotificationHandlers(prev => ({
        ...prev,
        [type]: handler,
      }));
    },
    []
  );

  // Remove notification handler
  const removeNotificationHandler = useCallback((type: string) => {
    setNotificationHandlers(prev => {
      const { [type]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Clear all handlers
  const clearNotificationHandlers = useCallback(() => {
    setNotificationHandlers({});
  }, []);

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    return Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts.current), 30000);
  }, []);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      console.log("SSE: User not authenticated, skipping connection");
      return;
    }

    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log("SSE: Already connected");
      return;
    }

    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const url = `${API_BASE_URL}/notifications/events/${user.id}`;
      console.log("SSE: Connecting to", url);
      
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE: Connection opened");
        reconnectAttempts.current = 0;
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
          lastHeartbeat: new Date(),
        });
      };

      eventSource.onmessage = (event) => {
        console.log("SSE: Received message", event.data);
        
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat
          if (data.type === "heartbeat") {
            setConnectionState(prev => ({
              ...prev,
              lastHeartbeat: new Date(),
            }));
            return;
          }

          // Handle notifications
          if (data.type && notificationHandlers[data.type]) {
            notificationHandlers[data.type](data as SSENotificationData);
          } else {
            console.log("SSE: No handler for notification type:", data.type);
          }
        } catch (error) {
          console.error("SSE: Error parsing message", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE: Connection error", error);
        
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: "Connection error",
        }));

        // Attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = getReconnectDelay();
          console.log(`SSE: Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error("SSE: Max reconnection attempts reached");
          setConnectionState(prev => ({
            ...prev,
            error: "Max reconnection attempts reached",
          }));
        }
      };
    } catch (error) {
      console.error("SSE: Failed to create EventSource", error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: "Failed to create connection",
      }));
    }
  }, [isAuthenticated, user?.id, notificationHandlers, getReconnectDelay]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    console.log("SSE: Disconnecting");
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    reconnectAttempts.current = 0;
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastHeartbeat: null,
    });
  }, []);

  // Force reconnect
  const reconnect = useCallback(() => {
    console.log("SSE: Force reconnecting");
    disconnect();
    setTimeout(() => connect(), 1000);
  }, [disconnect, connect]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Monitor connection health
  useEffect(() => {
    if (!connectionState.isConnected || !connectionState.lastHeartbeat) {
      return;
    }

    const healthCheckInterval = setInterval(() => {
      const now = new Date();
      const lastHeartbeat = connectionState.lastHeartbeat;
      
      if (lastHeartbeat && now.getTime() - lastHeartbeat.getTime() > 35000) {
        console.warn("SSE: No heartbeat received for 35 seconds, reconnecting");
        reconnect();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheckInterval);
  }, [connectionState.isConnected, connectionState.lastHeartbeat, reconnect]);

  return {
    connectionState,
    addNotificationHandler,
    removeNotificationHandler,
    clearNotificationHandlers,
    connect,
    disconnect,
    reconnect,
  };
}
