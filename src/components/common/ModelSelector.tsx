import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Dropdown } from './Dropdown';
import { ChevronDown } from 'lucide-react';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentModel, setCurrentModel, supportedModels } = useAppStore();


  const currentModelInfo = supportedModels.find((m) => m.id === currentModel) || supportedModels[0];

  const handleModelSelect = (modelId: string) => {
    setCurrentModel(modelId);
    setIsOpen(false);
  };

  const renderModelList = () => {
    return supportedModels.map((model) => (
      <button
        key={model.id}
        className={`flex flex-col items-start p-3 bg-transparent border-none rounded-lg text-text-primary font-sans cursor-pointer transition-all text-left w-full mb-1 last:mb-0 hover:bg-hover-bg ${currentModel === model.id ? 'bg-accent/10 text-accent' : ''}`}
        data-model={model.id}
        onClick={() => handleModelSelect(model.id)}
      >
        <span className="text-sm font-semibold leading-tight mb-0.5">{model.name}</span>
        <span className="text-xs text-text-muted leading-tight line-clamp-2">{model.description}</span>
      </button>
    ));
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align="right"
      menuClassName="p-2 min-w-64 max-h-[80vh] overflow-y-auto shadow-2xl z-100"
      trigger={
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border rounded-full text-text-secondary text-[13px] font-sans cursor-pointer transition-all hover:border-accent" 
          id="modelSelectorBtn"
        >
          <span className="font-thin text-xs">{currentModelInfo?.name || 'Select Model'}</span>
          <ChevronDown size={12} className="text-current" />
        </button>
      }
    >
      {renderModelList()}
    </Dropdown>
  );
}
