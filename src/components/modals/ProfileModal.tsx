import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { UserProfile } from '../../types';
import * as commands from '../../services/tauri/commands';

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { currentModel, setCurrentModel, ragEnabled, setRagEnabled, webSearchEnabled, setWebSearchEnabled } = useAppStore();
  
  const [profile, setProfile] = useState<UserProfile & {
    pronouns?: string;
    dob?: string;
    location?: string;
    occupation?: string;
    employer?: string;
    aliases?: string;
    interests?: string;
    communicationStyle?: string;
    relationships?: string;
    notes?: string;
  }>({
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
        setProfile(prev => ({ ...prev, ...userProfile }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div id="profileModal" className="modal show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content profile-modal">
            <div className="modal-header">
                <h2>Profile</h2>
                <button className="close-modal-btn" id="closeProfile" onClick={onClose}>×</button>
            </div>
            
            {isLoading ? (
                <div className="modal-loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="profile-content">
                    <form id="profileForm" onSubmit={handleSaveProfile}>
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-large">
                                <span id="profileInitials">{profile.name ? profile.name.substring(0, 2).toUpperCase() : 'VA'}</span>
                            </div>
                            <button type="button" className="secondary-btn">Change Avatar</button>
                        </div>

                        <div className="profile-section">
                            <h3>Basic Information</h3>
                            <div className="form-group">
                                <label htmlFor="fullName">Name</label>
                                <input type="text" id="fullName" name="name" placeholder="Your name"
                                    className="form-input" value={profile.name} onChange={handleChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="pronouns">Pronouns</label>
                                    <select id="pronouns" name="pronouns" className="form-select" value={profile.pronouns || ''} onChange={handleChange}>
                                        <option value="">Select pronouns</option>
                                        <option value="He">He</option>
                                        <option value="She">She</option>
                                        <option value="They">They</option>
                                        <option value="he/him">he/him</option>
                                        <option value="she/her">she/her</option>
                                        <option value="they/them">they/them</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input type="date" id="dateOfBirth" name="dob" className="form-input" value={profile.dob || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <input type="text" id="location" name="location" placeholder="City, Country"
                                        className="form-input" value={profile.location || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="occupation">Role</label>
                                    <input type="text" id="occupation" name="occupation" placeholder="Your role"
                                        className="form-input" value={profile.occupation || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="employer">Organization</label>
                                <input type="text" id="employer" name="employer" placeholder="Company/Organization"
                                    className="form-input" value={profile.employer || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="aliases">Aliases</label>
                                <input type="text" id="aliases" name="aliases"
                                    placeholder="Nicknames, alternate names (comma-separated)" className="form-input" value={profile.aliases || ''} onChange={handleChange} />
                                <small>Names the AI can use to address you</small>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3>Preferences</h3>
                            <div className="form-group">
                                <label htmlFor="interests">Topics of Interest</label>
                                <input type="text" id="interests" name="interests"
                                    placeholder="Technology, Science, Art..." className="form-input" value={profile.interests || ''} onChange={handleChange} />
                                <small>Help the AI understand your interests</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="communicationStyle">Communication Style</label>
                                <select id="communicationStyle" name="communicationStyle" className="form-select" value={profile.communicationStyle || 'balanced'} onChange={handleChange}>
                                    <option value="balanced">Balanced</option>
                                    <option value="formal">Formal</option>
                                    <option value="casual">Casual</option>
                                    <option value="technical">Technical</option>
                                    <option value="creative">Creative</option>
                                </select>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3>Relationships</h3>
                            <div className="form-group">
                                <label htmlFor="relationships">Family & Pets</label>
                                <textarea id="relationships" name="relationships" rows={3}
                                    placeholder="Name (relation)&#10;Example: John (brother)&#10;Fluffy (cat)"
                                    className="form-textarea" value={profile.relationships || ''} onChange={handleChange}></textarea>
                                <small>One per line in format: Name (relation)</small>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3>Additional Context</h3>
                            <div className="form-group">
                                <label htmlFor="context">Background Information</label>
                                <textarea id="context" name="notes" rows={8}
                                    placeholder="Any additional context you'd like the AI to know..."
                                    className="form-textarea" value={profile.notes || ''} onChange={handleChange}></textarea>
                                <small>This helps personalize your AI interactions</small>
                            </div>
                        </div>

                        <div className="profile-footer">
                            <button type="button" className="secondary-btn" id="clearProfile" onClick={handleClearProfile}>Clear Profile</button>
                            <button type="submit" className="primary-btn">Save Profile</button>
                        </div>
                    </form>

                    {/* Settings Section embedded in Profile Modal as per HTML */}
                    <div className="profile-section settings-section">
                        <h3>Settings</h3>

                        <div className="form-group">
                            <label className="toggle-label">
                                <input type="checkbox" id="ragEnabled" checked={ragEnabled} onChange={(e) => setRagEnabled(e.target.checked)} />
                                <span className="toggle-switch"></span>
                                <span className="toggle-text">
                                    <strong>Knowledge Base Integration</strong>
                                    <small>Use documents from your knowledge base to enhance responses</small>
                                </span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label className="toggle-label">
                                <input type="checkbox" id="webSearchEnabled" checked={webSearchEnabled} onChange={(e) => setWebSearchEnabled(e.target.checked)} />
                                <span className="toggle-switch"></span>
                                <span className="toggle-text">
                                    <strong>Web Search</strong>
                                    <small>Allow AI to search the web for current information</small>
                                </span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="defaultModelProfile">Default Model</label>
                            <select id="defaultModelProfile" className="form-select" value={currentModel} onChange={(e) => setCurrentModel(e.target.value)}>
                                <option value="vaultai16-chat">Mistral Nemo 12B (Chat)</option>
                                <option value="vaultai16-code">Devstral (Code)</option>
                                <option value="vaultai16-fast">LLaMA 3.2 3B (Fast)</option>
                                <option value="flux-schnell">FLUX Image</option>
                                <option value="infiniteyou-flux">InfiniteYou FLUX</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
