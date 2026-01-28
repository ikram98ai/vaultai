import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { usePromptStore } from '../../stores/promptStore';
import { useFileStore } from '../../stores/fileStore';
import { Chat, Prompt, FileInfo } from '../../types';
import { X, MessageCircle, MessageSquareText, File } from 'lucide-react';

export function SearchModal() {
  const { searchModalOpen, closeSearchModal, setActiveTab, openSearchModal } = useUIStore();
  const { chatHistory, loadChat } = useChatStore();
  const { prompts, loadPrompts } = usePromptStore();
  const { files, loadFiles } = useFileStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    chats: Chat[];
    prompts: Prompt[];
    files: FileInfo[];
  }>({ chats: [], prompts: [], files: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load data when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      if (prompts.length === 0) loadPrompts();
      if (files.length === 0) loadFiles();
      // chatHistory is likely already loaded or loading
      
      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults({ chats: [], prompts: [], files: [] });
    }
  }, [searchModalOpen, loadPrompts, loadFiles, prompts.length, files.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!searchModalOpen) {
          openSearchModal();
        } else {
          closeSearchModal();
        }
      }
      
      // Escape to close
      if (e.key === 'Escape' && searchModalOpen) {
        closeSearchModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, openSearchModal, closeSearchModal]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults({ chats: [], prompts: [], files: [] });
      return;
    }

    const q = query.toLowerCase();

    // Search Chats
    const matchedChats = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(q) || 
      chat.messages.some(m => m.content.toLowerCase().includes(q))
    ).slice(0, 5); // Limit to 5

    // Search Prompts
    const matchedPrompts = prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(q) || 
      prompt.description.toLowerCase().includes(q) ||
      prompt.content.toLowerCase().includes(q)
    ).slice(0, 5);

    // Search Files (by name only for now as content search requires backend)
    const matchedFiles = files.filter(file => 
      file.name.toLowerCase().includes(q)
    ).slice(0, 5);

    setResults({
      chats: matchedChats,
      prompts: matchedPrompts,
      files: matchedFiles
    });

  }, [query, chatHistory, prompts, files]);

  // Handle clicks
  const handleChatClick = (chatId: string) => {
    loadChat(chatId);
    setActiveTab('chat');
    closeSearchModal();
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      useUIStore.getState().setSearchQuery(prompt.title);
    }
    setActiveTab('prompts');
    closeSearchModal();
  };

  const handleFileClick = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      useUIStore.getState().setSearchQuery(file.name);
    }
    setActiveTab('files');
    closeSearchModal();
  };

  if (!searchModalOpen) return null;

  const hasResults = results.chats.length > 0 || results.prompts.length > 0 || results.files.length > 0;

  return (
    <div className="fixed inset-0 z-10000 flex justify-center items-start pt-[10vh] font-sans"
         onClick={(e) => {
           if (e.target === e.currentTarget) closeSearchModal();
         }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div 
        ref={modalRef}
        className="relative bg-[#242628] rounded-xl shadow-2xl w-[90%] max-w-150 max-h-[70vh] flex flex-col overflow-hidden border border-white/10"
      >
        {/* Header / Input */}
        <div className="flex items-center p-5 border-b border-white/10 bg-[#242628]">
          <input
            ref={inputRef}
            type="text"
            id="globalSearchInput"
            className="flex-1 bg-transparent border-none text-lg outline-none text-white placeholder-gray-500"
            placeholder="Search chats, documents, prompts..."
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={closeSearchModal}
            className="bg-transparent border-none text-text-secondary cursor-pointer p-2 ml-3 rounded-md transition-all duration-200 flex items-center justify-center hover:bg-white/5 hover:text-[#f9f8f6]"
            id="closeSearchModal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#242628]" id="searchResultsContainer">
          {!query && (
            <div className="text-left text-text-secondary p-10 py-4 text-sm">
                <p className="my-8">Start typing to search across:</p>
                <ul className="list-none p-0 mt-5">
                    <li className="my-4 flex items-center justify-start gap-2">
                        <MessageCircle className="text-brand shrink-0" size={16} strokeWidth={1.5} />
                        Chat conversations
                    </li>
                    <li className="my-4 flex items-center justify-start gap-2">
                        <File className="text-brand shrink-0" size={16} />
                        Documents in knowledge base
                    </li>
                    <li className="my-4 flex items-center justify-start gap-2">
                        <MessageSquareText className="text-brand shrink-0" size={16} />
                        Saved prompts
                    </li>
                </ul>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center text-[#b0b0b0] p-10">
                <p>No results found for "{query}"</p>
            </div>
          )}

          {/* Chats Section */}
          {results.chats.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase text-gray-500 mb-3">Chats</div>
              {results.chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand"
                  data-type="chat"
                  data-id={chat.id}
                >
                  <div className="font-medium mb-1 text-white flex items-center gap-2">
                    <MessageCircle className="text-brand shrink-0" size={16} strokeWidth={2} />
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files Section */}
          {results.files.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase text-gray-500 mb-3">Documents</div>
              {results.files.map(file => (
                <div 
                  key={file.id}
                  onClick={() => handleFileClick(file.id)}
                  className="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand"
                  data-type="document"
                  data-id={file.id}
                >
                  <div className="font-medium mb-1 text-white flex items-center gap-2">
                    <File className="text-brand shrink-0" size={16} strokeWidth={2} />
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompts Section */}
          {results.prompts.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase text-gray-500 mb-3">Prompts</div>
              {results.prompts.map(prompt => (
                <div 
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt.id)}
                  className="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand"
                  data-type="prompt"
                  data-id={prompt.id}
                >
                  <div className="font-medium mb-1 text-white flex items-center gap-2">
                    <MessageSquareText className="text-brand shrink-0" size={16} strokeWidth={2} />
                    {prompt.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {prompt.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
