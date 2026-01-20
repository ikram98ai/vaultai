import { create } from 'zustand';
import type { Tab, Notification } from '../types';

interface UIState {
  // Navigation
  activeTab: Tab;
  
  // Sidebar
  sidebarOpen: boolean;
  
  // Welcome screen
  showWelcome: boolean;
  
  // Modals
  profileModalOpen: boolean;
  settingsModalOpen: boolean;
  sourceToolModalOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  setActiveTab: (tab: Tab) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setShowWelcome: (show: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openSourceToolModal: () => void;
  closeSourceToolModal: () => void;
  showNotification: (message: string, type?: Notification['type'], duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  activeTab: 'chat',
  sidebarOpen: false,
  showWelcome: true,
  profileModalOpen: false,
  settingsModalOpen: false,
  sourceToolModalOpen: false,
  notifications: [],

  // Navigation
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Sidebar
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Welcome screen
  setShowWelcome: (show) => set({ showWelcome: show }),

  // Profile modal
  openProfileModal: () => set({ profileModalOpen: true }),
  closeProfileModal: () => set({ profileModalOpen: false }),

  // Settings modal
  openSettingsModal: () => set({ settingsModalOpen: true }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),

  // Source tool modal
  openSourceToolModal: () => set({ sourceToolModalOpen: true }),
  closeSourceToolModal: () => set({ sourceToolModalOpen: false }),

  // Notifications
  showNotification: (message, type = 'info', duration = 3000) => {
    const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const notification: Notification = { id, message, type, duration };
    
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
