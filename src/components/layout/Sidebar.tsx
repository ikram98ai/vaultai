import { useChatStore } from "../../stores/chatStore";
import { useUIStore } from "../../stores/uiStore";
import { useProjectStore } from "../../stores/projectStore";
import type { Tab } from "../../types";
import { Dropdown } from "../common/Dropdown";
import  logoicon from "../../assets/vaultai-logo.svg"
import { 
  Search, 
  SquarePen, 
  Plus, 
  BookOpen, 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  Heart, 
  X, 
  History, 
  MoreVertical, 
  Pin, 
  PinOff, 
  Pencil, 
  Trash2,
  User,
} from "lucide-react";

export function Sidebar() {
  const {
    chatHistory,
    currentChatId,
    createNewChat,
    loadChat,
    togglePinChat,
    renameChat,
    deleteChat,
  } = useChatStore();

  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    openProfileModal,
    setShowWelcome,
    openSearchModal,
    setSearchQuery,
  } = useUIStore();
  const { clearCurrentProject, currentProject } = useProjectStore();

  const handleSearchClick = () => {
    openSearchModal();
  };

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery('');

    if (tab === "chat") {
      clearCurrentProject();

      createNewChat();

      setShowWelcome(true);
    }

    if (tab === "projects") {
      clearCurrentProject();
    }
  };

  const handleChatClick = (chatId: string) => {
    loadChat(chatId);

    if (!currentProject) {
      setActiveTab("chat");
    }

    setShowWelcome(false);
  };

  const handleHomeClick = () => {
    clearCurrentProject();

    createNewChat();

    setActiveTab("chat");
    setSearchQuery('');

    setShowWelcome(true);
  };

  const handleRename = async (chatId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new chat title:", currentTitle);

    if (newTitle && newTitle.trim()) {
      await renameChat(chatId, newTitle.trim());
    }
  };

  const handleDelete = async (chatId: string, title: string) => {
    if (confirm(`Delete chat "${title}"?`)) {
      await deleteChat(chatId);
    }
  };

  const handleTogglePin = async (chatId: string) => {
    await togglePinChat(chatId);
  };

  // Group chats by date (Today, Yesterday, Previous 7 Days, etc.)
  const groupChatsByDate = () => {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    const yesterday = today - 86400000;

    const lastWeek = today - 7 * 86400000;

    const groups: { [key: string]: typeof chatHistory } = {
      Pinned: [],

      Today: [],

      Yesterday: [],

      "Previous 7 Days": [],

      Older: [],
    };

    let chatsToShow = currentProject
      ? chatHistory.filter((c) => c.projectId === currentProject.id)
      : chatHistory;

    chatsToShow.forEach((chat) => {
      if (chat.pinned) {
        groups["Pinned"].push(chat);
      } else if (chat.timestamp >= today) {
        groups["Today"].push(chat);
      } else if (chat.timestamp >= yesterday) {
        groups["Yesterday"].push(chat);
      } else if (chat.timestamp >= lastWeek) {
        groups["Previous 7 Days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return groups;
  };

  const chatGroups = groupChatsByDate();

  return (
    <aside
      className={`fixed top-0 bottom-0 -left-70 lg:left-0 z-1000 w-70 h-screen bg-bg-primary border-r border-border flex flex-col transition-[left] duration-300 ease-out pt-20 lg:pt-0 ${sidebarOpen ? "left-0" : ""}`}
    >
      {/* VaultAI Logo */}

      <button
        className="hidden lg:flex items-center p-6.5 shrink-0 bg-transparent border-none cursor-pointer transition-opacity duration-200 hover:opacity-80 active:opacity-60"
        id="homeLogoBtn"
        title="Home"
        onClick={handleHomeClick}
      >
        <img src={logoicon} alt="VaultAI Logo" className="h-8 w-auto" />
      </button>

      {/* Fixed Top Section */}

      <div className="shrink-0 px-4 pb-4 overflow-visible">
        {/* Search */}

        <div className="mb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-text-muted pointer-events-none" size={16} />

            <input
              type="text"
              placeholder="Search ⌘K"
              className="w-full bg-[#1A1B1E] border border-transparent rounded-lg py-2 px-3 pl-9 text-text-primary text-sm outline-none transition-all duration-200 focus:border-accent focus:bg-bg-tertiary placeholder:text-text-muted cursor-pointer"
              readOnly
              onClick={handleSearchClick}
            />
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex flex-col gap-0.5">
          <button
            className={`flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-hover-bg hover:text-text-primary group relative ${activeTab === "chat" ? "bg-active-bg text-text-primary" : ""}`}
            data-tab="chat"
            onClick={() => handleNavClick("chat")}
          >
            <SquarePen size={20} className="shrink-0 text-current" />

            <span className="flex-1">Chat</span>

            <Plus size={16} className="ml-auto text-gray-500 transition-colors duration-200 group-hover:text-gray-400 shrink-0" />
          </button>

          <button
            className={`flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-hover-bg hover:text-text-primary group relative ${activeTab === "files" ? "bg-active-bg text-text-primary" : ""}`}
            data-tab="files"
            onClick={() => handleNavClick("files")}
          >
            <BookOpen size={20} className="shrink-0 text-current" />
            <span className="flex-1">Knowledgebase</span>
          </button>

          <button
            className={`flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-hover-bg hover:text-text-primary group relative ${activeTab === "projects" ? "bg-active-bg text-text-primary" : ""}`}
            data-tab="projects"
            onClick={() => handleNavClick("projects")}
          >
            <Folder size={20} className="shrink-0 text-current" />
            <span className="flex-1">Projects</span>
          </button>

          <button
            className={`flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-hover-bg hover:text-text-primary group relative ${activeTab === "images" ? "bg-active-bg text-text-primary" : ""}`}
            data-tab="images"
            onClick={() => handleNavClick("images")}
          >
            <ImageIcon size={20} className="shrink-0 text-current" />
            <span className="flex-1">Generated Images</span>
          </button>

          <button
            className={`flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 text-left w-full hover:bg-hover-bg hover:text-text-primary group relative ${activeTab === "prompts" ? "bg-active-bg text-text-primary" : ""}`}
            data-tab="prompts"
            onClick={() => handleNavClick("prompts")}
          >
            <FileText size={20} className="shrink-0 text-current" />
            <span className="flex-1">Prompts</span>
          </button>
        </nav>
      </div>

      {/* Scrollable Content Section */}

      <div
        className="flex-1 overflow-y-auto px-4 pb-5 min-h-0 flex flex-col"
      >
        {/* Pinned Items Section */}

        {chatGroups["Pinned"].length > 0 && (
          <div
            className="mb-0 pb-0 relative block"
          >
            <div
              className="flex items-center gap-3 px-3 py-2 mb-1 text-text-secondary text-sm font-medium sticky top-0 z-10 bg-bg-primary border-b border-border justify-between"
            >
              <div
                className="flex items-center gap-2"
              >
                <Heart size={20} className="text-current" />
                Pinned
              </div>
            </div>

            <div className="flex flex-col gap-2 px-3 pl-8 pr-0 relative overflow-visible" id="pinnedItems">
              {/* Vertical line for pinned items */}
              <div className="absolute left-8.5 top-0 bottom-0 w-px bg-border opacity-50"></div>

              {chatGroups["Pinned"].map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center rounded-lg transition-all duration-200 relative w-[calc(100%-10px)] mr-2.5 hover:bg-hover-bg group ${currentChatId === chat.id ? "active" : ""}`}
                >
                  {/* Active indicator */}
                  <div className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-0 bg-brand rounded-full transition-[height] duration-200 z-10 ${currentChatId === chat.id ? "h-4" : ""}`}></div>
                  
                  {/* Fade out effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-17.5 bg-linear-to-r from-transparent to-bg-primary via-bg-primary/80 pointer-events-none z-1"></div>

                  <button
                    className="flex-1 flex items-center px-3 py-2 pl-[calc(12px)] bg-transparent border-none text-text-secondary text-sm cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 hover:text-text-primary"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <span className="overflow-hidden text-ellipsis text-inherit">{chat.title}</span>
                  </button>

                  <button
                    className="flex items-center justify-center w-6 h-6 bg-transparent border-none rounded hover:bg-white/10 cursor-pointer transition-all duration-200 mr-2.5 opacity-0 absolute right-0 z-20 group-hover:opacity-100"
                    title="Unpin"
                    onClick={(e) => {
                      e.stopPropagation();

                      togglePinChat(chat.id);
                    }}
                  >
                    <X size={14} className="text-text-secondary" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}

        <div className="mb-0 pb-0 relative">
          <div
            className="flex items-center gap-3 px-3 py-2 mb-1 text-text-secondary text-sm font-medium sticky top-0 z-10 bg-bg-primary border-b border-border justify-between"
          >
            <div className="flex items-center gap-2">
              <History size={20} className=" shrink-0" />
              History
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col gap-2 mb-1 pl-8 pr-0 relative" id="historyItems">
              {/* Vertical line for history items */}
              <div className="absolute left-8.5 top-0 bottom-0 w-px bg-border opacity-50"></div>

              {["Today", "Yesterday", "Previous 7 Days", "Older"].map(
                (group) =>
                  chatGroups[group].length > 0 && (
                    <div key={group}>
                      <div className="text-xs text-text-muted font-medium uppercase tracking-[0.5px] px-3 py-2 pb-1">{group}</div>

                      {chatGroups[group].map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex items-center relative w-[calc(100%-10px)] mb-0.5 mr-2.5 ml-0 transition-all duration-200 hover:bg-hover-bg group ${currentChatId === chat.id ? "active" : ""}`}
                          data-chat-id={chat.id}
                        >
                           {/* Active indicator */}
                           <div className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-0 bg-brand rounded-full transition-[height] duration-200 ${currentChatId === chat.id ? "h-4" : ""}`}></div>
                  
                          {/* Fade out */}
                          <div className="absolute right-0 top-0 bottom-0 w-17.5 bg-linear-to-r from-transparent to-bg-primary via-bg-primary/80 pointer-events-none z-1"></div>

                          <button
                            className="flex-1 flex items-center px-3 py-2 pl-3 bg-transparent border-none text-text-secondary text-sm cursor-pointer text-left whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 hover:text-text-primary outline-none rounded-md min-w-0"
                            onClick={() => handleChatClick(chat.id)}
                          >
                            <span className="truncate flex-1">{chat.title}</span>
                          </button>

                          <Dropdown
                            usePortal={true}
                            align="right"
                            className="shrink-0 z-20"
                            menuClassName="min-w-40 p-1"
                            trigger={
                              <button
                                className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md cursor-pointer text-text-secondary opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-hover-bg hover:text-text-primary mr-1"
                                title="More options"
                              >
                                <MoreVertical size={16} className="pointer-events-none" />
                              </button>
                            }
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(chat.id); }}
                              className="w-full px-3 py-2 bg-none border-none text-text-primary cursor-pointer rounded text-left text-[13px] transition-colors duration-200 flex items-center gap-2 hover:bg-hover-bg"
                            >
                              {chat.pinned ? (
                                <>
                                  <PinOff size={16} />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin size={16} />
                                  Pin
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleRename(chat.id, chat.title); }}
                              className="w-full px-3 py-2 bg-none border-none text-text-primary cursor-pointer rounded text-left text-[13px] transition-colors duration-200 flex items-center gap-2 hover:bg-hover-bg"
                            >
                              <Pencil size={16} />
                              Rename
                            </button>

                            <button
                              className="w-full px-3 py-2 bg-none border-none text-[#ff6b6b] cursor-pointer rounded text-left text-[13px] transition-colors duration-200 flex items-center gap-2 hover:bg-hover-bg"
                              onClick={(e) => { e.stopPropagation(); handleDelete(chat.id, chat.title); }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </Dropdown>
                        </div>
                      ))}
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings and Account */}

      <div className="p-4 shrink-0">
        <button
          className="flex items-center p-2 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-200 w-full hover:bg-hover-bg"
          id="accountBtn"
          onClick={openProfileModal}
        >
          <div className="w-8 h-8 bg-bg-input rounded-md flex items-center justify-center">
            <User size={20} className="text-text-secondary" />
          </div>
        </button>
      </div>
    </aside>
  );
}