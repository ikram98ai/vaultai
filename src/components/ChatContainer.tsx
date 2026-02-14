import { useRef, useEffect, useState } from "react";
import { useChatStore } from "../stores/chatStore";
import { Message } from "./common/Message";
import { ChatInput } from "./common/ChatInput";
import { Dropdown } from "./common/Dropdown";
import { MoreVertical, Pin, Pencil, Trash2 } from "lucide-react";
import logoicon from "../assets/vaultai-logo.svg"


export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isSending, currentChatId, chatHistory, deleteChat, renameChat, togglePinChat } = useChatStore();
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Get current chat info
  const currentChat = chatHistory.find(c => c.id === currentChatId);
  const chatTitle = currentChat?.title || "New Chat";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRename = () => {
    const newTitle = prompt("Rename chat:", chatTitle);
    if (newTitle && currentChatId) {
      renameChat(currentChatId, newTitle);
    }
    setShowChatMenu(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this chat?") && currentChatId) {
      deleteChat(currentChatId);
    }
    setShowChatMenu(false);
  };

  const handlePin = () => {
    if (currentChatId) {
      togglePinChat(currentChatId);
    }
    setShowChatMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-primary h-full relative" id="chatContainer">
      {/* Chat Header */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-border bg-bg-primary sticky top-0 z-10 shrink-0 h-15">
        <h3 className="m-0 text-base font-semibold text-brand truncate">{chatTitle}</h3>
        <Dropdown
          isOpen={showChatMenu}
          onOpenChange={setShowChatMenu}
          menuClassName="min-w-40 z-100"
          trigger={
            <button 
              className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-md flex items-center hover:bg-hover-bg hover:text-brand transition-colors" 
              title="Chat options"
            >
              <MoreVertical size={20} />
            </button>
          }
        >
          <button 
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none text-text-primary text-left cursor-pointer text-sm hover:bg-hover-bg first:rounded-t-lg transition-colors" 
            onClick={handlePin}
          >
            <Pin size={16} />
            {currentChat?.pinned ? "Unpin Chat" : "Pin Chat"}
          </button>
          <button 
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none text-text-primary text-left cursor-pointer text-sm hover:bg-hover-bg transition-colors" 
            onClick={handleRename}
          >
            <Pencil size={16} />
            Rename Chat
          </button>
          <button 
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-transparent border-none text-[#ff6b6b] text-left cursor-pointer text-sm hover:bg-hover-bg last:rounded-b-lg transition-colors" 
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Delete Chat
          </button>
        </Dropdown>
      </div>

      <div className="flex-1 overflow-y-auto w-full flex flex-col relative scroller" id="chatMessages">
        <div className="w-full max-w-250 mx-auto px-6 py-6 flex flex-col gap-6">
          {messages.map((msg, index) => (
            <Message
              key={`${msg.timestamp}-${index}`}
              message={msg}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Typing indicator when sending */}
          {isSending && (
            <div className="flex justify-start relative w-full">
               <div className="w-8 h-8 rounded-full mr-3 mt-1 flex items-center justify-center shrink-0">
                <img src={logoicon} alt="VaultAI Logo" className="h-4 w-4 fill-bg-primary" />
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-4 rounded-bl-sm">
                <div className="flex items-center gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput />
    </div>
  );
}
