// TypeScript types for VaultAI application
// These match the data structures from the original vanilla JS application

// ============ Chat Types ============

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  model?: string;
  generationTime?: number;
  memoryData?: MemoryData;
  sources?: Source[];
  isImageGeneration?: boolean;
  promptRef?: PromptReference;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  model?: string;
  pinned: boolean;
  projectId?: string;
}

export interface MemoryData {
  used: number;
  total: number;
  percentage: number;
}

export interface Source {
  type: "file" | "web" | "project";
  title: string;
  url?: string;
  content?: string;
}

export interface PromptReference {
  id: string;
  title: string;
  content: string;
}

// ============ Project Types ============

export interface Project {
  id: string;
  slug: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  files: string[];
  chats: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// ============ File Types ============

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  status: "processing" | "ready" | "error";
  projectId?: string;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
}

export interface UploadResult {
  success: boolean;
  files?: FileInfo[];
  error?: string;
}

// ============ Profile Types ============

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  pronouns?: string;
  dob?: string;
  location?: string;
  occupation?: string;
  employer?: string;
  aliases?: string;
  interests?: string;
  communicationStyle?: string;
  relationships?: string;
  notes?: string;
}

// ============ Image Types ============

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  model: string;
  createdAt: number;
}

// ============ Model Types ============

export interface SystemTier {
  tier: string;
  defaultModel: string;
  supportedModels: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

// ============ Query Types ============

export interface QueryOptions {
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  agentModeEnabled: boolean;
  userProfileEnabled: boolean;
  projectId?: string;
  projectSlugs?: string[];
}

export interface QueryResponse {
  success: boolean;
  content?: string;
  generationTime?: number;
  sources?: Source[];
  error?: string;
}

// ============ Prompt Types ============

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  icon?: string;
}

export type PromptCategory =
  | "all"
  | "productivity"
  | "writing"
  | "coding"
  | "analysis"
  | "creative"
  | "learning";

// ============ UI Types ============

export type Tab = "chat" | "files" | "projects" | "images" | "prompts";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}
