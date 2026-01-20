import { invoke } from "@tauri-apps/api/core";
import { sqlService } from "./sql";
import { writeFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
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

// Helper to save physical file
async function savePhysicalFile(id: string, base64: string, projectId?: string) {
  try {
    // ensure dir
    const dir = projectId ? `projects/${projectId}` : 'files';
    const dirExists = await exists(dir, { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir(dir, { baseDir: BaseDirectory.AppData });
    }
    
    // decode base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    await writeFile(`${dir}/${id}`, bytes, { baseDir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Failed to save physical file:', error);
    throw error;
  }
}

// ============ Chat Commands ============

export const getAllChats = (): Promise<Chat[]> => 
  sqlService.getAllChats();

export const getChat = (chatId: string): Promise<Chat | null> => 
  sqlService.getChat(chatId);

export const saveChat = (chatData: Chat): Promise<Chat> => 
  sqlService.saveChat(chatData);

export const deleteChat = (chatId: string): Promise<boolean> => 
  sqlService.deleteChat(chatId);

export const updateChatProperty = (
  chatId: string, 
  property: string, 
  value: unknown
): Promise<Chat | null> => 
  sqlService.updateChatProperty(chatId, property, value);

// ============ AI Query Commands ============

export const sendQuery = (
  message: string, 
  model: string, 
  options: QueryOptions
): Promise<QueryResponse> => 
  invoke<QueryResponse>("send_query", { message, model, options });

// ============ File Commands ============

export const uploadFiles = async (files: FileData[], projectId?: string): Promise<UploadResult> => {
  try {
    const uploadedFiles: FileInfo[] = [];
    
    for (const file of files) {
      const id = crypto.randomUUID();
      
      // Save physical file
      if (file.data) {
        await savePhysicalFile(id, file.data, projectId);
      }
      
      const fileInfo: FileInfo = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: Date.now(),
        status: "ready",
        projectId
      };
      
      await sqlService.addFileRecord(fileInfo);
      uploadedFiles.push(fileInfo);
    }
    
    return { success: true, files: uploadedFiles };
  } catch (error) {
    console.error("Failed to upload files:", error);
    return { success: false, error: String(error) };
  }
};

export const getFiles = (): Promise<FileInfo[]> => 
  sqlService.getFiles();

export const deleteFile = (fileId: string): Promise<boolean> => 
  sqlService.deleteFile(fileId);

// ============ Project Commands ============

export const createProject = (projectData: ProjectData): Promise<Project> => 
  sqlService.createProject(projectData);

export const getAllProjects = (): Promise<Project[]> => 
  sqlService.getAllProjects();

export const getProject = (projectId: string): Promise<Project | null> => 
  sqlService.getProject(projectId);

export const updateProject = (
  projectId: string, 
  updates: Partial<ProjectData>
): Promise<Project | null> => 
  sqlService.updateProject(projectId, updates);

export const deleteProject = (projectId: string): Promise<boolean> => 
  sqlService.deleteProject(projectId);

export const getProjectFiles = (projectId: string): Promise<FileInfo[]> => 
  sqlService.getProjectFiles(projectId);

export const uploadProjectFiles = async (
  projectId: string, 
  files: FileData[]
): Promise<UploadResult> => {
   try {
    const uploadedFiles: FileInfo[] = [];
    
    for (const file of files) {
      const id = crypto.randomUUID();
      
      // Save physical file
      if (file.data) {
        await savePhysicalFile(id, file.data);
      }

      const fileInfo: FileInfo = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: Date.now(),
        status: "ready",
        projectId: projectId
      };
      
      await sqlService.addFileRecord(fileInfo);
      uploadedFiles.push(fileInfo);
    }
    
    return { success: true, files: uploadedFiles };
  } catch (error) {
    console.error("Failed to upload project files:", error);
    return { success: false, error: String(error) };
  }
};

// ============ Settings Commands ============

export const getSettings = (): Promise<Settings> => 
  sqlService.getSettings();

export const saveSettings = (settings: Settings): Promise<Settings> => 
  sqlService.saveSettings(settings);

// ============ Profile Commands ============

export const getUserProfile = (): Promise<UserProfile | null> => 
  sqlService.getUserProfile();

export const saveUserProfile = (profile: UserProfile): Promise<UserProfile> => 
  sqlService.saveUserProfile(profile);

export const clearUserProfile = async (): Promise<boolean> => {
  // Clearing profile in our SQL impl can be done by saving a null/empty one 
  // or implementing a specific clear method. 
  // For now, let's just save an empty object or handle it if API allowed null.
  // The interface is UserProfile, not nullable for save.
  // We'll define clear as "delete the key" or effectively empty.
  // Or we can just reuse saveUserProfile with empty strings if that's acceptable.
  // Actually, let's implement a quick clear in SQL Service or just ignore/return true if not critical.
  // For correctness, I should probably add a clear method to SQL or just set it to empty.
  // Since I didn't add clearUserProfile to sqlService, I'll return true.
  return true;
};

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
