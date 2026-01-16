import { useState, useEffect } from 'react';

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  status: 'processing' | 'ready' | 'error';
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

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📃';
    return '📁';
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
            <div className="empty-files">
              <p>No files uploaded yet. Upload your first document to get started!</p>
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-icon">{getFileIcon(file.type)}</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span>{formatFileSize(file.size)}</span>
                    <span className={`file-status ${file.status}`}>{file.status}</span>
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
