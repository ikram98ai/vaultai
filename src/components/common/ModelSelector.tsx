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
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <button 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border rounded-full text-text-secondary text-[13px] font-sans cursor-pointer transition-all hover:border-accent" 
        id="modelSelectorBtn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-thin text-xs">{currentModelInfo.name}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" className="fill-current">
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>

      {/* Model Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-bg-primary border border-border rounded-xl p-2 min-w-60 shadow-2xl z-100" id="modelDropdown">
          {MODELS.map((model) => (
            <button
              key={model.id}
              className={`flex flex-col items-start p-3 bg-transparent border-none rounded-lg text-text-primary font-sans cursor-pointer transition-all text-left w-full mb-1 last:mb-0 hover:bg-hover-bg ${currentModel === model.id ? 'bg-accent/10 text-accent' : ''}`}
              data-model={model.id}
              onClick={() => handleModelSelect(model.id)}
            >
              <span className="text-sm font-semibold leading-tight mb-0.5">{model.name}</span>
              <span className="text-xs text-text-muted leading-tight">{model.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
