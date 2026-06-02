import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import useChatStore from '../store/chatStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { addMessage, addTypingUser, removeTypingUser } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      socketRef.current.on('notification', (notification) => {
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

      socketRef.current.on('new_message', (message) => {
        addMessage(message);
      });

      socketRef.current.on('user_typing', ({ userId, chatId }) => {
        addTypingUser(userId, chatId);
      });

      socketRef.current.on('user_stopped_typing', ({ userId, chatId }) => {
        removeTypingUser(userId, chatId);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token, isAuthenticated, addNotification, addMessage, addTypingUser, removeTypingUser, navigate]);

  return { socket: socketRef.current, isConnected };
};
