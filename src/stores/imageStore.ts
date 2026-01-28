import { create } from 'zustand';
import type { GeneratedImage } from '../types';
import * as commands from '../services/tauri/commands';
import { getGeneratedImageAsDataUrl } from '../services/tauri/fs';

interface ImageState {
  images: GeneratedImage[];
  isLoadingImages: boolean;
  
  // Actions
  loadImages: () => Promise<void>;
  saveImage: (prompt: string, model: string, base64: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  isLoadingImages: false,

  loadImages: async () => {
    set({ isLoadingImages: true });
    try {
      const dbImages = await commands.getAllGeneratedImages();
      
      // Convert stored paths/IDs to data URLs for display
      const imagesWithUrls = await Promise.all(dbImages.map(async (img) => {
        const dataUrl = await getGeneratedImageAsDataUrl(img.id);
        return { ...img, url: dataUrl || img.url };
      }));
      
      set({ images: imagesWithUrls, isLoadingImages: false });
    } catch (error) {
      console.error('Failed to load images:', error);
      set({ isLoadingImages: false });
    }
  },

  saveImage: async (prompt: string, model: string, base64: string) => {
    try {
      const id = crypto.randomUUID();
      const image: GeneratedImage = {
        id,
        prompt,
        model,
        url: `generated_images/${id}.png`, // Path reference
        createdAt: Date.now()
      };
      
      await commands.saveGeneratedImage(image, base64);
      await get().loadImages();
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  },

  deleteImage: async (id: string) => {
    try {
      const success = await commands.deleteGeneratedImage(id);
      if (success) {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  },
}));
