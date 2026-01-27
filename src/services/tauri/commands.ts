import { invoke } from "@tauri-apps/api/core";
import { sqlService } from "./sql";
import { savePhysicalFile } from "./fs";
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
  Prompt,
  Message
} from "../../types";


// ============ Chat Commands ============

export const getAllChats = (): Promise<Chat[]> => 
  sqlService.getAllChats();

export const getProjectChats = (projectId: string): Promise<Chat[]> => 
  sqlService.getProjectChats(projectId);

export const getChat = (chatId: string): Promise<Chat | null> => 
  sqlService.getChat(chatId);

export const createChat = (chatData: Chat): Promise<Chat> => 
  sqlService.createChat(chatData);

export const addMessage = (chatId: string, message: Message): Promise<boolean> => 
  sqlService.addMessage(chatId, message);

export const deleteMessage = (chatId: string, timestamp: number): Promise<boolean> => 
  sqlService.deleteMessage(chatId, timestamp);

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
  history: Message[],
  model: string, 
  options: QueryOptions
): Promise<QueryResponse> => 
  invoke<QueryResponse>("send_query", { message, history, model, options });

// ============ File Commands ============

export const uploadFiles = async (files: FileData[], projectId?: string): Promise<UploadResult> => {
  try {
    const uploadedFiles: FileInfo[] = [];
    
    for (const file of files) {
      if (await sqlService.isDuplicateFile(file.name, file.size, file.type, projectId)) {
        console.warn(`Duplicate file detected: ${file.name}, skipping upload.`);
        continue;
      }

      const id = `${crypto.randomUUID()}-${file.name}`;

      const fileInfo: FileInfo = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: Date.now(),
        status: "ready",
        projectId: projectId
      };

      // Save physical file
      if (file.data) {
        await savePhysicalFile(id, file.data, projectId);
      }

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

// ============ Prompt Commands ============

export const getAllPrompts = (): Promise<Prompt[]> => 
  sqlService.getAllPrompts();

export const savePrompt = (prompt: Prompt): Promise<Prompt> => 
  sqlService.savePrompt(prompt);

export const deletePrompt = (promptId: string): Promise<boolean> => 
  sqlService.deletePrompt(promptId);
