import { useEffect, useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useUIStore } from "../../stores/uiStore";
import { useProjectStore } from "../../stores/projectStore";
import type { Tab } from "../../types";

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
  } = useUIStore();
  const { clearCurrentProject, currentProject } = useProjectStore();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Close menu when clicking outside

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);

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

    setShowWelcome(true);
  };

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();

    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();

    // Position menu to the right of the button, slightly offset

    setMenuPosition({ x: rect.right - 140, y: rect.bottom + 5 });

    setActiveMenuId(activeMenuId === chatId ? null : chatId);
  };

  const handleRename = async (chatId: string, currentTitle: string) => {
    const newTitle = prompt("Enter new chat title:", currentTitle);

    if (newTitle && newTitle.trim()) {
      await renameChat(chatId, newTitle.trim());
    }

    setActiveMenuId(null);
  };

  const handleDelete = async (chatId: string, title: string) => {
    if (confirm(`Delete chat "${title}"?`)) {
      await deleteChat(chatId);
    }

    setActiveMenuId(null);
  };

  const handleTogglePin = async (chatId: string) => {
    await togglePinChat(chatId);

    setActiveMenuId(null);
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

    const chatsToShow = currentProject
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
    <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
      {/* VaultAI Logo */}

      <button
        className="sidebar-logo"
        id="homeLogoBtn"
        title="Home"
        onClick={handleHomeClick}
      >
        <svg
          width="28"
          height="31"
          viewBox="0 0 28 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="vaultai-logo"
        >
          <path
            d="M12.0009 30.2925C11.7548 30.16 10.3919 29.1757 9.65372 28.5889C4.3284 24.3678 1.48276 19.8564 0.50477 14.0894C0.182979 12.1839 0.0441675 10.2847 0.0189291 7.50845L0 5.67866L0.157741 5.40735C0.384887 5.00984 0.675129 4.87734 1.94967 4.57448C5.12341 3.82363 8.22775 2.46075 11.6665 0.315481C12.1649 0 12.1713 0 12.7076 0H13.2502L13.9443 0.447984C16.0075 1.773 18.3673 2.93397 20.6892 3.76053C21.1751 3.93089 21.6105 4.10756 21.6546 4.14542C21.6988 4.18328 21.7366 4.33471 21.7366 4.47983C21.7366 4.75115 21.7303 4.75746 20.9479 5.43889C20.0709 6.18974 19.9384 6.27176 19.5409 6.27807C18.9036 6.28438 15.7867 4.87103 13.5278 3.55863C13.1177 3.31886 12.7391 3.12326 12.695 3.12326C12.6445 3.12326 12.2091 3.35672 11.7296 3.63434C9.35086 5.02877 6.54308 6.2276 3.91197 6.97844C3.35672 7.13618 2.97814 7.2813 2.8835 7.36964L2.72576 7.50845L2.76992 8.80192C2.97183 15.3261 4.43566 19.3138 8.10786 23.3077C8.70728 23.9639 9.98182 25.1565 10.8147 25.8379C11.5718 26.4689 12.6003 27.226 12.695 27.226C12.8022 27.226 13.7991 26.4752 14.8276 25.6234C15.8182 24.7968 17.5849 23.0238 18.2853 22.1468C20.4179 19.4967 21.6925 16.5817 22.2414 13.124C22.3928 12.165 22.2856 12.3479 23.7116 10.6002C24.7274 9.35086 24.7463 9.33824 25.005 9.31931C25.2006 9.30669 25.2827 9.32562 25.3079 9.39503C25.3584 9.52122 25.2385 11.3636 25.106 12.4615C24.557 17.2 23.0995 20.7587 20.2981 24.1974C19.5788 25.0744 17.6796 26.9736 16.6511 27.8381C15.8056 28.551 14.468 29.5669 13.7045 30.0906L13.2754 30.3808H12.7265C12.3732 30.3808 12.1145 30.3493 12.0009 30.2925Z"
            fill="#FFBA08"
          />

          <path
            d="M12.2408 21.9702C12.1903 21.8881 11.7739 20.9543 11.3196 19.9006C9.48977 15.6353 8.68214 14.3544 7.44545 13.774C7.07319 13.6036 6.94068 13.5784 6.25924 13.5405L5.48947 13.5026L5.47054 13.2313C5.4453 12.8717 5.58411 12.6572 6.24032 12.0388C6.84604 11.4709 7.39498 11.1239 8.0007 10.9409C8.35404 10.8274 8.55595 10.8147 9.19953 10.8274C9.93145 10.8526 9.98823 10.8652 10.4425 11.0797C11.4331 11.5593 12.2218 12.4679 12.9727 13.9822L13.2882 14.6194L15.4461 12.4552C19.5852 8.30351 22.8662 5.38847 25.9326 3.12963C26.7403 2.53021 27.1252 2.35354 27.5227 2.37878L27.8255 2.39771V2.7826C27.8255 3.1107 27.794 3.21796 27.6047 3.52082C27.3586 3.91202 25.5919 6.14562 22.6643 9.77366C16.4682 17.4398 14.6447 19.7555 13.6604 21.2319C13.0736 22.109 13.0673 22.1153 12.6698 22.1153C12.3922 22.1153 12.3228 22.09 12.2408 21.9702Z"
            fill="#FFBA08"
          />
        </svg>
      </button>

      {/* Fixed Top Section */}

      <div className="sidebar-top">
        {/* Search */}

        <div className="sidebar-search">
          <div className="search-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>

            <input
              type="text"
              placeholder="Search ⌘K"
              className="search-input"
            />
          </div>
        </div>

        {/* Navigation */}

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "chat" ? "active" : ""}`}
            data-tab="chat"
            onClick={() => handleNavClick("chat")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>

            <span>Chat</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              width="16"
              height="16"
              className="nav-item-plus"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>

          <button
            className={`nav-item ${activeTab === "files" ? "active" : ""}`}
            data-tab="files"
            onClick={() => handleNavClick("files")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            Knowledgebase
          </button>

          <button
            className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
            data-tab="projects"
            onClick={() => handleNavClick("projects")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            Projects
          </button>

          <button
            className={`nav-item ${activeTab === "images" ? "active" : ""}`}
            data-tab="images"
            onClick={() => handleNavClick("images")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            Generated Images
          </button>

          <button
            className={`nav-item ${activeTab === "prompts" ? "active" : ""}`}
            data-tab="prompts"
            onClick={() => handleNavClick("prompts")}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 3v5a2 2 0 002 2h5"
              />
            </svg>
            Prompts
          </button>
        </nav>
      </div>

      {/* Scrollable Content Section */}

      <div
        className="sidebar-content"
        style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        {/* Pinned Items Section */}

        {chatGroups["Pinned"].length > 0 && (
          <div
            className="sidebar-section pinned-section"
            style={{ display: "block", marginBottom: "24px" }}
          >
            <div
              className="section-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="heart-icon-outline"
                  style={{ fill: "none" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                  />
                </svg>
                Pinned
              </div>
            </div>

            <div className="pinned-items" id="pinnedItems">
              {chatGroups["Pinned"].map((chat) => (
                <div
                  key={chat.id}
                  className={`pinned-item-sidebar ${currentChatId === chat.id ? "active" : ""}`}
                >
                  <button
                    className="pinned-item-content"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <span className="pinned-item-title">{chat.title}</span>
                  </button>

                  <button
                    className="unpin-btn"
                    title="Unpin"
                    onClick={(e) => {
                      e.stopPropagation();

                      togglePinChat(chat.id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="14"
                      height="14"
                    >
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}

        <div className="sidebar-section">
          <div
            className="section-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
              </svg>
              History
            </div>
          </div>

          <div className="section-items">
            <div className="history-items" id="historyItems">
              {["Today", "Yesterday", "Previous 7 Days", "Older"].map(
                (group) =>
                  chatGroups[group].length > 0 && (
                    <div key={group}>
                      <div className="history-date-group">{group}</div>

                      {chatGroups[group].map((chat) => (
                        <div
                          key={chat.id}
                          className={`dynamic-history-item history-item-container ${currentChatId === chat.id ? "active" : ""}`}
                          data-chat-id={chat.id}
                        >
                          <button
                            className="history-item-content"
                            onClick={() => handleChatClick(chat.id)}
                          >
                            {chat.title}
                          </button>

                          <button
                            className="history-menu-btn"
                            title="More options"
                            onClick={(e) => handleMenuClick(e, chat.id)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="5" r="2" />

                              <circle cx="12" cy="12" r="2" />

                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>

                          {activeMenuId === chat.id && (
                            <div
                              className="chat-context-menu"
                              style={{
                                position: "fixed",
                                left: `${menuPosition.x}px`,
                                top: `${menuPosition.y}px`,
                                zIndex: 1000,
                              }}
                            >
                              <button onClick={() => handleTogglePin(chat.id)}>
                                {chat.pinned ? (
                                  <>
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                    >
                                      <path d="M17 3v7.64l2 1V3a1 1 0 00-1-1H6a1 1 0 00-1 1v7.64l2-1V3h10zm-5 18l-2-2v-7H7v-2h10v2h-3v7l-2 2z" />
                                    </svg>
                                    Unpin
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="16"
                                      height="16"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M5 5c0-1.1.9-2 2-2h10a2 2 0 012 2v7l-2 2V5H7v9l-2-2V5z" />
                                      <path d="M12 21l-2-2v-7H7v-2h10v2h-3v7l-2 2z" />
                                    </svg>
                                    Pin
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleRename(chat.id, chat.title)
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Rename
                              </button>

                              <button
                                className="delete"
                                onClick={() =>
                                  handleDelete(chat.id, chat.title)
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
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

      <div className="sidebar-footer">
        <button
          className="account-btn"
          id="accountBtn"
          onClick={openProfileModal}
        >
          <div className="account-avatar">?</div>
        </button>
      </div>
    </aside>
  );
}
