import { useState, useEffect } from "react";
import { useAppStore } from "../../stores/appStore";
import { Dropdown } from "./Dropdown";
import { ChevronDown, Cpu } from "lucide-react";

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentModelPath,
    setCurrentModelPath,
    availableModels,
    memoryUsage,
    refreshMemoryUsage,
    isModelLoading,
  } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      refreshMemoryUsage();
    }
  }, [isOpen, refreshMemoryUsage]);

  const currentModelInfo =
    availableModels.find((m) => m.modelPath === currentModelPath) ||
    availableModels[0];

  const handleModelSelect = (modelPath: string) => {
    setCurrentModelPath(modelPath);
    setIsOpen(false);
  };

  const formatRAM = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const renderModelList = () => {
    return (
      <>
        {memoryUsage && (
          <div className="px-3 py-2 mb-2 border-b border-border flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <Cpu size={12} />
              <span>RAM</span>
            </div>
            <span
              className={
                memoryUsage.percentage > 90 ? "text-error" : "text-accent"
              }
            >
              {formatRAM(memoryUsage.used)} / {formatRAM(memoryUsage.total)}
            </span>
          </div>
        )}
        {availableModels.map((model) => (
          <button
            key={model.modelPath}
            className={`flex flex-col items-start p-3 bg-transparent border-none rounded-lg text-text-primary font-sans cursor-pointer transition-all text-left w-full mb-1 last:mb-0 hover:bg-hover-bg ${currentModelPath === model.modelPath ? "bg-accent/10 text-accent" : ""}`}
            data-model={model.modelPath}
            onClick={() => handleModelSelect(model.modelPath)}
          >
            <div className="flex justify-between w-full items-center mb-0.5">
              <span className="text-xs font-semibold leading-tight">
                {model.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-bg-secondary rounded-full text-text-muted whitespace-nowrap">
                {model.size}
              </span>
            </div>
          </button>
        ))}
      </>
    );
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      align="right"
      menuClassName="p-2 min-w-64 max-h-[80vh] overflow-y-auto shadow-2xl z-100"
      trigger={
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border rounded-full text-text-secondary text-[13px] font-sans cursor-pointer transition-all hover:border-accent ${isModelLoading ? "opacity-70 cursor-wait" : ""}`}
          id="modelSelectorBtn"
          disabled={isModelLoading}
        >
          {isModelLoading ? (
            <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin mr-1" />
          ) : null}
          <span className="font-thin text-xs">
            {isModelLoading ? "Loading..." : (currentModelInfo?.name || "Select Model")}
          </span>
          <ChevronDown size={12} className="text-current" />
        </button>
      }
    >
      {renderModelList()}
    </Dropdown>
  );
}
