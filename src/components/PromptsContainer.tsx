import { useState } from 'react';
import type { Prompt, PromptCategory } from '../types';

// Sample prompts data
const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Email Writer',
    description: 'Write professional emails for any occasion',
    content: 'Write a professional email about [topic]. The tone should be [formal/casual] and the purpose is [purpose].',
    category: 'writing',
    icon: '✉️',
  },
  {
    id: '2',
    title: 'Code Reviewer',
    description: 'Review code and suggest improvements',
    content: 'Review the following code and provide feedback on code quality, potential bugs, and suggestions for improvement:\n\n```\n[paste your code here]\n```',
    category: 'coding',
    icon: '🔍',
  },
  {
    id: '3',
    title: 'Meeting Summary',
    description: 'Summarize meeting notes into action items',
    content: 'Summarize the following meeting notes and extract key action items, decisions made, and follow-up tasks:\n\n[paste meeting notes]',
    category: 'productivity',
    icon: '📋',
  },
  {
    id: '4',
    title: 'Creative Story',
    description: 'Generate creative story ideas',
    content: 'Create a creative story outline with the following elements:\n- Genre: [genre]\n- Setting: [setting]\n- Main character: [character description]\n- Theme: [theme]',
    category: 'creative',
    icon: '📖',
  },
  {
    id: '5',
    title: 'Data Analysis',
    description: 'Analyze data and provide insights',
    content: 'Analyze the following data and provide key insights, trends, and recommendations:\n\n[paste data or describe the dataset]',
    category: 'analysis',
    icon: '📊',
  },
  {
    id: '6',
    title: 'Learn Concept',
    description: 'Explain complex concepts simply',
    content: 'Explain [concept] in simple terms that a beginner could understand. Include:\n- A brief definition\n- Real-world examples\n- Common misconceptions\n- How it relates to [related topic]',
    category: 'learning',
    icon: '🎓',
  },
];

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
  const [prompts] = useState<Prompt[]>(SAMPLE_PROMPTS);

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory = activeCategory === 'all' || prompt.category === activeCategory;
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUsePrompt = (prompt: Prompt) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt.content);
    // TODO: Navigate to chat with prompt ref
  };

  const handleCreatePrompt = () => {
    // TODO: Implement create prompt modal
    console.log('Create prompt clicked');
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
        <div className="add-prompt-card">
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
            <button className="add-prompt-btn" onClick={handleCreatePrompt}>Create Prompt</button>
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
                    <button className="prompt-card-action" onClick={(e) => { e.stopPropagation(); console.log('Delete', prompt.id); }} title="Delete">
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

      {/* Prompt Modal */}
      {selectedPrompt && (
        <div className="prompt-modal show" id="promptModal" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrompt(null); }}>
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
                        <button className="prompt-modal-embed-btn" onClick={() => { /* TODO: Embed logic */ }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                            </svg>
                            Embed
                        </button>
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
    </div>
  );
}
