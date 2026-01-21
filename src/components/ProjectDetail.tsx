import { useRef, useEffect, useState } from "react";
import { useProjectStore } from "../stores/projectStore";
import { useChatStore } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore";
import { Message } from "./common/Message";
import { ModelSelector } from "./common/ModelSelector";
import type { FileData } from "../types";
import { deleteFile } from "../services/tauri/commands";
import { useAppStore } from "../stores/appStore";

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
    agentMode
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
        // We need to ensure the store knows we are starting fresh
        setMessages([]);
        createNewChat();
        // The store's createNewChat doesn't reset messages if called directly? 
        // We did setMessages([]) so it's fine.
        // currentProjectId is set, so next message will be scoped.
      }
    }
    
    return () => {
      setCurrentProjectId(null);
    };
  }, [currentProject]); // Only run when project changes

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
      agentMode: agentMode,
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
    <div className="content">
      <div className="project-detail-header">
        <div className="button" id="backToProjects" onClick={handleBack}>
          <svg className="vector-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
          </svg>
          <div className="back-to-projects">Back to Projects</div>
        </div>
        <b className="shawnee">{currentProject.name}</b>
        <div style={{ width: "140px" }}></div>
      </div>
      <div className="content-child"></div>
      <div className="project-content">
        <div className="project-file-column">
          <b className="project-files-title">Project Files</b>
          <div 
            className={`drop-files-bucket ${isDragging ? 'dragging' : ''}`} 
            id="projectUploadZone"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('projectFileInput')?.click()}
            style={{ cursor: 'pointer' }}
          >
            <svg 
              className="vector-icon1" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              width="38" 
              height="38"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <div className="drop-files-here-to-upload-to-t-parent">
              <b className="drop-files-title">Drop files here to upload to this project</b>
              <div className="files-will-be">Files will be organized in the Project's Knowledgebase folder</div>
            </div>
            <input 
                type="file" 
                id="projectFileInput" 
                multiple 
                style={{ display: "none" }} 
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) handleFileUpload(files);
                }}
            />
          </div>
          
          {/* Improved File List */}
          <div className="files-grid" style={{ marginTop: '20px', gridTemplateColumns: '1fr' }}>
            {isUploading && (
              <div className="file-item uploading" style={{ opacity: 0.7 }}>
                <div className="kb-file-content">
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                  <div className="kb-file-name">Uploading files...</div>
                </div>
              </div>
            )}
            {projectFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="kb-file-content">
                    <div className="vector-icon2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div className="kb-file-name">{file.name}</div>
                    <div className="kb-file-meta">
                        <span className="date-and-time">{formatDate(file.uploadedAt)}</span>
                        <span className="date-and-time">• {formatFileSize(file.size)}</span>
                    </div>
                    <div className="file-actions">
                        <button 
                          className="file-delete-btn" 
                          title="Delete file"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                          }}
                        >
                            ×
                        </button>
                    </div>
                </div>
              </div>
            ))}
            {projectFiles.length === 0 && (
              <div className="no-files-project" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                No files uploaded to this project yet.
              </div>
            )}
          </div>
        </div>
        <div className="project-content-child"></div>
        <div className="chat-column">        
          <b className="project-files-title">Chat with Project</b>
          <div className="project-chat-messages" id="projectChatMessages">
            {messages.map((msg, index) => (
              <Message key={index} message={msg} isLast={index === messages.length - 1} />
            ))}
            {isSending && (
              <div className="message message-assistant">
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>
          <div className="chat-bubble">
            <div className="chat-input-wrapper">
              <input
                type="text"
                ref={chatInputRef}
                id="projectChatInput"
                className="what-do-you"
                placeholder="What do you want to know about this Project?"
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <div className="chat-input-controls">
                <div className="model-selector-wrapper">
                  <ModelSelector />
                </div>
                <div 
                    className="rectangle-parent" 
                    id="projectChatSendBtn"
                    onClick={handleSendMessage}
                    style={{ cursor: isSending ? 'not-allowed' : 'pointer' }}
                >
                  <div className="frame-child"></div>
                  <div className="frame-item"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
