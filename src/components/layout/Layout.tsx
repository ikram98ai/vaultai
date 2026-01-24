import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { ProfileModal } from '../modals/ProfileModal';
import { useUIStore } from '../../stores/uiStore';
import { Menu } from 'lucide-react';

export function Layout() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    profileModalOpen, 
    closeProfileModal,
  } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans">
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-5 left-5 z-1001 bg-bg-secondary border border-border rounded-lg p-2.5 cursor-pointer transition-all duration-200 hover:bg-hover-bg text-text-primary" 
        id="mobileMenuToggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-999 hidden lg:hidden ${sidebarOpen ? 'block' : ''}`} 
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
