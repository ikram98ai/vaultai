import { create } from "zustand";
import type { Chat, Message, QueryOptions } from "../types";
import * as commands from "../services/tauri/commands";
import { buildProfileContext, buildProjectContext, buildSystemPrompt } from "./promptUitls";

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
    options: QueryOptions,
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
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateLastMessage: (content) =>
    set((state) => {
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
    return "chat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  },

  // Generate chat title from first user message
  generateChatTitle: () => {
    const { messages } = get();
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length
        ? title + "..."
        : title;
    }
    return "New Chat";
  },

  // Create new chat
  createNewChat: () => {
    const { generateChatId } = get();

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
      console.error("Failed to load chat:", error);
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
          ...(state.currentChatId === chatId
            ? { currentChatId: null, messages: [] }
            : {}),
        }));
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
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
      const updatedChat = await commands.updateChatProperty(
        chatId,
        "title",
        newTitle,
      );
      if (updatedChat) {
        set((state) => ({
          chatHistory: state.chatHistory.map((c) =>
            c.id === chatId ? { ...c, title: newTitle } : c,
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  },

  // Toggle pin status
  togglePinChat: async (chatId: string) => {
    const chat = get().chatHistory.find((c) => c.id === chatId);
    if (!chat) return;

    try {
      const updatedChat = await commands.updateChatProperty(
        chatId,
        "pinned",
        !chat.pinned,
      );
      if (updatedChat) {
        set((state) => ({
          chatHistory: state.chatHistory.map((c) =>
            c.id === chatId ? { ...c, pinned: !c.pinned } : c,
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  },

  // Load all chat history
  loadChatHistory: async () => {
    set({ isLoadingChats: true });
    try {
      const chats = await commands.getAllChats();
      set({ chatHistory: chats, isLoadingChats: false });
    } catch (error) {
      console.error("Failed to load chat history:", error);
      set({ isLoadingChats: false });
    }
  },

  // Send a message and get AI response
  sendMessage: async (
    content: string,
    modelPath: string,
    options: QueryOptions,
  ) => {
    const {
      addMessage,
      currentChatId,
      currentProjectId,
      generateChatId,
      chatHistory,
      messages,
    } = get();

    // Create chat ID if needed
    let chatId = currentChatId;
    let isNewChat = false;

    // Check if the current chat exists in history (persisted)
    const existingChatIndex = chatId
      ? chatHistory.findIndex((c) => c.id === chatId)
      : -1;

    if (
      !chatId ||
      (chatId && existingChatIndex === -1 && messages.length === 0)
    ) {
      if (!chatId) {
        chatId = generateChatId();
        set({ currentChatId: chatId });
      }
      isNewChat = true;
    } else if (existingChatIndex === -1 && messages.length > 0) {
      // Edge case: has messages but not in history? assume new for persistence
      isNewChat = true;
    }


    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Helper to update history
    const updateHistory = (newMsg: Message) => {
      set((state) => ({
        chatHistory: state.chatHistory.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, newMsg], timestamp: Date.now() }
            : c,
        ),
      }));
    };

    // Save/Persist User Message
    if (isNewChat) {
      // Determine title
      const title =
        content.substring(0, 50) + (content.length > 50 ? "..." : "");

      const newChat: Chat = {
        id: chatId!,
        title,
        messages: get().messages, // Includes the user message
        timestamp: Date.now(),
        model: modelPath,
        pinned: false,
        projectId: currentProjectId || undefined,
      };

      try {
        const savedChat = await commands.createChat(newChat);
        set((state) => ({
          chatHistory: [savedChat, ...state.chatHistory],
        }));
      } catch (e) {
        console.error("Failed to create new chat:", e);
      }
    }

    try {
      await commands.addMessage(chatId!, userMessage);
      updateHistory(userMessage);
    } catch (e) {
      console.error("Failed to add user message:", e);
    }

    try {
      // select only last few messages for context
      const history = get()
        .messages.slice(-20)
        .map<Message>((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      let profileContext = "";
      if (options.userProfileEnabled) {
        profileContext = buildProfileContext();
      }
      let projectContext = "";
      if (options.projectIds) {
        projectContext = await buildProjectContext(options.projectIds);
      }
      
      const systemPrompt = buildSystemPrompt(profileContext, projectContext);

      const response = await commands.sendQuery(
        content,
        systemPrompt,
        history,
        options,
      );

      if (response.success && response.content) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.content,
          timestamp: Date.now(),
          model: modelPath.split("/").pop() || modelPath,
          generationTime: response.generationTime,
          sources: response.sources,
        };
        addMessage(assistantMessage);

        // Persist assistant message
        await commands.addMessage(chatId!, assistantMessage);
        updateHistory(assistantMessage);
      } else {
        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content:
            response.error ||
            "An error occurred while processing your request.",
          timestamp: Date.now(),
        };
        addMessage(errorMessage);
        // Persist error message.
        await commands.addMessage(chatId!, errorMessage);
        updateHistory(errorMessage);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Failed to connect to the AI service. Please try again.",
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
      await commands.addMessage(chatId!, errorMessage);
      updateHistory(errorMessage);
    }
  },

  deleteMessage: async (messageTimestamp: number) => {
    const { messages, currentChatId } = get();
    if (!currentChatId) return;

    const newMessages = messages.filter(
      (m) => m.timestamp !== messageTimestamp,
    );
    set({ messages: newMessages });

    try {
      await commands.deleteMessage(currentChatId, messageTimestamp);

      // Update history
      set((state) => ({
        chatHistory: state.chatHistory.map((c) =>
          c.id === currentChatId ? { ...c, messages: newMessages } : c,
        ),
      }));
    } catch (e) {
      console.error("Failed to delete message:", e);
    }
  },
}));
