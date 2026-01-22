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
  
  // Modal states
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create form state
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptDesc, setNewPromptDesc] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<PromptCategory>('productivity');
  
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
    <div className="prompts-container" id="promptsContainer">
      <div className="prompts-header">
        <h1>Prompt Library</h1>
        <p className="prompts-subtitle">Ready-to-use prompts to enhance your AI conversations</p>
      </div>

      <div className="prompts-search">
        <input
          type="text"
          className="prompts-search-input"
          placeholder="Search prompts..."
          id="promptsSearchInput"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="prompts-categories">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
            data-category={category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="prompts-grid" id="promptsGrid">
        {/* Add Your Prompt Card */}
        <div className="add-prompt-card" onClick={() => setIsCreateModalOpen(true)}>
            <div className="add-prompt-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            <div className="add-prompt-content">
                <h3>Add Your Prompt</h3>
                <p>Create and save your own custom prompts for repeated use in your private AI assistant.</p>
            </div>
            <button className="add-prompt-btn">Create Prompt</button>
        </div>

        {filteredPrompts.length === 0 && searchQuery ? (
          <div className="empty-prompts" style={{ gridColumn: '1 / -1' }}>
            <p>No prompts found matching your search.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="prompt-card" data-prompt-id={prompt.id} onClick={() => setSelectedPrompt(prompt)}>
              <div className="prompt-card-header">
                <h3 className="prompt-card-title">{prompt.title}</h3>
                <div className="prompt-card-actions">
                    <button className="prompt-card-action" onClick={(e) => { e.stopPropagation(); handleUsePrompt(prompt); }} title="Use Prompt">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                    </button>
                    <button className="prompt-card-action" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt.content); }} title="Copy">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                    </button>
                    <button className="prompt-card-action" onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
              </div>
              <p className="prompt-card-description">{prompt.description}</p>
              <div className="prompt-card-footer">
                <span className="prompt-category-badge">{prompt.category}</span>
                <span>@vaultai</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prompt Details Modal */}
      {selectedPrompt && (
        <div className="prompt-modal show" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrompt(null); }}>
            <div className="prompt-modal-content">
                <button className="prompt-modal-close" onClick={() => setSelectedPrompt(null)}>×</button>
                <div className="prompt-modal-header">
                    <h2 className="prompt-modal-title">{selectedPrompt.title}</h2>
                </div>
                <div className="prompt-modal-body">
                    <div className="prompt-modal-text">{selectedPrompt.content}</div>
                </div>
                <div className="prompt-modal-footer">
                    <span className="prompt-modal-contributor">@vaultai</span>
                    <div className="prompt-modal-buttons">
                        <button className="prompt-modal-chat-btn" onClick={() => { handleUsePrompt(selectedPrompt); setSelectedPrompt(null); }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                            Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Create Prompt Modal */}
      {isCreateModalOpen && (
        <div className="prompt-modal show" onClick={(e) => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}>
            <div className="prompt-modal-content">
                <button className="prompt-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                <div className="prompt-modal-header">
                    <h2 className="prompt-modal-title">Create New Prompt</h2>
                </div>
                <div className="prompt-modal-body">
                    <div className="form-group">
                        <label>Title</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newPromptTitle} 
                            onChange={(e) => setNewPromptTitle(e.target.value)}
                            placeholder="e.g., Code Reviewer"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={newPromptDesc} 
                            onChange={(e) => setNewPromptDesc(e.target.value)}
                            placeholder="Brief description of what this prompt does"
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            className="form-control" 
                            value={newPromptCategory} 
                            onChange={(e) => setNewPromptCategory(e.target.value as PromptCategory)}
                        >
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea 
                            className="form-control" 
                            rows={10} 
                            value={newPromptContent}
                            onChange={(e) => setNewPromptContent(e.target.value)}
                            placeholder="Enter your prompt text here..."
                            style={{ width: '100%', resize: 'vertical' }}
                        ></textarea>
                    </div>
                </div>
                <div className="prompt-modal-footer">
                    <div className="prompt-modal-buttons">
                        <button className="prompt-modal-cancel-btn" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                        <button className="prompt-modal-save-btn" onClick={handleCreatePrompt}>Save Prompt</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border);
            border-radius: 6px;
            background: var(--bg-secondary);
            color: var(--text);
            font-size: 14px;
        }
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
        }
        .prompt-modal-cancel-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-right: 10px;
        }
        .prompt-modal-save-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
}