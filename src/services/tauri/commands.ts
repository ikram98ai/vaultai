import { invoke } from "@tauri-apps/api/core";
import { sqlService } from "./sql";
import { savePhysicalFile, saveGeneratedImageFile, deleteGeneratedImageFile, deletePhysicalFile, deleteProjectDirectory } from "./fs";
import type {
  Chat,
  Project,
  ProjectData,
  FileInfo,
  FileData,
  UploadResult,
  QueryOptions,
  QueryResponse,
  Prompt,
  Message,
  GeneratedImage,
  SystemTier
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
  query: string, 
  systemPrompt: string,
  history: Message[],
  options: QueryOptions,
): Promise<QueryResponse> => 
  invoke<QueryResponse>("send_query", { query, systemPrompt, history, options });

export const ingestDocument = (
  docId: string,
  text: string,
  source: string,
  projectId?: string,
): Promise<void> => 
  invoke("ingest_document", { docId, text, source, projectId });

export const ingestFile = (
  fileId: string,
  fileName: string,
  projectId?: string,
): Promise<void> => 
  invoke("ingest_file", { fileId, fileName, projectId });

// ============ File Commands ============

export const uploadFiles = async (files: FileData[], projectId?: string): Promise<UploadResult> => {
  try {
    const uploadedFiles: FileInfo[] = [];
    let hasError = false;
    let errorMessage = "";
    
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

        // Ingest the file using the new robust backend command
        try {
            await ingestFile(id, file.name, projectId);
            console.log(`Ingested file: ${file.name}`);
        } catch (err) {
            console.error(`Failed to ingest file ${file.name}:`, err);
            hasError = true;
            errorMessage = String(err);
            fileInfo.status = "error";
        }
      }

      await sqlService.addFileRecord(fileInfo);
      uploadedFiles.push(fileInfo);
    }
    
    if (hasError && uploadedFiles.length === 1) {
        return { success: false, error: errorMessage, files: uploadedFiles };
    }

    return { success: true, files: uploadedFiles };
  } catch (error) {
    console.error("Failed to upload files:", error);
    return { success: false, error: String(error) };
  }
};

export const getFiles = (): Promise<FileInfo[]> => 
  sqlService.getFiles();

export const deleteFile = async (fileId: string, projectId?: string): Promise<boolean> => {

  await deletePhysicalFile(fileId, projectId);  
  
  return sqlService.deleteFile(fileId);
}
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

export const deleteProject = async (projectId: string): Promise<boolean> => {
    // 1. Delete physical files
    await deleteProjectDirectory(projectId); // Delete entire project directory
    // 2. SQL Cleanup (Cascading)
    return sqlService.deleteProject(projectId);
}

export const getProjectFiles = (projectId: string): Promise<FileInfo[]> => 
  sqlService.getProjectFiles(projectId);


// ============ System Commands ============

export const getSystemTier = (): Promise<SystemTier> => 
  invoke("get_system_tier");

export const getMemoryUsage = (): Promise<{ 
  used: number; 
  total: number; 
  percentage: number 
}> => 
  invoke("get_memory_usage");


// ============ Llamafile Commands ============

export const startLlamafile = (modelPath: string): Promise<boolean> => 
  invoke("start_llamafile", { modelPath });

export const getRunningModel = (): Promise<string | null> => 
  invoke("get_running_model");

// ============ Prompt Commands ============

export const getAllPrompts = (): Promise<Prompt[]> => 
  sqlService.getAllPrompts();

export const savePrompt = (prompt: Prompt): Promise<Prompt> => 
  sqlService.savePrompt(prompt);

export const deletePrompt = (promptId: string): Promise<boolean> => 
  sqlService.deletePrompt(promptId);

// ============ Image Commands ============

export const getAllGeneratedImages = (): Promise<GeneratedImage[]> => 
  sqlService.getAllGeneratedImages();

export const saveGeneratedImage = async (image: GeneratedImage, base64: string): Promise<void> => {
  await saveGeneratedImageFile(image.id, base64);
  return sqlService.saveGeneratedImage(image);
};

export const deleteGeneratedImage = async (id: string): Promise<boolean> => {
  await deleteGeneratedImageFile(id);
  return sqlService.deleteGeneratedImage(id);
};
