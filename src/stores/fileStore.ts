import { create } from 'zustand';
import type { FileInfo, FileData } from '../types';
import * as commands from '../services/tauri/commands';

interface UploadProgressFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

interface FileState {
  files: FileInfo[];
  uploadingFiles: UploadProgressFile[];
  isLoadingFiles: boolean;
  
  // Actions
  loadFiles: () => Promise<void>;
  uploadFiles: (files: FileData[]) => Promise<{ success: boolean; error?: string }>;
  deleteFile: (fileId: string) => Promise<boolean>;
  setUploadingFiles: (files: UploadProgressFile[]) => void;
  updateUploadingFile: (name: string, update: Partial<UploadProgressFile>) => void;
  removeUploadingFile: (name: string) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  uploadingFiles: [],
  isLoadingFiles: false,

  loadFiles: async () => {
    set({ isLoadingFiles: true });
    try {
      const allFiles = await commands.getFiles();
      // Filter out project files (those with projectId) to only show global files
      const globalFiles = allFiles.filter(f => !f.projectId);
      set({ files: globalFiles, isLoadingFiles: false });
    } catch (error) {
      console.error('Failed to load files:', error);
      set({ isLoadingFiles: false });
    }
  },

  uploadFiles: async (files: FileData[]) => {
    try {
      const result = await commands.uploadFiles(files);
      if (result.success) {
        await get().loadFiles();
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Failed to upload files:', error);
      return { success: false, error: String(error) };
    }
  },

  deleteFile: async (fileId: string) => {
    try {
      const success = await commands.deleteFile(fileId);
      if (success) {
        set((state) => ({
          files: state.files.filter((f) => f.id !== fileId),
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  },

  setUploadingFiles: (files) => set({ uploadingFiles: files }),
  
  updateUploadingFile: (name, update) => set((state) => ({
    uploadingFiles: state.uploadingFiles.map((f) => 
      f.name === name ? { ...f, ...update } : f
    )
  })),

  removeUploadingFile: (name) => set((state) => ({
    uploadingFiles: state.uploadingFiles.filter((f) => f.name !== name)
  })),
}));
