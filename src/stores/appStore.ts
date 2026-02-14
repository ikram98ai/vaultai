import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ModelInfo, UserProfile } from "../types";
import { getSystemTier, getMemoryUsage, startLlamafile } from "../services/tauri/commands";

interface AppState {
  // Model state
  currentModelPath: string;
  systemTier: "lite" | "pro" | "multi-user" | "ultra" | "max";
  availableModels: ModelInfo[];
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  } | null;
  isModelLoading: boolean;

  // Feature toggles
  ragEnabled: boolean;
  webSearchEnabled: boolean;

  // Source tool toggles
  sourceWebEnabled: boolean;
  sourceProfileEnabled: boolean;
  sourceProjectsEnabled: boolean;
  sourceProjectIds: string[];

  // Theme
  theme: "dark" | "light" | "system";

  // Profile
  userProfile: UserProfile | null;

  // Actions
  setTheme: (theme: "dark" | "light" | "system") => void;
  setCurrentModelPath: (model: string) => void;
  setSystemTier: (
    tier: "lite" | "pro" | "multi-user" | "ultra" | "max",
  ) => void;
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setSourceWebEnabled: (enabled: boolean) => void;
  setSourceProfileEnabled: (enabled: boolean) => void;
  setSourceProjectsEnabled: (enabled: boolean) => void;
  toggleSourceProject: (id: string) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setAvailableModels: (models: Array<ModelInfo>) => void;
  detectSystemTier: () => Promise<void>;
  refreshMemoryUsage: () => Promise<void>;
  clearProfile: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "dark",
      currentModelPath: "",
      systemTier: "lite",
      availableModels: [],
      memoryUsage: null,
      isModelLoading: false,
      ragEnabled: true,
      webSearchEnabled: true,
      sourceWebEnabled: true,
      sourceProfileEnabled: true,
      sourceProjectsEnabled: true,
      sourceProjectIds: [],
      userProfile: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setCurrentModelPath: async (modelPath) => {
        set({ currentModelPath: modelPath });

        // Handle llamafile lifecycle
        if (modelPath.endsWith(".llamafile")) {
          set({ isModelLoading: true });
          try {
            await startLlamafile(modelPath);
          } catch (e) {
            console.error("Failed to start llamafile:", e);
          } finally {
            set({ isModelLoading: false });
          }
        } 
     
      },
      setSystemTier: (tier) => set({ systemTier: tier }),
      setRagEnabled: (enabled) => set({ ragEnabled: enabled }),
      setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
      setSourceWebEnabled: (enabled) => set({ sourceWebEnabled: enabled }),
      setSourceProfileEnabled: (enabled) =>
        set({ sourceProfileEnabled: enabled }),
      setSourceProjectsEnabled: (enabled) =>
        set({ sourceProjectsEnabled: enabled }),

      toggleSourceProject: (id) => {
        set((state) => {
          const isSelected = state.sourceProjectIds.includes(id);
          const newIds = isSelected
            ? state.sourceProjectIds.filter((s) => s !== id)
            : [...state.sourceProjectIds, id];
          return { sourceProjectIds: newIds };
        });
      },

      setUserProfile: (profile) => set({ userProfile: profile }),
      clearProfile: () => set({ userProfile: null }),

      setAvailableModels: (models) => set({ availableModels: models }),

      detectSystemTier: async () => {
        try {
          const { tier, defaultModel, availableModels } = await getSystemTier();          

          set({
            systemTier: tier as any,
            currentModelPath: defaultModel,
            availableModels: availableModels,
          });

          // Also fetch memory usage
          const memory = await getMemoryUsage();
          set({ memoryUsage: memory });
        } catch (error) {
          console.warn("Could not detect system tier:", error);
          // Don't overwrite if we already have a tier from previous session
          if (!get().systemTier) {
            set({ systemTier: "lite", currentModelPath: "gemma-3-270m-it" });
          }
        }
      },

      refreshMemoryUsage: async () => {
        try {
          const memory = await getMemoryUsage();
          set({ memoryUsage: memory });
        } catch (error) {
          console.warn("Could not refresh memory usage:", error);
        }
      },
    }),
    {
      name: "vaultai-app-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
