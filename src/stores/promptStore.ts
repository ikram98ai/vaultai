import { create } from 'zustand';
import type { Prompt } from '../types';
import * as commands from '../services/tauri/commands';

interface PromptState {
  prompts: Prompt[];
  isLoadingPrompts: boolean;
  
  // Actions
  loadPrompts: () => Promise<void>;
  savePrompt: (prompt: Prompt) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: [],
  isLoadingPrompts: false,

  loadPrompts: async () => {
    set({ isLoadingPrompts: true });
    try {
      const prompts = await commands.getAllPrompts();
      set({ prompts, isLoadingPrompts: false });
    } catch (error) {
      console.error('Failed to load prompts:', error);
      set({ isLoadingPrompts: false });
    }
  },

  savePrompt: async (prompt: Prompt) => {
    try {
      const savedPrompt = await commands.savePrompt(prompt);
      set((state) => ({
        prompts: [savedPrompt, ...state.prompts.filter(p => p.id !== savedPrompt.id)]
      }));
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  },

  deletePrompt: async (promptId: string) => {
    try {
      const success = await commands.deletePrompt(promptId);
      if (success) {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== promptId),
        }));
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  },
}));
