import { useState, useEffect } from 'react';

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  status: 'processing' | 'ready' | 'error';
  indexed?: boolean;
}

export function FilesContainer() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Load files on mount (will use Tauri command when implemented)
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with Tauri command
      // const files = await commands.getFiles();
      // setFiles(files);
      setFiles([]);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFileUpload(droppedFiles);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(Array.from(selectedFiles));
    }
  };

  const handleFileUpload = async (filesToUpload: File[]) => {
    console.log('Uploading files:', filesToUpload);
    // TODO: Implement file upload with Tauri command
    // For now, just log the files
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
    <div className="files-container" id="filesContainer">
      <div className="files-header">
        <h2>My Knowledgebase</h2>
        <p className="files-subtitle">Upload and manage your documents for enhanced AI conversations</p>
      </div>

      {/* Upload Area */}
      <div className="upload-section">
        <div 
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          id="uploadArea"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <svg viewBox="0 0 24 24" width="48" height="48" className="upload-icon">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                fill="currentColor"
              />
            </svg>
            <h3>Drop files here or click to upload</h3>
            <p>Supports PDF, Word, Excel, PowerPoint, text files, images and more</p>
            <button 
              className="upload-btn" 
              id="selectFilesBtn"
              onClick={() => document.getElementById('multipleFileInput')?.click()}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Select Files
            </button>
          </div>
        </div>
        <input 
          type="file" 
          id="multipleFileInput" 
          multiple 
          accept="*" 
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* Files List */}
      <div className="files-list-section">
        <div className="files-list-header">
          <h3>Uploaded Files</h3>
          <div className="files-actions">
            <button className="refresh-btn" id="refreshFilesBtn" onClick={loadFiles}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
              Refresh
            </button>
            <span className="files-count" id="filesCount">{files.length} files</span>
          </div>
        </div>
        
        <div className="files-grid" id="filesGrid">
          {isLoading ? (
            <div className="loading-files" id="loadingFiles">
              <div className="spinner"></div>
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
                </svg>
                <h4>No files uploaded yet</h4>
                <p>Upload your first document to get started with enhanced AI conversations</p>
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="file-item" data-filename={file.name}>
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
                    <div className="kb-file-status">
                        {file.indexed ? (
                             <span style={{ color: '#4ade80' }}>Indexed</span>
                        ) : (
                             <span style={{ color: '#fbbf24' }}>Processing</span>
                        )}
                    </div>
                    <div className="file-actions">
                        <button className="file-delete-btn" title="Delete file">
                            ×
                        </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
