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

// ============ Settings Types ============

export interface Settings {
  model: {
    chat: string;
  };
  ui: {
    streamingEnabled: boolean;
  };
  rag: {
    enabled: boolean;
  };
  agent: {
    enabled: boolean;
  };
  privateSearch: boolean;
  privacy?: {
    offlineMode: boolean;
    clearMemoryAfterSensitive: boolean;
  };
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
}

// ============ Model Types ============

export interface Model {
  id: string;
  name: string;
  description: string;
  type: "chat" | "code" | "fast" | "image";
}

export const MODELS: Model[] = [
  {
    id: "vaultai16-chat",
    name: "Mistral Nemo 12B",
    description: "Conversational AI",
    type: "chat",
  },
  {
    id: "vaultai16-code",
    name: "Devstral",
    description: "Code Assistant",
    type: "code",
  },
  {
    id: "vaultai16-fast",
    name: "LLaMA 3.2 3B",
    description: "Fast Responses",
    type: "fast",
  },
  {
    id: "flux-schnell",
    name: "FLUX.1-schnell",
    description: "Image Generation",
    type: "image",
  },
  {
    id: "infiniteyou-flux",
    name: "InfiniteYou-FLUX",
    description: "Identity-Preserving Image",
    type: "image",
  },
];

// ============ Query Types ============

export interface QueryOptions {
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  agentMode: boolean;
  projectId?: string;
}

export interface QueryResponse {
  success: boolean;
  content?: string;
  generationTime?: number;
  memoryData?: MemoryData;
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
