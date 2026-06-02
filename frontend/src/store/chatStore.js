import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  typingUsers: [],

  setChats: (chats) => set({ chats }),
  
  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),
  
  addMessage: (msg) => {
    set((state) => {
      // Only add to active messages if it's for current active chat
      if (state.activeChat && state.activeChat._id === msg.chatId) {
        return { messages: [...state.messages, msg] };
      }
      return state;
    });

    // Also update lastMessage in chat list
    set((state) => ({
      chats: state.chats.map(chat => 
        chat._id === msg.chatId 
          ? { ...chat, lastMessage: { text: msg.type === 'image' ? '📸 Image' : msg.text, createdAt: msg.createdAt, senderId: msg.senderId } } 
          : chat
      ).sort((a, b) => {
        // bring updated chat to top
        const aTime = a._id === msg.chatId ? new Date(msg.createdAt).getTime() : new Date(a.lastMessage?.createdAt || a.createdAt).getTime();
        const bTime = b._id === msg.chatId ? new Date(msg.createdAt).getTime() : new Date(b.lastMessage?.createdAt || b.createdAt).getTime();
        return bTime - aTime;
      })
    }));
  },
  
  setMessages: (messages) => set({ messages }),
  
  addTypingUser: (userId, chatId) => set((state) => {
    if (!state.typingUsers.some(t => t.userId === userId && t.chatId === chatId)) {
      return { typingUsers: [...state.typingUsers, { userId, chatId }] };
    }
    return state;
  }),
  
  removeTypingUser: (userId, chatId) => set((state) => ({
    typingUsers: state.typingUsers.filter(t => !(t.userId === userId && t.chatId === chatId))
  }))
}));

export default useChatStore;
