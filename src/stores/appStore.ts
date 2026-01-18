import { create } from 'zustand';
import type { Settings } from '../types';
import * as commands from '../services/tauri/commands';

interface AppState {
  // Model state
  currentModel: string;
  systemTier: 'lite' | 'standard' | 'performance';
  
  // Feature toggles
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  agentMode: boolean;
  
  // Settings
  settings: Settings | null;
  isLoadingSettings: boolean;
  
  // Actions
  setCurrentModel: (model: string) => void;
  setSystemTier: (tier: 'lite' | 'standard' | 'performance') => void;
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setAgentMode: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  detectSystemTier: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentModel: 'vaultai16-code',
  systemTier: 'lite',
  ragEnabled: true,
  webSearchEnabled: true,
  agentMode: false,
  settings: null,
  isLoadingSettings: false,

  // Actions
  setCurrentModel: (model) => {
    set({ currentModel: model });
    // Auto-save settings when model changes
    get().saveSettings();
  },

  setSystemTier: (tier) => set({ systemTier: tier }),

  setRagEnabled: (enabled) => {
    set({ ragEnabled: enabled });
    get().saveSettings();
  },

  setWebSearchEnabled: (enabled) => {
    set({ webSearchEnabled: enabled });
    get().saveSettings();
  },

  setAgentMode: (enabled) => set({ agentMode: enabled }),

  loadSettings: async () => {
    set({ isLoadingSettings: true });
    try {
      const settings = await commands.getSettings();
      set({
        settings,
        currentModel: settings.model?.chat || 'vaultai16-code',
        ragEnabled: settings.rag?.enabled ?? true,
        webSearchEnabled: settings.privateSearch ?? true,
        isLoadingSettings: false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoadingSettings: false });
    }
  },

  saveSettings: async () => {
    const { currentModel, ragEnabled, agentMode, webSearchEnabled } = get();
    const settings: Settings = {
      model: { chat: currentModel },
      ui: { streamingEnabled: false },
      rag: { enabled: ragEnabled },
      agent:{enabled: agentMode},
      privateSearch: webSearchEnabled,
    };
    
    try {
      await commands.saveSettings(settings);
      set({ settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  detectSystemTier: async () => {
    try {
      const { tier, recommendedModels } = await commands.getSystemTier();
      set({
        systemTier: tier as 'lite' | 'standard' | 'performance',
        currentModel: recommendedModels?.default || 'vaultai16-code',
      });
    } catch (error) {
      console.warn('Could not detect system tier:', error);
      set({ systemTier: 'lite', currentModel: 'vaultai16-code' });
    }
  },
}));
