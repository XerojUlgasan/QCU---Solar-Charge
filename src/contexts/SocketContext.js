import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/api';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastChange, setLastChange] = useState(null);
    const [connectionError, setConnectionError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Extract base URL from API_BASE_URL (remove path if any)
        const socketUrl = API_BASE_URL;
        
        console.log('Initializing Socket.IO connection to:', socketUrl);
        
        // Create socket connection with improved timeout and connection options
        const newSocket = io(socketUrl, {
            transports: ['polling', 'websocket'], // Try polling first, then websocket
            reconnection: true,
            reconnectionAttempts: Infinity, // Keep trying to reconnect
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000, // 20 seconds timeout
            forceNew: false,
            upgrade: true,
            rememberUpgrade: false,
            // Add path if your backend uses a different path
            // path: '/socket.io',
            // Add query parameters if needed
            // query: {},
        });

        socketRef.current = newSocket;

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected:', newSocket.id);
            setIsConnected(true);
            setConnectionError(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error);
            console.error('Error type:', error.type);
            console.error('Error message:', error.message);
            setIsConnected(false);
            setConnectionError(error.message);
            
            // Log additional debugging info
            if (error.message === 'timeout') {
                console.warn('⚠️ Socket.IO connection timeout - server may not be responding or Socket.IO not configured');
                console.warn('💡 The app will continue to work without real-time updates');
            }
        });
        
        // Handle reconnection attempts
        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Socket.IO reconnection attempt #${attemptNumber}`);
        });
        
        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Socket.IO reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
        });
        
        newSocket.on('reconnect_error', (error) => {
            console.error('❌ Socket.IO reconnection error:', error);
        });
        
        newSocket.on('reconnect_failed', () => {
            console.error('❌ Socket.IO reconnection failed - giving up');
        });

        // Listen to "change" events from backend
        newSocket.on('change', (data) => {
            console.log('📡 Socket.IO change event received:', data);
            setLastChange(data);
            
            // Dispatch custom event so components can listen to specific changes
            window.dispatchEvent(new CustomEvent('socketChange', { detail: data }));
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('Cleaning up Socket.IO connection');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const value = {
        socket,
        isConnected,
        lastChange,
        connectionError,
        // Helper function to listen to specific collection changes
        onCollectionChange: (collectionName, callback) => {
            if (!socket) return () => {};
            
            const handler = (event) => {
                const data = event.detail;
                if (data.collectionName === collectionName) {
                    callback(data);
                }
            };
            
            window.addEventListener('socketChange', handler);
            
            // Return cleanup function
            return () => {
                window.removeEventListener('socketChange', handler);
            };
        },
        // Helper function to listen to specific change types
        onChangeType: (changeType, callback) => {
            if (!socket) return () => {};
            
            const handler = (event) => {
                const data = event.detail;
                if (data.type === changeType) {
                    callback(data);
                }
            };
            
            window.addEventListener('socketChange', handler);
            
            // Return cleanup function
            return () => {
                window.removeEventListener('socketChange', handler);
            };
        },
        // Helper function to listen to specific document changes
        onDocumentChange: (collectionName, documentId, callback) => {
            if (!socket) return () => {};
            
            const handler = (event) => {
                const data = event.detail;
                if (data.collectionName === collectionName && data.id === documentId) {
                    callback(data);
                }
            };
            
            window.addEventListener('socketChange', handler);
            
            // Return cleanup function
            return () => {
                window.removeEventListener('socketChange', handler);
            };
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

