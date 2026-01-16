import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { MODELS } from '../../types';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentModel, setCurrentModel } = useAppStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModelInfo = MODELS.find((m) => m.id === currentModel) || MODELS[0];

  const handleModelSelect = (modelId: string) => {
    setCurrentModel(modelId);
    setIsOpen(false);
  };

  return (
    <div className="model-selector-wrapper" ref={dropdownRef}>
      <button 
        className="model-selector-btn" 
        id="modelSelectorBtn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="model-name">{currentModelInfo.name}</span>
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>

      {/* Model Dropdown */}
      <div className={`model-dropdown-menu ${isOpen ? 'show' : ''}`} id="modelDropdown">
        {MODELS.map((model) => (
          <button
            key={model.id}
            className={`model-option ${currentModel === model.id ? 'active' : ''}`}
            data-model={model.id}
            onClick={() => handleModelSelect(model.id)}
          >
            <span className="model-title">{model.name}</span>
            <span className="model-desc">{model.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
