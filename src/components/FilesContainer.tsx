import { useState, useEffect } from 'react';
import { useFileStore } from '../stores/fileStore';
import { useUIStore } from '../stores/uiStore';
import type { FileData } from '../types';
import { FileUp, Plus, RefreshCw, File, X } from 'lucide-react';

export function FilesContainer() {
  const { 
    files, 
    uploadingFiles, 
    isLoadingFiles: isLoading, 
    loadFiles, 
    uploadFiles, 
    deleteFile,
    setUploadingFiles,
    updateUploadingFile
  } = useFileStore();
  const [isDragging, setIsDragging] = useState(false);
  const showNotification = useUIStore((state) => state.showNotification);

  useEffect(() => {
    loadFiles();
  }, []);

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
    const newUploadingFiles = filesToUpload.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles([...newUploadingFiles, ...uploadingFiles]);

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
        updateUploadingFile(file.name, { progress: 50, status: 'processing' });
      }

      const result = await uploadFiles(fileDataList);

      if (result.success) {
        // Mark all as ready
        for (const file of fileDataList) {
             updateUploadingFile(file.name, { progress: 100, status: 'ready' });
        }

        // Wait a bit before clearing progress cards and refreshing list
        setTimeout(async () => {
    
           const { setUploadingFiles, uploadingFiles } = useFileStore.getState();
           setUploadingFiles(uploadingFiles.filter(f => !fileDataList.some(fd => fd.name === f.name)));
        }, 1500);
      } else {
        console.error('Failed to upload files:', result.error);
        showNotification(result.error || 'Upload failed', 'error');
         for (const file of fileDataList) {
             updateUploadingFile(file.name, { status: 'error' });
        }
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      showNotification('Upload failed: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const success = await deleteFile(fileId);
      if (!success) {
         showNotification('Failed to delete file', 'error');
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
    <div className="p-6 flex-1 flex flex-col h-full overflow-y-auto bg-bg-primary" id="filesContainer">
      <div className="mb-8 text-center max-w-150 mx-auto">
        <h2 className="text-[32px] font-semibold mb-2 text-brand">My Knowledgebase</h2>
        <p className="text-text-secondary text-base leading-6">Upload and manage your documents for enhanced AI conversations</p>
      </div>

      {/* Upload Area */}
      <div className="mb-8 max-w-200 mx-auto w-full">
        <div 
          className={`border-2 border-dashed border-border rounded-xl bg-bg-secondary/30 p-12 text-center transition-all cursor-pointer hover:border-accent ${isDragging ? 'border-accent bg-white/5 scale-[1.02]' : ''}`}
          id="uploadArea"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('multipleFileInput')?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <FileUp size={48} className="text-text-muted opacity-60" />
            <h3 className="text-2xl font-semibold text-text-primary m-0">Drop files here or click to upload</h3>
            <p className="text-text-secondary text-sm m-0 max-w-100 leading-5">Supports PDF, Word, Excel, PowerPoint, text files, images and more</p>
            <button 
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-white text-black border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-hover hover:-translate-y-px" 
              id="selectFilesBtn"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('multipleFileInput')?.click();
              }}
            >
              <Plus size={16} />
              Select Files
            </button>
          </div>
        </div>
        <input 
          type="file" 
          id="multipleFileInput" 
          multiple 
          accept="*" 
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Files List */}
      <div className="max-w-300 mx-auto w-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 className="text-xl font-semibold text-text-primary m-0">Uploaded Files</h3>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 bg-bg-secondary border border-border rounded-md px-3 py-2 text-text-primary text-sm cursor-pointer hover:bg-hover-bg hover:border-accent transition-all" id="refreshFilesBtn" onClick={loadFiles}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <span className="text-text-secondary text-sm" id="filesCount">{files.length + uploadingFiles.length} files</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8" id="filesGrid">
          {/* Progress Cards */}
          {uploadingFiles.map((file) => (
            <div key={file.id} className="bg-bg-secondary border border-border rounded-lg p-4 relative overflow-hidden">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-bg-tertiary rounded text-accent-primary shrink-0">
                    <File size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate mb-1">{file.name}</div>
                    <div className="text-xs text-text-muted">{formatFileSize(file.size)}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                    file.status === 'error' ? 'bg-red-900/30 text-red-400' :
                    file.status === 'ready' ? 'bg-green-900/30 text-green-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                    {getStatusText(file.status)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent-primary transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                  </div>
                  <div className="text-xs font-medium text-text-secondary min-w-7.5 text-right">{Math.round(file.progress)}%</div>
                </div>
              </div>
            </div>
          ))}

          {/* Regular Files */}
          {isLoading && uploadingFiles.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted rounded-lg" id="loadingFiles">
              <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading files...</p>
            </div>
          ) : (files.length === 0 && uploadingFiles.length === 0) ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted  rounded-xl text-center px-4">
                <File size={48} className="mb-4 opacity-50" />
                <h4 className="text-lg font-medium text-text-primary mb-2">No files uploaded yet</h4>
                <p className="text-sm max-w-md">Upload your first document to get started with enhanced AI conversations</p>
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="bg-bg-secondary/30 border border-border rounded-lg p-4 relative group hover:border-accent transition-all duration-200" data-filename={file.name}>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-bg-tertiary rounded text-accent-primary shrink-0">
                        <File size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                         <div className="text-sm font-medium text-text-primary truncate mb-1" title={file.name}>{file.name}</div>
                        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                            <span>{formatDate(file.uploadedAt)}</span>
                            <span>• {formatFileSize(file.size)}</span>
                        </div>
                        <div className="text-xs">
                            {file.status === 'ready' ? (
                                 <span className="text-green-400">Indexed</span>
                            ) : file.status === 'processing' ? (
                                 <span className="text-amber-400">Processing</span>
                            ) : (
                                <span className="text-red-400">Error</span>
                            )}
                        </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="w-6 h-6 flex items-center justify-center bg-transparent border-none text-text-muted hover:bg-hover-bg hover:text-red-400 rounded cursor-pointer transition-colors" 
                          title="Delete file"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                            <X size={14} />
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
