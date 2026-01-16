import { Sidebar } from '../../components/layout/Sidebar';
import { MainContent } from '../../components/layout/MainContent';
import { ProfileModal } from '../../components/modals/ProfileModal';
import { useUIStore } from '../../stores/uiStore';

export function Layout() {
  const { sidebarOpen, setSidebarOpen, profileModalOpen, closeProfileModal } = useUIStore();

  return (
    <div id="app">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        id="mobileMenuToggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} 
        id="sidebarOverlay"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <MainContent />

      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfileModal onClose={closeProfileModal} />
      )}
    </div>
  );
}
