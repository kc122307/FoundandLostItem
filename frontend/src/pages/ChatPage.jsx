import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { chatService } from '../services/chat.service';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { useSocket } from '../hooks/useSocket';
import { formatTimeAgo } from '../utils/formatters';

const ChatPage = () => {
  const { state } = useLocation();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const { chats, setChats, activeChat, setActiveChat, messages, setMessages } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat list
  const { data: chatData, isLoading: loadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChats
  });

  useEffect(() => {
    if (chatData?.chats) {
      setChats(chatData.chats);
      // Auto select chat if passed via router state or select first one
      if (state?.activeChatId) {
        const c = chatData.chats.find(c => c._id === state.activeChatId);
        if (c) selectChat(c);
      } else if (chatData.chats.length > 0 && !activeChat) {
        selectChat(chatData.chats[0]);
      }
    }
  }, [chatData, state?.activeChatId]);

  const selectChat = async (chat) => {
    setActiveChat(chat);
    if (socket && isConnected) {
      socket.emit('join_chat', chat._id);
    }
    // Fetch historical messages
    try {
      const data = await chatService.getMessages(chat._id);
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChat || (!inputText.trim() && !imageFile)) return;

    if (imageFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('chatId', activeChat._id);
      formData.append('image', imageFile);
      
      try {
        await chatService.sendImageMessage(formData);
        setImageFile(null);
      } catch (e) {
        console.error('Image upload failed', e);
      } finally {
        setIsUploading(false);
      }
    }

    if (inputText.trim()) {
      socket.emit('send_message', {
        chatId: activeChat._id,
        text: inputText
      });
      setInputText('');
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex border border-slate-200 rounded-2xl overflow-hidden glass mt-4">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-white/50">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-4 text-center text-slate-500">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No active chats</div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherUser(chat);
              const isActive = activeChat?._id === chat._id;
              return (
                <div 
                  key={chat._id} 
                  onClick={() => selectChat(chat)}
                  className={`p-4 border-b border-slate-200/50 cursor-pointer hover:bg-slate-100 transition ${isActive ? 'bg-slate-100 border-l-4 border-l-indigo-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-indigo-300 flex-shrink-0">
                      {otherUser?.name?.charAt(0) || '?'}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold truncate">{otherUser?.name || 'Unknown'}</h4>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {chat.lastMessage?.createdAt ? formatTimeAgo(chat.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col bg-slate-50/50 relative">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 absolute top-0 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-indigo-300">
                  {getOtherUser(activeChat)?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold">{getOtherUser(activeChat)?.name}</h3>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pt-20 pb-4 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user._id || msg.senderId._id === user._id;
                
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    }`}>
                      {msg.type === 'text' ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/chats/${msg.imageUrl}`} 
                          alt="Shared" 
                          className="rounded-lg max-h-64 object-cover" 
                        />
                      )}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-500'} text-right`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white/50">
              {imageFile && (
                <div className="mb-2 relative inline-block">
                  <img src={URL.createObjectURL(imageFile)} alt="preview" className="h-20 rounded border border-slate-300" />
                  <button 
                    onClick={() => setImageFile(null)} 
                    className="absolute -top-2 -right-2 bg-rose-500 text-slate-900 rounded-full p-1"
                  >✕</button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <label className="cursor-pointer p-3 rounded-xl bg-slate-100 hover:bg-gray-700 transition text-slate-600 hover:text-slate-900">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files[0]) setImageFile(e.target.files[0]) }} />
                </label>
                <div className="flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden focus-within:border-indigo-500 transition">
                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                    placeholder="Type a message..."
                    className="w-full bg-transparent border-none p-3 text-slate-900 focus:ring-0 resize-none h-[52px] max-h-32"
                    rows="1"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={(!inputText.trim() && !imageFile) || isUploading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition text-slate-900 disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium text-slate-600">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
