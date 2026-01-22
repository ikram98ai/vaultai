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
  agentModeEnabled: boolean;
  
  // Source tool toggles
  sourceWebEnabled: boolean;
  sourceProfileEnabled: boolean;
  sourceProjectsEnabled: boolean;
  sourceProjectSlugs: string[];
  
  // Theme
  theme: 'dark' | 'light' | 'system';

  // Settings
  settings: Settings | null;
  isLoadingSettings: boolean;
  
  // Actions
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setCurrentModel: (model: string) => void;
  setSystemTier: (tier: 'lite' | 'standard' | 'performance') => void;
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setAgentMode: (enabled: boolean) => void;
  setSourceWebEnabled: (enabled: boolean) => void;
  setSourceProfileEnabled: (enabled: boolean) => void;
  setSourceProjectsEnabled: (enabled: boolean) => void;
  toggleSourceProject: (slug: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  detectSystemTier: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  theme: 'dark',
  currentModel: 'vaultai16-code',
  systemTier: 'lite',
  ragEnabled: true,
  webSearchEnabled: true,
  agentModeEnabled: false,
  sourceWebEnabled: true,
  sourceProfileEnabled: true,
  sourceProjectsEnabled: true,
  sourceProjectSlugs: (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sourceToolProjectToggles') || '{}');
      return Object.keys(stored).filter(slug => stored[slug]);
    } catch (e) {
      return [];
    }
  })(),
  settings: null,
  isLoadingSettings: false,

  // Actions
  setTheme: (theme) => set({ theme }),
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

  setAgentMode: (enabled) => set({ agentModeEnabled: enabled }),
  setSourceWebEnabled: (enabled) => set({ sourceWebEnabled: enabled }),
  setSourceProfileEnabled: (enabled) => set({ sourceProfileEnabled: enabled }),
  setSourceProjectsEnabled: (enabled) => set({ sourceProjectsEnabled: enabled }),
  
  toggleSourceProject: (slug) => {
    set((state) => {
      const isSelected = state.sourceProjectSlugs.includes(slug);
      const newSlugs = isSelected
        ? state.sourceProjectSlugs.filter(s => s !== slug)
        : [...state.sourceProjectSlugs, slug];
      
      // Sync with localStorage for compatibility
      try {
        const stored = JSON.parse(localStorage.getItem('sourceToolProjectToggles') || '{}');
        stored[slug] = !isSelected;
        localStorage.setItem('sourceToolProjectToggles', JSON.stringify(stored));
      } catch (e) {
        console.error('Failed to sync project toggles to localStorage', e);
      }
      
      return { sourceProjectSlugs: newSlugs };
    });
  },

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
    const { currentModel, ragEnabled, agentModeEnabled, webSearchEnabled } = get();
    const settings: Settings = {
      model: { chat: currentModel },
      ui: { streamingEnabled: false },
      rag: { enabled: ragEnabled },
      agent:{enabled: agentModeEnabled},
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
