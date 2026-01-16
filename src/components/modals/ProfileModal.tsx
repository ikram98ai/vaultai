import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { UserProfile } from '../../types';
import * as commands from '../../services/tauri/commands';

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { currentModel, setCurrentModel, ragEnabled, setRagEnabled, webSearchEnabled, setWebSearchEnabled } = useAppStore();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const userProfile = await commands.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await commands.saveUserProfile(profile);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleClearProfile = async () => {
    try {
      await commands.clearUserProfile();
      setProfile({ name: '', email: '' });
    } catch (error) {
      console.error('Failed to clear profile:', error);
    }
  };

  return (
    <div className="modal" id="profileModal" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Profile & Settings</h2>
          <button className="close-modal-btn" id="closeProfile" onClick={onClose}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <form id="profileForm" onSubmit={handleSaveProfile}>
            {/* Profile Section */}
            <div className="profile-section">
              <h3>Profile Information</h3>
              
              <div className="form-group">
                <label htmlFor="profileName">Display Name</label>
                <input
                  type="text"
                  id="profileName"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileEmail">Email (optional)</label>
                <input
                  type="email"
                  id="profileEmail"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Settings Section */}
            <div className="settings-section">
              <h3>AI Settings</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Default Model</span>
                  <span className="setting-description">Choose your preferred AI model</span>
                </div>
                <select 
                  id="defaultModel" 
                  className="setting-select"
                  value={currentModel}
                  onChange={(e) => setCurrentModel(e.target.value)}
                >
                  <option value="vaultai16-chat">Mistral Nemo 12B</option>
                  <option value="vaultai16-code">Devstral</option>
                  <option value="vaultai16-fast">LLaMA 3.2 3B</option>
                </select>
              </div>

              <label className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Enable RAG</span>
                  <span className="setting-description">Use your knowledgebase in conversations</span>
                </div>
                <input
                  type="checkbox"
                  id="ragEnabled"
                  className="setting-toggle"
                  checked={ragEnabled}
                  onChange={(e) => setRagEnabled(e.target.checked)}
                />
              </label>

              <label className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Web Search</span>
                  <span className="setting-description">Enable web search for current information</span>
                </div>
                <input
                  type="checkbox"
                  id="webSearchEnabled"
                  className="setting-toggle"
                  checked={webSearchEnabled}
                  onChange={(e) => setWebSearchEnabled(e.target.checked)}
                />
              </label>
            </div>

            {/* Actions */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-danger" 
                id="clearProfile"
                onClick={handleClearProfile}
              >
                Clear Profile
              </button>
              <div className="footer-right">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
