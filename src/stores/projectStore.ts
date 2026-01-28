import { create } from 'zustand';
import type { Project, ProjectData, FileInfo, FileData } from '../types';
import * as commands from '../services/tauri/commands';

interface ProjectState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  isLoadingProjects: boolean;
  
  // Project files
  projectFiles: FileInfo[];
  isLoadingProjectFiles: boolean;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  clearCurrentProject: () => void;
  
  // Project operations
  loadProjects: () => Promise<void>;
  createProject: (data: ProjectData) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<ProjectData>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Project files
  loadProjectFiles: (projectId: string) => Promise<void>;
  uploadFilesToProject: (projectId: string, files: FileData[]) => Promise<void>;
  deleteProjectFile: (fileId: string, projectId: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // Initial state
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  projectFiles: [],
  isLoadingProjectFiles: false,
  isUploading: false,
  uploadProgress: 0,

  // Basic setters
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  clearCurrentProject: () => set({ currentProject: null }),

  // Load all projects
  loadProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const projects = await commands.getAllProjects();
      set({ projects, isLoadingProjects: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ isLoadingProjects: false });
    }
  },

  // Create new project
  createProject: async (data: ProjectData) => {
    try {
      const project = await commands.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
      }));
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  },

  // Update project
  updateProject: async (projectId: string, updates: Partial<ProjectData>) => {
    try {
      const updatedProject = await commands.updateProject(projectId, updates);
      if (updatedProject) {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? updatedProject : p
          ),
          currentProject:
            state.currentProject?.id === projectId ? updatedProject : state.currentProject,
        }));
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    try {
      const success = await commands.deleteProject(projectId);
      if (success) {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId ? null : state.currentProject,
        }));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  // Load project files
  loadProjectFiles: async (projectId: string) => {
    set({ isLoadingProjectFiles: true });
    try {
      const files = await commands.getProjectFiles(projectId);
      set({ projectFiles: files, isLoadingProjectFiles: false });
    } catch (error) {
      console.error('Failed to load project files:', error);
      set({ isLoadingProjectFiles: false });
    }
  },

  // Upload files to project
  uploadFilesToProject: async (projectId: string, files: FileData[]) => {
    set({ isUploading: true, uploadProgress: 0 });
    try {
      const result = await commands.uploadFiles(files, projectId);
      if (result.success && result.files) {
        set((state) => ({
          projectFiles: [...state.projectFiles, ...result.files!],
          isUploading: false,
          uploadProgress: 100,
        }));
      } else {
        console.error('Upload failed:', result.error);
        set({ isUploading: false, uploadProgress: 0 });
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      set({ isUploading: false, uploadProgress: 0 });
    }
  },

  deleteProjectFile: async (fileId: string, projectId: string) => {
    try {
      const success = await commands.deleteFile(fileId, projectId);
      if (success) {
        set((state) => ({
          projectFiles: state.projectFiles.filter((f) => f.id !== fileId),
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete project file:', error);
      return false;
    }
  },
}));
