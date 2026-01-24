import { useRef, useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAppStore } from "../../stores/appStore";
import { useUIStore } from "../../stores/uiStore";
import { ModelSelector } from "./ModelSelector";
import { SourceToolModal } from "../modals/SourceToolModal";
import { FileText, Paperclip, SlidersHorizontal, ArrowUp } from "lucide-react";

type ChatInputProps = {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  variant?: 'default' | 'welcome';
};

export function ChatInput({ textareaRef, variant = 'default' }: ChatInputProps) {
  if (!textareaRef) textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentModel,
    ragEnabled,
    webSearchEnabled,
    agentModeEnabled,
    setAgentMode,
    sourceProjectsEnabled,
    sourceProjectSlugs,
    sourceProfileEnabled,
  } = useAppStore();
  const { sendMessage, setIsSending, isSending, pendingPrompt, setPendingPrompt } = useChatStore();
  const { setShowWelcome, openSourceToolModal, sourceToolModalOpen } = useUIStore();

  useEffect(() => {
    if (pendingPrompt && textareaRef.current) {
      textareaRef.current.value = pendingPrompt;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
      textareaRef.current.focus();
      setPendingPrompt(null);
      setShowWelcome(false);
    }
  }, [pendingPrompt, setPendingPrompt, setShowWelcome]);

  // Handle message send
  const handleSend = async () => {
    if (isSending) return;

    const message = textareaRef.current?.value.trim();
    if (!message) return;

    // Clear input
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
    setShowWelcome(false);
    setIsSending(true);
    // delay to allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Send message
    await sendMessage(message, currentModel, {
      ragEnabled,
      webSearchEnabled,
      agentModeEnabled,
      projectSlugs: sourceProjectsEnabled ? sourceProjectSlugs : [],
      userProfileEnabled: sourceProfileEnabled,
    });
    setIsSending(false);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  return (
    <div className={`${variant === 'welcome' ? 'w-full' : 'bg-bg-primary pt-4 px-6 pb-6 sticky bottom-0 w-full'}`}>
      <div className={`${variant === 'welcome' ? 'w-full' : 'max-w-250 mx-auto'} relative bg-bg-secondary/30 border border-border rounded-[20px] ${variant === 'welcome' ? 'py-8.75 px-6.25' : 'p-3'} transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent`}>
        
        {/* Prompt Reference Display (Hidden by default based on original code) */}
        <div id="chatPromptRef" className="hidden mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-bg-tertiary border border-border rounded text-xs text-text-secondary">
            <FileText size={12} />
            <span className="prompt-ref-title"></span>
          </span>
        </div>

        <textarea
          ref={textareaRef}
          id="chatInput"
          className="w-full bg-transparent border-none text-text-primary text-base font-sans leading-6 resize-none outline-none min-h-6 max-h-50 mb-2 placeholder:text-text-muted block"
          placeholder="Message VaultAI16..."
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isSending}
        />

        {/* Chat Input Controls */}
        <div className="flex items-center gap-2 pl-2">
          <button className="bg-transparent border-none text-text-muted  cursor-pointer p-1.5 rounded-md transition-all flex items-center justify-center opacity-60 hover:opacity-100 hover:text-text-secondary" id="attachBtnChat">
            <Paperclip size={20} />
          </button>

          <button
            className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-md transition-all flex items-center justify-center opacity-60 hover:opacity-100 hover:text-text-secondary"
            id="sourceToolBtnAlt"
            title="Source Tool Modal"
            onClick={openSourceToolModal}
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Agent Mode Toggle */}
          <div className="flex items-center mr-2 border-r border-border pr-2" title="Enable Agent">
            <span className="text-[11px] mr-1.5 font-medium text-text-secondary">Agent</span>
            <label className="relative inline-block w-8.5 h-4.5 cursor-pointer">
              <input
                type="checkbox"
                id="agentModeToggleChat"
                className="peer sr-only"
                checked={agentModeEnabled}
                onChange={(e) => setAgentMode(e.target.checked)}
              />
              <span className="absolute inset-0 bg-[#2A2A2A] border border-border rounded-full transition-all duration-300 peer-checked:bg-brand peer-checked:border-brand"></span>
              <span className="absolute left-0.75 top-0.75 h-3 w-3 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></span>
            </label>
          </div>

          <div className="flex gap-2 justify-end items-end ml-auto">
            <ModelSelector />

            <button
              id="sendBtnChat"
              className="bg-text-primary border-none text-bg-primary cursor-pointer w-8 h-8 p-0 rounded-full transition-all flex items-center justify-center shrink-0 hover:bg-accent-hover hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-text-primary disabled:hover:scale-100"
              data-testid="send-button-chat"
              onClick={handleSend}
              disabled={isSending}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Source Tool Modal */}
      {sourceToolModalOpen && (
        <SourceToolModal />
      )}
    </div>
  );
}
