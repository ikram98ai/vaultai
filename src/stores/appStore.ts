import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ModelInfo, UserProfile } from '../types';
import {getSystemTier} from '../services/tauri/commands';

interface AppState {
  // Model state
  currentModel: string;
  systemTier:  'lite' | 'pro' | 'multi-user' | 'ultra' | 'max';
  supportedModels: ModelInfo[];
  
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

  // Profile
  userProfile: UserProfile | null;

  // Actions
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setCurrentModel: (model: string) => void;
  setSystemTier: (tier: 'lite' | 'pro' | 'multi-user' | 'ultra' | 'max') => void;
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setAgentMode: (enabled: boolean) => void;
  setSourceWebEnabled: (enabled: boolean) => void;
  setSourceProfileEnabled: (enabled: boolean) => void;
  setSourceProjectsEnabled: (enabled: boolean) => void;
  toggleSourceProject: (slug: string) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setSupportedModels: (models: Array<{id: string, name: string, description: string}>) => void;
  detectSystemTier: () => Promise<void>;
  clearProfile: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'dark',
      currentModel: '',
      systemTier: 'lite',
      supportedModels: [],
      ragEnabled: true,
      webSearchEnabled: true,
      agentModeEnabled: false,
      sourceWebEnabled: true,
      sourceProfileEnabled: true,
      sourceProjectsEnabled: true,
      sourceProjectSlugs: [],
      userProfile: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setCurrentModel: (model) => set({ currentModel: model }),
      setSystemTier: (tier) => set({ systemTier: tier }),
      setRagEnabled: (enabled) => set({ ragEnabled: enabled }),
      setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
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
          return { sourceProjectSlugs: newSlugs };
        });
      },

      setUserProfile: (profile) => set({ userProfile: profile }),
      clearProfile: () => set({ userProfile: null }),

      setSupportedModels: (models) => set({ supportedModels: models }),
      
      detectSystemTier: async () => {
        try {
          const { tier, defaultModel, supportedModels } = await getSystemTier();
          const {currentModel} = get();
          set({
            systemTier: tier as any,
            currentModel: currentModel || defaultModel,
            supportedModels: supportedModels,
          });
        } catch (error) {
          console.warn('Could not detect system tier:', error);
          // Don't overwrite if we already have a tier from previous session
          if (!get().systemTier) {
            set({ systemTier: 'lite', currentModel: 'mistral-nemo-12b' });
          }
        }
      },

    }),
    {
      name: 'vaultai-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);