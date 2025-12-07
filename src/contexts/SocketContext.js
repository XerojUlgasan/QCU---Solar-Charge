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

        // Listen to "change" events from backend (Supabase format)
        newSocket.on('change', (data) => {
            console.log('📡 Socket.IO change event received:', data);
            
            // Map Supabase table names to collection names used in components
            const tableToCollectionMap = {
                'tbl_devices': 'devices',
                'tbl_sessions': 'transactions',
                'tbl_reports': 'reports',
                'tbl_contacts': 'contactUs',
                'tbl_deviceconfig': 'deviceConfig',
                'tbl_energyhistory': 'energyHistory',
                'tbl_ratings': 'ratings',
                'tbl_devicesdata': 'devicesData',
                'tbl_users': 'users',
                'tbl_admin': 'admin'
            };
            
            // Map Supabase event types to Firebase-like types
            const eventTypeMap = {
                'INSERT': 'added',
                'UPDATE': 'modified',
                'DELETE': 'removed'
            };
            
            // Transform Supabase event to Firebase-like format for compatibility
            const collectionName = tableToCollectionMap[data.table_name] || data.table_name;
            const eventType = eventTypeMap[data.type] || data.type.toLowerCase();
            
            // Extract ID from data - try different possible ID fields
            // For DELETE events, data.data might be null, so we need to handle that
            let id = null;
            const recordData = data.data;
            
            if (recordData) {
                // Try common ID field names based on table
                if (data.table_name === 'tbl_devices') {
                    id = recordData.device_id;
                } else if (data.table_name === 'tbl_sessions') {
                    id = recordData.transaction_id;
                } else if (data.table_name === 'tbl_reports') {
                    id = recordData.report_id;
                } else if (data.table_name === 'tbl_contacts') {
                    id = recordData.contact_id;
                } else if (data.table_name === 'tbl_deviceconfig') {
                    id = recordData.deviceConfig_id || recordData.device_id;
                } else if (data.table_name === 'tbl_energyhistory') {
                    id = recordData.energyHistory_id || recordData.device_id;
                } else if (data.table_name === 'tbl_ratings') {
                    id = recordData.rating_id;
                } else if (data.table_name === 'tbl_devicesdata') {
                    id = recordData.data_id || recordData.device_id;
                } else if (data.table_name === 'tbl_users') {
                    id = recordData.user_id;
                } else if (data.table_name === 'tbl_admin') {
                    id = recordData.admin_id;
                } else {
                    // Generic fallback - try common ID patterns
                    const tableNameWithoutPrefix = data.table_name.replace('tbl_', '');
                    id = recordData.id || 
                         recordData[`${tableNameWithoutPrefix}_id`] ||
                         recordData[`${collectionName}_id`] ||
                         (Object.keys(recordData).length > 0 ? Object.values(recordData)[0] : null);
                }
            } else if (data.type === 'DELETE') {
                // For DELETE events, if data is null, try to get ID from old data if available
                // Note: The server might need to send payload.old for DELETE events
                console.warn('⚠️ DELETE event received with null data. Server may need to send payload.old for DELETE events.');
            }
            
            // Transform to Firebase-like format
            const transformedData = {
                collectionName: collectionName,
                type: eventType,
                id: id,
                data: data.data,
                // Keep original Supabase data for reference
                _supabase: {
                    table_name: data.table_name,
                    eventType: data.type,
                    originalData: data.data
                }
            };
            
            console.log('📡 Transformed event:', transformedData);
            setLastChange(transformedData);
            
            // Dispatch custom event so components can listen to specific changes
            window.dispatchEvent(new CustomEvent('socketChange', { detail: transformedData }));
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

