import { useRef, useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAppStore } from "../../stores/appStore";
import { useUIStore } from "../../stores/uiStore";
import { ModelSelector } from "./ModelSelector";
import { SourceToolModal } from "../modals/SourceToolModal";

type ChatInputProps=  {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({textareaRef}:ChatInputProps) {

  if (!textareaRef) 
      textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentModel,
    ragEnabled,
    webSearchEnabled,
    agentMode,
    setAgentMode,
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
      ragEnabled: ragEnabled,
      webSearchEnabled,
      agentMode,
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
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        {/* Prompt Reference Display */}
        <div
          id="chatPromptRef"
          className="chat-prompt-ref"
          style={{ display: "none" }}
        >
          <span className="prompt-reference-tag">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="prompt-ref-title"></span>
          </span>
        </div>

        <textarea
          ref={textareaRef}
          id="chatInput"
          className="chat-input"
          placeholder="Message VaultAI16..."
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isSending}
        />

        {/* Chat Input Controls */}
        <div className="chat-input-controls">
          <button className="input-control-btn" id="attachBtnChat">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7.5,18A5.5,5.5 0 0,1 2,12.5A5.5,5.5 0 0,1 7.5,7H18A4,4 0 0,1 22,11A4,4 0 0,1 18,15H9.5A2.5,2.5 0 0,1 7,12.5A2.5,2.5 0 0,1 9.5,10H17V11.5H9.5A1,1 0 0,0 8.5,12.5A1,1 0 0,0 9.5,13.5H18A2.5,2.5 0 0,0 20.5,11A2.5,2.5 0 0,0 18,8.5H7.5A4,4 0 0,0 3.5,12.5A4,4 0 0,0 7.5,16.5H17V18H7.5Z" />
            </svg>
          </button>

          <button
            className="input-control-btn"
            id="sourceToolBtnAlt"
            title="Source Tool Modal"
            onClick={openSourceToolModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z" />
            </svg>
          </button>

          {/* Agent Mode Toggle */}
          <div
            className="agent-mode-wrapper"
            title="Enable LangChain Agent"
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "8px",
              borderRight: "1px solid var(--border)",
              paddingRight: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                marginRight: "6px",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Agent
            </span>
            <label className="switch">
              <input
                type="checkbox"
                id="agentModeToggleChat"
                checked={agentMode}
                onChange={(e) => setAgentMode(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          <ModelSelector />

          <button
            id="sendBtnChat"
            className="send-btn"
            data-testid="send-button-chat"
            onClick={handleSend}
            disabled={isSending}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z" />
            </svg>
          </button>
        </div>
      </div>
        {/* Source Tool Modal */}
      {sourceToolModalOpen && (
        <SourceToolModal />
      )}
    </div>
  );
}
