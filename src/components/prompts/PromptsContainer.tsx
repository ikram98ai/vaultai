import { useState } from 'react';
import type { Prompt, PromptCategory } from '../../types';

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
    // TODO: Could also inject into chat input
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
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            data-category={category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="prompts-grid" id="promptsGrid">
        {filteredPrompts.length === 0 ? (
          <div className="empty-prompts">
            <p>No prompts found matching your search.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="prompt-card" onClick={() => handleUsePrompt(prompt)}>
              <div className="prompt-card-header">
                <span className="prompt-icon">{prompt.icon}</span>
                <span className="prompt-category">{prompt.category}</span>
              </div>
              <h3 className="prompt-title">{prompt.title}</h3>
              <p className="prompt-description">{prompt.description}</p>
              <button className="use-prompt-btn">Use Prompt</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
