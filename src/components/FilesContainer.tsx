import { useState, useEffect } from 'react';
import { getFiles, uploadFiles, deleteFile } from '../services/tauri/commands';
import { useUIStore } from '../stores/uiStore';
import type { FileInfo, FileData } from '../types';

interface UploadProgressFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export function FilesContainer() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgressFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const showNotification = useUIStore((state) => state.showNotification);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const filesData = await getFiles();
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to load files:', error);
      showNotification('Failed to load files', 'error');
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

  const handleFileUpload = async (filesToUpload: File[]) => {
    // Check file count limit
    if (filesToUpload.length > 25) {
      showNotification('Too many files selected. Maximum 25 files at once.', 'error');
      return;
    }

    // Initialize progress tracking
    const newUploadingFiles: UploadProgressFile[] = filesToUpload.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...newUploadingFiles, ...prev]);

    try {
      // Process files for Tauri command
      const fileDataList: FileData[] = [];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const base64Data = await fileToBase64(file);
        
        fileDataList.push({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: base64Data,
        });

        // Update progress for this file
        setUploadingFiles((prev: UploadProgressFile[]) => prev.map(f => 
          f.name === file.name ? { ...f, progress: 50, status: 'processing' } : f
        ));
      }

      const result = await uploadFiles(fileDataList);

      if (result.success) {
        // Mark all as ready
        setUploadingFiles((prev: UploadProgressFile[]) => prev.map(f => {
          if (fileDataList.some(fd => fd.name === f.name)) {
            return { ...f, progress: 100, status: 'ready' };
          }
          return f;
        }));

        // Wait a bit before clearing progress cards and refreshing list
        setTimeout(async () => {
          setUploadingFiles((prev: UploadProgressFile[]) => prev.filter(f => !fileDataList.some(fd => fd.name === f.name)));
          await loadFiles();
        }, 1500);
      } else {
        console.error('Failed to upload files:', result.error);
        showNotification(result.error || 'Upload failed', 'error');
        setUploadingFiles((prev: UploadProgressFile[]) => prev.map(f => {
          if (fileDataList.some(fd => fd.name === f.name)) {
            return { ...f, status: 'error' };
          }
          return f;
        }));
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      showNotification('Upload failed: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const success = await deleteFile(fileId);
      if (success) {
        await loadFiles();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      showNotification('Failed to delete file', 'error');
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing...';
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return status;
    }
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
          onClick={() => document.getElementById('multipleFileInput')?.click()}
          style={{ cursor: 'pointer' }}
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
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('multipleFileInput')?.click();
              }}
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
            <span className="files-count" id="filesCount">{files.length + uploadingFiles.length} files</span>
          </div>
        </div>
        
        <div className="files-grid" id="filesGrid">
          {/* Progress Cards */}
          {uploadingFiles.map((file) => (
            <div key={file.id} className="file-progress-card">
              <div className="file-progress-content">
                <div className="file-progress-header">
                  <div className="file-progress-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="file-progress-info">
                    <div className="file-progress-name">{file.name}</div>
                    <div className="file-progress-meta">{formatFileSize(file.size)}</div>
                  </div>
                  <div className={`file-progress-status ${file.status}`}>
                    {getStatusText(file.status)}
                  </div>
                </div>
                <div className="file-progress-bar-container">
                  <div className="file-progress-bar">
                    <div className="file-progress-fill" style={{ width: `${file.progress}%` }}></div>
                  </div>
                  <div className="file-progress-percentage">{Math.round(file.progress)}%</div>
                </div>
              </div>
            </div>
          ))}

          {/* Regular Files */}
          {isLoading && uploadingFiles.length === 0 ? (
            <div className="loading-files" id="loadingFiles">
              <div className="spinner"></div>
              <p>Loading files...</p>
            </div>
          ) : (files.length === 0 && uploadingFiles.length === 0) ? (
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
                        {file.status === 'ready' ? (
                             <span style={{ color: '#4ade80' }}>Indexed</span>
                        ) : file.status === 'processing' ? (
                             <span style={{ color: '#fbbf24' }}>Processing</span>
                        ) : (
                            <span style={{ color: '#f87171' }}>Error</span>
                        )}
                    </div>
                    <div className="file-actions">
                        <button 
                          className="file-delete-btn" 
                          title="Delete file"
                          onClick={() => handleDeleteFile(file.id)}
                        >
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
