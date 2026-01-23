import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useAppStore } from './stores/appStore';
import { useChatStore } from './stores/chatStore';
import { useProjectStore } from './stores/projectStore';
import './App.css';

function App() {
  const { loadSettings, detectSystemTier } = useAppStore();
  const { loadChatHistory, createNewChat } = useChatStore();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    // Initialize app
    const init = async () => {
      // Detect system capabilities
      await detectSystemTier();
      
      // Load settings
      await loadSettings();
      
      // Load chat history
      await loadChatHistory();
      
      // Load projects
      await loadProjects();
      
      // Create a new chat on startup
      createNewChat();
    };

    init();
  }, []);

  return <Layout />;
}

export default App;
