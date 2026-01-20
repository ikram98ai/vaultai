import { useUIStore } from "../../stores/uiStore";
import { WelcomeScreen } from "../WelcomeScreen";
import { ChatContainer } from "../ChatContainer";
import { FilesContainer } from "../FilesContainer";
import { ProjectsContainer } from "../ProjectsContainer";
import { PromptsContainer } from "../PromptsContainer";
import { ImagesContainer } from "../ImagesContainer";

export function MainContent() {
  const { activeTab, showWelcome } = useUIStore();

  return (
    <main className="main-content">
      {/* Header (empty now, settings moved to profile) */}
      <header className="main-header" />

      {/* Welcome Screen - only shown for chat tab when no messages */}
      {activeTab === "chat" && showWelcome && <WelcomeScreen />}

      {/* Chat Container - shown when there are messages */}
      {activeTab === "chat" && !showWelcome && <ChatContainer />}

      {/* Files Container */}
      {activeTab === "files" && <FilesContainer />}

      {/* Projects Container */}
      {activeTab === "projects" && <ProjectsContainer />}

      {/* Prompts Container */}
      {activeTab === "prompts" && <PromptsContainer />}

      {/* Generated Images Container */}
      {activeTab === "images" && <ImagesContainer />}
    </main>
  );
}
