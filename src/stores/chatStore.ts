import { create } from 'zustand';
import type { Chat, Message, QueryOptions } from '../types';
import * as commands from '../services/tauri/commands';

interface ChatState {
  // Current chat state
  messages: Message[];
  currentChatId: string | null;
  currentProjectId: string | null;
  pendingPrompt: string | null;
  
  // Chat history
  chatHistory: Chat[];
  isLoadingChats: boolean;
  
  // Sending state
  isSending: boolean;
  generationStartTime: number | null;
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setCurrentChatId: (id: string | null) => void;
  setCurrentProjectId: (id: string | null) => void;
  setPendingPrompt: (content: string | null) => void;
  setIsSending: (sending: boolean) => void;
  
  // Chat operations
  createNewChat: () => void;
  loadChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  clearProjectChats: (projectId: string) => void;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  togglePinChat: (chatId: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  
  // Message operations
  sendMessage: (
    content: string, 
    model: string, 
    options: QueryOptions
  ) => Promise<void>;
  deleteMessage: (messageTimestamp: number) => Promise<void>;
  
  // Utilities
  generateChatId: () => string;
  generateChatTitle: () => string;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  currentChatId: null,
  currentProjectId: null,
  pendingPrompt: null,
  chatHistory: [],
  isLoadingChats: false,
  isSending: false,
  generationStartTime: null,

  // Basic setters
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
      };
    }
    return { messages };
  }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setPendingPrompt: (content) => set({ pendingPrompt: content }),
  setIsSending: (sending) => set({ isSending: sending }),

  // Generate unique chat ID
  generateChatId: () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Generate chat title from first user message
  generateChatTitle: () => {
    const { messages } = get();
    const firstUserMessage = messages.find((m) => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? title + '...' : title;
    }
    return 'New Chat';
  },

  // Create new chat
  createNewChat: () => {
    const {  generateChatId } = get();
  
    // Start new chat
    const newChatId = generateChatId();
    set({
      currentChatId: newChatId,
      messages: [],
    });
  },

  // Load a chat from history
  loadChat: async (chatId: string) => {
    

    try {
      const chat = await commands.getChat(chatId);
      if (chat) {
        set({
          currentChatId: chat.id,
          messages: chat.messages,
          currentProjectId: chat.projectId || null,
        });
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  },


  // Delete a chat
  deleteChat: async (chatId: string) => {
    try {
      const success = await commands.deleteChat(chatId);
      if (success) {
        set((state) => ({
          chatHistory: state.chatHistory.filter((c) => c.id !== chatId),
          // Clear current chat if it was deleted
          ...(state.currentChatId === chatId ? { currentChatId: null, messages: [] } : {}),
        }));
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  },

  // Clear all chats for a project (local state sync)
  clearProjectChats: (projectId: string) => {
    set((state) => ({
      chatHistory: state.chatHistory.filter((c) => c.projectId !== projectId),
      // If current chat belongs to this project, clear it
      ...(state.currentProjectId === projectId 
        ? { currentChatId: null, messages: [], currentProjectId: null } 
        : {}),
    }));
  },

  // Rename a chat
  renameChat: async (chatId: string, newTitle: string) => {
    try {
      const updatedChat = await commands.updateChatProperty(chatId, 'title', newTitle);
      if (updatedChat) {
        set((state) => ({
          chatHistory: state.chatHistory.map((c) =>
            c.id === chatId ? { ...c, title: newTitle } : c
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  },

  // Toggle pin status
  togglePinChat: async (chatId: string) => {
    const chat = get().chatHistory.find((c) => c.id === chatId);
    if (!chat) return;
    
    try {
      const updatedChat = await commands.updateChatProperty(chatId, 'pinned', !chat.pinned);
      if (updatedChat) {
        set((state) => ({
          chatHistory: state.chatHistory.map((c) =>
            c.id === chatId ? { ...c, pinned: !c.pinned } : c
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  },

  // Load all chat history
  loadChatHistory: async () => {
    set({ isLoadingChats: true });
    try {
      const chats = await commands.getAllChats();
      set({ chatHistory: chats, isLoadingChats: false });
    } catch (error) {
      console.error('Failed to load chat history:', error);
      set({ isLoadingChats: false });
    }
  },

  // Send a message and get AI response
  sendMessage: async (content: string, model: string, options: QueryOptions) => {
    const { addMessage, currentChatId, currentProjectId, generateChatId } = get();
    
    // Create chat ID if needed
    let chatId = currentChatId;
    if (!chatId) {
      chatId = generateChatId();
      set({ currentChatId: chatId });
    }
    
    // Inject projectId if not provided but exists in store
    if (!options.projectId && currentProjectId) {
      options.projectId = currentProjectId;
    }
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
    
    // Helper to save current state
    const saveState = async () => {
      const { messages: currentMessages, currentChatId, currentProjectId, chatHistory } = get();
      if (!currentChatId) return;

      // Find existing title or generate new one
      const existingChat = chatHistory.find(c => c.id === currentChatId);
      let title = existingChat?.title;
      
      if (!title) {
        const firstUserMsg = currentMessages.find(m => m.role === 'user');
        if (firstUserMsg) {
          title = firstUserMsg.content.substring(0, 50);
          if (title.length < firstUserMsg.content.length) title += '...';
        } else {
          title = 'New Chat';
        }
      }

      const chatData: Chat = {
        id: currentChatId,
        title,
        messages: currentMessages,
        timestamp: Date.now(),
        model: model, // Current model
        pinned: existingChat?.pinned || false,
        projectId: currentProjectId || undefined
      };

      try {
        const savedChat = await commands.saveChat(chatData);
        // Update history
        set(state => {
          const newHistory = state.chatHistory.some(c => c.id === savedChat.id)
            ? state.chatHistory.map(c => c.id === savedChat.id ? savedChat : c)
            : [savedChat, ...state.chatHistory];
          return { chatHistory: newHistory };
        });
      } catch (e) {
        console.error('Failed to save chat:', e);
      }
    };

    // Save after user message (optimistic)
    await saveState();
    
    // Set sending state
    set({ isSending: true, generationStartTime: Date.now() });
    
    try {
      // Prepare history for RAG
      const history = get().messages.slice(0, -1).map<Message>(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await commands.sendQuery(content, history, model, {
        ...options,
        userProfileEnabled: options.userProfileEnabled ?? true,
      });
      
      if (response.success && response.content) {
        const { generationStartTime } = get();
        const generationTime = generationStartTime 
          ? (Date.now() - generationStartTime) / 1000 
          : undefined;
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          model,
          generationTime,
          memoryData: response.memoryData,
          sources: response.sources,
        };
        addMessage(assistantMessage);
        
        // Save after assistant message
        await saveState();
      } else {
        // Add error message
        const errorMessage: Message = {
          role: 'assistant',
          content: response.error || 'An error occurred while processing your request.',
          timestamp: Date.now(),
        };
        addMessage(errorMessage);
        // No save on error? Or save error message? Let's save it.
        await saveState();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to connect to the AI service. Please try again.',
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
      await saveState();
    } finally {
      set({ isSending: false, generationStartTime: null });
    }
  },

  deleteMessage: async (messageTimestamp: number) => {
    const { messages, currentChatId, chatHistory } = get();
    if (!currentChatId) return;

    const newMessages = messages.filter(m => m.timestamp !== messageTimestamp);
    set({ messages: newMessages });

    // Find current chat to maintain other properties
    const existingChat = chatHistory.find(c => c.id === currentChatId);
    if (!existingChat) return;

    const updatedChat: Chat = {
      ...existingChat,
      messages: newMessages,
      timestamp: Date.now()
    };

    try {
      await commands.saveChat(updatedChat);
      set(state => ({
        chatHistory: state.chatHistory.map(c => c.id === currentChatId ? updatedChat : c)
      }));
    } catch (e) {
      console.error('Failed to save chat after message deletion:', e);
    }
  },
}));
