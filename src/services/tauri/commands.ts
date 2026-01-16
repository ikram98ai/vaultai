import { invoke } from "@tauri-apps/api/core";
import type {
  Chat,
  Project,
  ProjectData,
  FileInfo,
  FileData,
  UploadResult,
  Settings,
  QueryOptions,
  QueryResponse,
  UserProfile,
} from "../../types";

// ============ Chat Commands ============

export const getAllChats = (): Promise<Chat[]> => 
  invoke<Chat[]>("get_all_chats");

export const getChat = (chatId: string): Promise<Chat | null> => 
  invoke<Chat | null>("get_chat", { chatId });

export const saveChat = (chatData: Chat): Promise<Chat> => 
  invoke<Chat>("save_chat", { chatData });

export const deleteChat = (chatId: string): Promise<boolean> => 
  invoke<boolean>("delete_chat", { chatId });

export const updateChatProperty = (
  chatId: string, 
  property: string, 
  value: unknown
): Promise<Chat | null> => 
  invoke<Chat | null>("update_chat_property", { chatId, property, value });

// ============ AI Query Commands ============

export const sendQuery = (
  message: string, 
  model: string, 
  options: QueryOptions
): Promise<QueryResponse> => 
  invoke<QueryResponse>("send_query", { message, model, options });

// ============ File Commands ============

export const uploadFiles = (files: FileData[]): Promise<UploadResult> => 
  invoke<UploadResult>("upload_files", { files });

export const getFiles = (): Promise<FileInfo[]> => 
  invoke<FileInfo[]>("get_files");

export const deleteFile = (fileId: string): Promise<boolean> => 
  invoke<boolean>("delete_file", { fileId });

// ============ Project Commands ============

export const createProject = (projectData: ProjectData): Promise<Project> => 
  invoke<Project>("create_project", { projectData });

export const getAllProjects = (): Promise<Project[]> => 
  invoke<Project[]>("get_all_projects");

export const getProject = (projectId: string): Promise<Project | null> => 
  invoke<Project | null>("get_project", { projectId });

export const updateProject = (
  projectId: string, 
  updates: Partial<ProjectData>
): Promise<Project | null> => 
  invoke<Project | null>("update_project", { projectId, updates });

export const deleteProject = (projectId: string): Promise<boolean> => 
  invoke<boolean>("delete_project", { projectId });

export const getProjectFiles = (projectId: string): Promise<FileInfo[]> => 
  invoke<FileInfo[]>("get_project_files", { projectId });

export const uploadProjectFiles = (
  projectId: string, 
  files: FileData[]
): Promise<UploadResult> => 
  invoke<UploadResult>("upload_project_files", { projectId, files });

// ============ Settings Commands ============

export const getSettings = (): Promise<Settings> => 
  invoke<Settings>("get_settings");

export const saveSettings = (settings: Settings): Promise<Settings> => 
  invoke<Settings>("save_settings", { settings });

// ============ Profile Commands ============

export const getUserProfile = (): Promise<UserProfile | null> => 
  invoke<UserProfile | null>("get_user_profile");

export const saveUserProfile = (profile: UserProfile): Promise<UserProfile> => 
  invoke<UserProfile>("save_user_profile", { profile });

export const clearUserProfile = (): Promise<boolean> => 
  invoke<boolean>("clear_user_profile");

// ============ System Commands ============

export const getSystemTier = (): Promise<{ 
  tier: string; 
  recommendedModels: { default: string } 
}> => 
  invoke("get_system_tier");

export const getMemoryUsage = (): Promise<{ 
  used: number; 
  total: number; 
  percentage: number 
}> => 
  invoke("get_memory_usage");
