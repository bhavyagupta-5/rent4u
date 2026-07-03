import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); 
  const [activeConversationId, setActiveConversationId] = useState(null);

  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Socket.io connected:', newSocket.id);
      newSocket.emit('register_user', user._id);
      newSocket.emit('get_online_users');
    });

    
    newSocket.on('online_users_list', (users) => {
      setOnlineUsers(users);
    });

    
    newSocket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === 'online') {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    
    newSocket.on('typing_status', ({ conversationId, userId, isTyping }) => {
      setTypingUsers((prev) => {
        const convTyping = prev[conversationId] || {};
        return {
          ...prev,
          [conversationId]: {
            ...convTyping,
            [userId]: isTyping
          }
        };
      });
    });

    
    newSocket.on('new_notification', (notification) => {
      
      if (notification.type === 'message' && activeConversationIdRef.current !== notification.conversationId) {
        setNotifications((prev) => [notification, ...prev]);
        
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-200 dark:border-slate-800`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    New message from {notification.message.senderName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {notification.message.text}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingUsers,
      activeConversationId,
      setActiveConversationId,
      notifications,
      setNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
