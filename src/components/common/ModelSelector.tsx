import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { MODELS } from '../../types';
import { Dropdown } from './Dropdown';
import { ChevronDown } from 'lucide-react';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentModel, setCurrentModel } = useAppStore();

  const currentModelInfo = MODELS.find((m) => m.id === currentModel) || MODELS[0];

  const handleModelSelect = (modelId: string) => {
    setCurrentModel(modelId);
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align="right"
      menuClassName="p-2 min-w-60 shadow-2xl z-100"
      trigger={
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border rounded-full text-text-secondary text-[13px] font-sans cursor-pointer transition-all hover:border-accent" 
          id="modelSelectorBtn"
        >
          <span className="font-thin text-xs">{currentModelInfo.name}</span>
          <ChevronDown size={12} className="text-current" />
        </button>
      }
    >
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
    </Dropdown>
  );
}
