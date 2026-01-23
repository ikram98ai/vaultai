import { useRef, useEffect, useState } from "react";
import { useProjectStore } from "../stores/projectStore";
import { useChatStore } from "../stores/chatStore";
import { useAppStore } from "../stores/appStore";
import { useUIStore } from "../stores/uiStore";
import { Message } from "./common/Message";
import { ModelSelector } from "./common/ModelSelector";
import type { FileData } from "../types";
import { deleteFile } from "../services/tauri/commands";

export function ProjectDetail() {
  const { 
    currentProject, 
    clearCurrentProject, 
    loadProjectFiles, 
    projectFiles, 
    uploadFilesToProject,
    isUploading
  } = useProjectStore();
  const { 
    messages, 
    isSending, 
    sendMessage, 
    setCurrentProjectId,
    setMessages,
    createNewChat,
    chatHistory,
    loadChat
  } = useChatStore();
  const { 
    currentModel,
    ragEnabled,
    webSearchEnabled,
    agentModeEnabled,
    sourceProfileEnabled
  } = useAppStore();
  const { showNotification } = useUIStore();
  
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (currentProject) {
      loadProjectFiles(currentProject.id);
      setCurrentProjectId(currentProject.id);
      
      // Load the most recent chat for this project, or create a new one
      const projectChats = chatHistory.filter(c => c.projectId === currentProject.id)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      if (projectChats.length > 0) {
        // Load the most recent chat
        loadChat(projectChats[0].id);
      } else {
        // Create a new chat for this project
        setMessages([]);
        createNewChat();
      }
    }
    
    return () => {
      setCurrentProjectId(null);
    };
  }, [currentProject]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentProject) return null;

  const handleBack = () => {
    clearCurrentProject();
  };

  const handleSendMessage = async () => {
    const content = chatInputRef.current?.value.trim();
    if (!content || isSending) return;

    if (chatInputRef.current) chatInputRef.current.value = "";

    await sendMessage(content, currentModel, {
      ragEnabled: ragEnabled,
      webSearchEnabled: webSearchEnabled,
      agentModeEnabled: agentModeEnabled,
      userProfileEnabled: sourceProfileEnabled,
      projectId: currentProject.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (files: File[]) => {
    const fileDataList: FileData[] = [];
    for (const file of files) {
      const base64Data = await fileToBase64(file);
      fileDataList.push({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: base64Data,
      });
    }
    await uploadFilesToProject(currentProject.id, fileDataList);
    showNotification(`Uploaded ${files.length} files to project`, 'success');
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const success = await deleteFile(fileId);
      if (success) {
        await loadProjectFiles(currentProject.id);
        showNotification('File deleted', 'success');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      showNotification('Failed to delete file', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`;
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border bg-bg-primary shrink-0">
        <button 
          className="flex items-center gap-2 bg-transparent border-none text-text-secondary cursor-pointer hover:text-text-primary transition-colors text-sm font-medium"
          onClick={handleBack}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Projects
        </button>
        <div className="flex-1 text-center ">
            <h2 className="text-lg font-semibold text-brand m-0">{currentProject.name}</h2>
        </div>
        <div className="w-35"></div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Files Column */}
        <div className="w-75 border-r border-border bg-bg-primary flex flex-col min-w-62.5 shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary m-0 mb-3">Project Files</h3>
            <div 
              className={`border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer transition-all hover:border-accent hover:bg-bg-tertiary ${isDragging ? 'border-accent bg-bg-tertiary' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('projectFileInput')?.click()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                width="32" 
                height="32"
                className="mx-auto mb-2 text-text-muted"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-xs text-text-muted m-0 font-medium">Drop files to upload</p>
              <input 
                  type="file" 
                  id="projectFileInput" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) handleFileUpload(files);
                  }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {isUploading && (
              <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg opacity-70">
                <div className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin"></div>
                <span className="text-xs text-text-secondary">Uploading files...</span>
              </div>
            )}
            {projectFiles.map((file) => (
              <div key={file.id} className="bg-bg-primary border border-border rounded-lg p-3 group relative hover:border-accent transition-colors">
                <div className="flex items-start gap-3">
                    <div className="text-accent-primary shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary truncate mb-1" title={file.name}>{file.name}</div>
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                            <span>{formatDate(file.uploadedAt)}</span>
                            <span>• {formatFileSize(file.size)}</span>
                        </div>
                    </div>
                    <button 
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-text-muted hover:text-red-400 hover:bg-hover-bg rounded transition-all" 
                      title="Delete file"
                      onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                      }}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
              </div>
            ))}
            {projectFiles.length === 0 && !isUploading && (
              <div className="text-center p-4 text-text-muted text-xs italic">
                No project files yet.
              </div>
            )}
          </div>
        </div>

        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary relative">
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6" id="projectChatMessages">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} isLast={index === messages.length - 1} />
                ))}
                {isSending && (
                    <div className="flex justify-start relative w-full">
                        <div className="w-8 h-8 rounded-full bg-accent mr-3 mt-1 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs">AI</span> {/* Placeholder avatar if needed */}
                        </div>
                        <div className="bg-bg-secondary border border-border rounded-lg p-4 rounded-bl-sm">
                            <div className="flex items-center gap-1 py-1">
                                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatMessagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-4 border-t border-border bg-bg-primary">
                <div className="max-w-4xl mx-auto relative bg-bg-secondary/30 border border-border rounded-xl p-3 focus-within:ring-1 focus-within:ring-bg-input transition-all">
                    <input
                        type="text"
                        ref={chatInputRef}
                        className="w-full bg-transparent border-none text-text-primary text-base outline-none placeholder:text-text-muted mb-2"
                        placeholder="What do you want to know about this Project?"
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                    />
                    <div className="flex items-center justify-end gap-3">
                        <ModelSelector />
                        <button 
                            className={`w-8 h-8 flex items-center justify-center bg-text-primary text-bg-primary rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isSending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            onClick={handleSendMessage}
                            disabled={isSending}
                        >
                             <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
