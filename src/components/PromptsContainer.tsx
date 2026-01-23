import { useState, useEffect } from 'react';
import type { Prompt, PromptCategory } from '../types';
import * as commands from '../services/tauri/commands';
import { useUIStore } from '../stores/uiStore';
import { useChatStore } from '../stores/chatStore';

const CATEGORIES: { id: PromptCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'writing', label: 'Writing' },
  { id: 'coding', label: 'Coding' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'creative', label: 'Creative' },
  { id: 'learning', label: 'Learning' },
];

export function PromptsContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('all');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  
  // Modal states
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create form state
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptDesc, setNewPromptDesc] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<PromptCategory>('productivity');

  const handleCopyPrompt = async (promptId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPromptId(promptId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };
  
  const { setActiveTab } = useUIStore();
  const { setPendingPrompt } = useChatStore();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const dbPrompts = await commands.getAllPrompts();
      setPrompts(dbPrompts);
    } catch (error) {
      console.error('Failed to load prompts from DB:', error);
    }
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory = activeCategory === 'all' || prompt.category === activeCategory;
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUsePrompt = (prompt: Prompt) => {
    setPendingPrompt(prompt.content);
    setActiveTab('chat');
  };

  const handleCreatePrompt = async () => {
    if (!newPromptTitle || !newPromptContent) return;

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: newPromptTitle,
      description: newPromptDesc,
      content: newPromptContent,
      category: newPromptCategory,
      icon: '📝', // Default icon
    };

    try {
      await commands.savePrompt(newPrompt);
      setPrompts([newPrompt, ...prompts]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      await commands.deletePrompt(promptId);
      setPrompts(prompts.filter(p => p.id !== promptId));
      if (selectedPrompt?.id === promptId) setSelectedPrompt(null);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const resetForm = () => {
    setNewPromptTitle('');
    setNewPromptDesc('');
    setNewPromptContent('');
    setNewPromptCategory('productivity');
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-bg-primary" id="promptsContainer">
      <div className="flex flex-col items-center justify-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold text-brand m-0">Prompt Library</h1>
        <p className="text-text-secondary text-sm m-0">Ready-to-use prompts to enhance your AI conversations</p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-full md:w-2xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          </div>
          <input
        type="text"
        className="w-full bg-bg-secondary border border-border rounded-lg py-2.5 pl-10 pr-4 text-text-primary text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-text-muted"
        placeholder="Search prompts..."
        id="promptsSearchInput"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`px-2.5 py-1 bg-bg-secondary border border-border rounded-full text-text-secondary text-[15px] cursor-pointer transition-all hover:bg-hover-bg hover:text-text-primary ${activeCategory === category.id ? 'bg-brand border-brand text-black ' : ''}`}
            data-category={category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8" id="promptsGrid">
        {/* Add Your Prompt Card */}
        <div 
            className="border-2 border-dashed border-[#333] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] h-full min-h-60 gap-4 group bg-transparent" 
            onClick={() => setIsCreateModalOpen(true)}
        >
            <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-brand transition-colors">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-[15px] font-semibold text-brand m-0">Add Your Prompt</h3>
                <p className="text-[13px] text-[#888] m-0 leading-relaxed max-w-50">Create and save your own custom prompts for repeated use.</p>
            </div>
            <button className="px-4 py-1.5 bg-transparent border border-[#666] text-[#999] rounded-md text-[12px] font-medium transition-all hover:bg-[#2A2A2A] hover:border-[#999] hover:text-white mt-auto self-end">Create Prompt</button>
        </div>

        {filteredPrompts.length === 0 && searchQuery ? (
          <div className="col-span-full py-12 text-center text-text-muted">
            <p>No prompts found matching your search.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div 
                key={prompt.id} 
                className="bg-[#1c1c1c] border-none rounded-xl p-5 flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] h-full min-h-60 group relative shadow-[0_2px_4px_rgba(0,0,0,0.25)]" 
                data-prompt-id={prompt.id} 
                onClick={() => setSelectedPrompt(prompt)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[18px] font-semibold text-white m-0 flex-1 mr-2 leading-[1.3]">{prompt.title}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        className="p-1 rounded hover:bg-[#2A2A2A] text-[#666] hover:text-[#aaa] transition-colors" 
                        onClick={(e) => { e.stopPropagation(); handleUsePrompt(prompt); }} 
                        title="Use Prompt"
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                    </button>
                    <button 
                        className={`p-1 rounded ${copiedPromptId === prompt.id ? 'bg-green-600 text-white' : 'hover:bg-[#2A2A2A] text-[#666] hover:text-[#aaa]'} transition-colors`} 
                        onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.id, prompt.content); }} 
                        title={copiedPromptId === prompt.id ? "Copied!" : "Copy"}
                    >
                        {copiedPromptId === prompt.id ? (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                            </svg>
                        )}
                    </button>
                    <button 
                        className="p-1 rounded hover:bg-[#2A2A2A] text-[#666] hover:text-red-400 transition-colors" 
                        onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }} 
                        title="Delete"
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
              </div>
              <p className="text-[14px] text-[#cfcfcf] m-0 mb-4 line-clamp-4 leading-normal flex-1">{prompt.description}</p>
              <div className="flex justify-between items-center text-[12px] mt-auto pt-2 border-t border-[#333] text-[#888]">
                <span className="px-1.5 py-0.5 bg-[#2A2A2A] rounded text-[#aaa] capitalize text-[10px]">{prompt.category}</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                    VaultAI
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prompt Details Modal */}
      {selectedPrompt && (
        <div 
            className="fixed inset-0 z-9999 bg-black/80 flex items-center justify-center p-4 animate-fadeIn" 
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrompt(null); }}
        >
            <div className="bg-[#1c1c1c] w-[90%] max-w-160 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh] overflow-hidden animate-scaleIn relative font-sans">
                <button className="absolute top-4 right-4 bg-transparent border-none text-[#888] hover:text-white text-xl cursor-pointer p-1 transition-all" onClick={() => setSelectedPrompt(null)}>×</button>
                
                <div className="p-6 pt-8 pb-0 flex flex-col gap-2">
                    <h2 className="text-[20px] font-semibold text-white m-0 leading-tight">{selectedPrompt.title}</h2>
                    <div>
                        <span className="inline-block text-[12px] bg-brand text-[#1A1A1A] px-3 py-1 rounded-md font-medium capitalize">
                            {selectedPrompt.category}
                        </span>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="text-[14px] leading-[1.6] text-[#e0e0e0] whitespace-pre-wrap font-sans">{selectedPrompt.content}</div>
                </div>

                <div className="p-6 pt-3 flex justify-between items-center text-[13px]">
                    <span className="text-[#28cc28] font-medium">VaultAI Contributor</span>
                    <div className="flex gap-2.5">
                        <button 
                            className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${copiedPromptId === selectedPrompt.id ? 'bg-green-600 text-white border-green-600' : 'bg-[#1e1e1e] text-[#cfcfcf] border border-[#444] hover:bg-bg-tertiary'}`} 
                            onClick={() => {
                                if (selectedPrompt) handleCopyPrompt(selectedPrompt.id, selectedPrompt.content);
                            }}
                        >
                            {copiedPromptId === selectedPrompt.id ? "Copied!" : "Copy Prompt"}
                        </button>
                        <button 
                            className="px-3 py-1.5 bg-brand text-[#1A1A1A] border-none rounded-md text-[13px] font-medium transition-all hover:bg-[#E5A800]" 
                            onClick={() => { handleUsePrompt(selectedPrompt); setSelectedPrompt(null); }}
                        >
                            Use Prompt
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Create Prompt Modal */}
      {isCreateModalOpen && (
        <div 
            className="fixed inset-0 z-9999 bg-black/80 flex items-center justify-center p-4 animate-fadeIn" 
            onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
        >
            <div className="bg-[#1c1c1c] w-[90%] max-w-125 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn relative font-sans">
                <div className="p-6 pt-8 pb-4 border-b border-[#333]">
                    <h2 className="text-[20px] font-semibold text-white m-0">Create New Prompt</h2>
                    <button className="absolute top-4 right-4 bg-transparent border-none text-[#888] hover:text-white text-xl cursor-pointer p-1 transition-all" onClick={() => setIsCreateModalOpen(false)}>×</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-5">
                        <label className="block text-[14px] font-medium text-[#cfcfcf] mb-2 font-sans">Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-bg-secondary border border-[#333] rounded-lg px-3 py-2.5 text-white text-[14px] outline-none transition-all focus:border-brand" 
                            value={newPromptTitle} 
                            onChange={(e) => setNewPromptTitle(e.target.value)}
                            placeholder="e.g., Code Reviewer"
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block text-[14px] font-medium text-[#cfcfcf] mb-2 font-sans">Description</label>
                        <input 
                            type="text" 
                            className="w-full bg-bg-secondary border border-[#333] rounded-lg px-3 py-2.5 text-white text-[14px] outline-none transition-all focus:border-brand" 
                            value={newPromptDesc} 
                            onChange={(e) => setNewPromptDesc(e.target.value)}
                            placeholder="Brief description"
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block text-[14px] font-medium text-[#cfcfcf] mb-2 font-sans">Category</label>
                        <select 
                            className="w-full bg-bg-secondary border border-[#333] rounded-lg px-3 py-2.5 text-white text-[14px] outline-none transition-all focus:border-brand appearance-none cursor-pointer" 
                            value={newPromptCategory} 
                            onChange={(e) => setNewPromptCategory(e.target.value as PromptCategory)}
                        >
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <label className="block text-[14px] font-medium text-[#cfcfcf] mb-2 font-sans">Content</label>
                        <textarea 
                            className="w-full bg-bg-secondary border border-[#333] rounded-lg px-3 py-2.5 text-white text-[14px] outline-none transition-all focus:border-brand min-h-37.5 resize-y font-mono" 
                            rows={10} 
                            value={newPromptContent}
                            onChange={(e) => setNewPromptContent(e.target.value)}
                            placeholder="Enter your prompt text here..."
                        ></textarea>
                    </div>
                </div>
                <div className="p-6 border-t border-[#333] flex justify-end gap-3">
                    <button 
                        className="px-4 py-2 bg-transparent border border-[#444] rounded-lg text-[#cfcfcf] text-[13px] font-medium cursor-pointer transition-all hover:bg-bg-secondary" 
                        onClick={() => setIsCreateModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="px-6 py-2 bg-brand text-[#1A1A1A] border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all hover:bg-[#E5A800] disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={handleCreatePrompt}
                        disabled={!newPromptTitle || !newPromptContent}
                    >
                        Save Prompt
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}