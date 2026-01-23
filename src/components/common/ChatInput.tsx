import { useRef, useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAppStore } from "../../stores/appStore";
import { useUIStore } from "../../stores/uiStore";
import { ModelSelector } from "./ModelSelector";
import { SourceToolModal } from "../modals/SourceToolModal";

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
  const { sendMessage, isSending, pendingPrompt, setPendingPrompt } = useChatStore();
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

    // Send message
    await sendMessage(message, currentModel, {
      ragEnabled,
      webSearchEnabled,
      agentModeEnabled,
      projectSlugs: sourceProjectsEnabled ? sourceProjectSlugs : [],
      userProfileEnabled: sourceProfileEnabled,
    });
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
            <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current">
              <path d="M7.5,18A5.5,5.5 0 0,1 2,12.5A5.5,5.5 0 0,1 7.5,7H18A4,4 0 0,1 22,11A4,4 0 0,1 18,15H9.5A2.5,2.5 0 0,1 7,12.5A2.5,2.5 0 0,1 9.5,10H17V11.5H9.5A1,1 0 0,0 8.5,12.5A1,1 0 0,0 9.5,13.5H18A2.5,2.5 0 0,0 20.5,11A2.5,2.5 0 0,0 18,8.5H7.5A4,4 0 0,0 3.5,12.5A4,4 0 0,0 7.5,16.5H17V18H7.5Z" />
            </svg>
          </button>

          <button
            className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-md transition-all flex items-center justify-center opacity-60 hover:opacity-100 hover:text-text-secondary"
            id="sourceToolBtnAlt"
            title="Source Tool Modal"
            onClick={openSourceToolModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="fill-current">
              <path d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z" />
            </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z" />
              </svg>
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
