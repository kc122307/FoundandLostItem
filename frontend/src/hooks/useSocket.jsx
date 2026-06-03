import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import useChatStore from '../store/chatStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

let globalSocket = null;

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { addMessage, addTypingUser, removeTypingUser } = useChatStore();
  const [isConnected, setIsConnected] = useState(globalSocket?.connected || false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setIsConnected(false);
      }
      return;
    }

    if (!globalSocket) {
      globalSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      globalSocket.on('connect', () => {
        setIsConnected(true);
      });

      globalSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      globalSocket.on('notification', (notification) => {
        addNotification(notification);
        
        if (notification.type === 'new_match') {
          toast((t) => (
            <div>
              <b>We found a possible match for your lost item! 🎉</b>
              <button 
                onClick={() => { toast.dismiss(t.id); navigate('/matches'); }}
                className="ml-4 text-xs bg-sky-500 text-white px-2 py-1 rounded"
              >
                View Match
              </button>
            </div>
          ), { duration: 5000 });
        }
        else if (notification.type === 'claim_approved' || notification.type === 'challenge_approved') {
          toast((t) => (
            <div>
              <b>Claim approved! Chat is now open 💬</b>
              <button 
                onClick={() => { toast.dismiss(t.id); navigate('/chat'); }}
                className="ml-4 text-xs bg-green-500 text-white px-2 py-1 rounded"
              >
                Open Chat
              </button>
            </div>
          ), { duration: 5000 });
        }
        else if (notification.type === 'claim_rejected') {
          toast.error(notification.body, { duration: 5000 });
        }
      });

      globalSocket.on('new_message', (message) => {
        addMessage(message);
      });

      globalSocket.on('user_typing', ({ userId, chatId }) => {
        addTypingUser(userId, chatId);
      });

      globalSocket.on('user_stopped_typing', ({ userId, chatId }) => {
        removeTypingUser(userId, chatId);
      });
    } else {
      setIsConnected(globalSocket.connected);
      
      // Setup listener to update state if socket connects/disconnects later
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      globalSocket.on('connect', handleConnect);
      globalSocket.on('disconnect', handleDisconnect);
      
      return () => {
        globalSocket.off('connect', handleConnect);
        globalSocket.off('disconnect', handleDisconnect);
      };
    }
  }, [token, isAuthenticated, addNotification, addMessage, addTypingUser, removeTypingUser, navigate]);

  return { socket: globalSocket, isConnected };
};
