import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { UserProfile } from '../../types';

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { 
    currentModel, 
    setCurrentModel, 
    ragEnabled, 
    setRagEnabled, 
    webSearchEnabled, 
    setWebSearchEnabled,
    userProfile,
    loadProfile,
    saveProfile,
    clearProfile,
    isLoadingProfile
  } = useAppStore();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setProfile(prev => ({ ...prev, ...userProfile }));
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile(profile);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleClearProfile = async () => {
    try {
      await clearProfile();
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
    <div id="profileModal" className="fixed inset-0 z-2000 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-bg-secondary rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                <h2 className="text-xl font-semibold text-text-primary m-0">Profile</h2>
                <button className="bg-transparent border-none text-text-muted text-2xl cursor-pointer p-0 leading-none hover:text-text-primary transition-colors" id="closeProfile" onClick={onClose}>×</button>
            </div>
            
            {isLoadingProfile ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mb-3"></div>
                    <p className="text-text-muted">Loading...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="profileForm" onSubmit={handleSaveProfile} className=" pb-20">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
                            <div className="w-24 h-24 rounded-2xl bg-bg-tertiary flex items-center justify-center text-3xl font-semibold text-accent-primary border border-border">
                                <span id="profileInitials">{profile.name ? profile.name.substring(0, 2).toUpperCase() : 'VA'}</span>
                            </div>
                            <button type="button" className="px-4 py-2 bg-transparent border border-border text-text-primary rounded-lg text-sm font-medium cursor-pointer hover:bg-hover-bg transition-colors">Change Avatar</button>
                        </div>

                        <div className="mb-8 pb-8 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Basic Information</h3>
                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
                                <input type="text" id="fullName" name="name" placeholder="Your name"
                                    className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.name} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="pronouns" className="block text-sm font-medium text-text-secondary mb-1.5">Pronouns</label>
                                    <select id="pronouns" name="pronouns" className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer" value={profile.pronouns || ''} onChange={handleChange}>
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
                                <div>
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-secondary mb-1.5">Date of Birth</label>
                                    <input type="date" id="dateOfBirth" name="dob" className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" value={profile.dob || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-1.5">Location</label>
                                    <input type="text" id="location" name="location" placeholder="City, Country"
                                        className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.location || ''} onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="occupation" className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
                                    <input type="text" id="occupation" name="occupation" placeholder="Your role"
                                        className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.occupation || ''} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="employer" className="block text-sm font-medium text-text-secondary mb-1.5">Organization</label>
                                <input type="text" id="employer" name="employer" placeholder="Company/Organization"
                                    className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.employer || ''} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="aliases" className="block text-sm font-medium text-text-secondary mb-1.5">Aliases</label>
                                <input type="text" id="aliases" name="aliases"
                                    placeholder="Nicknames, alternate names (comma-separated)" className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.aliases || ''} onChange={handleChange} />
                                <p className="text-xs text-text-muted mt-1">Names the AI can use to address you</p>
                            </div>
                        </div>

                        <div className="mb-8 pb-8 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Preferences</h3>
                            <div className="mb-4">
                                <label htmlFor="interests" className="block text-sm font-medium text-text-secondary mb-1.5">Topics of Interest</label>
                                <input type="text" id="interests" name="interests"
                                    placeholder="Technology, Science, Art..." className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted" value={profile.interests || ''} onChange={handleChange} />
                                <p className="text-xs text-text-muted mt-1">Help the AI understand your interests</p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="communicationStyle" className="block text-sm font-medium text-text-secondary mb-1.5">Communication Style</label>
                                <select id="communicationStyle" name="communicationStyle" className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer" value={profile.communicationStyle || 'balanced'} onChange={handleChange}>
                                    <option value="balanced">Balanced</option>
                                    <option value="formal">Formal</option>
                                    <option value="casual">Casual</option>
                                    <option value="technical">Technical</option>
                                    <option value="creative">Creative</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-8 pb-8 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Relationships</h3>
                            <div className="mb-4">
                                <label htmlFor="relationships" className="block text-sm font-medium text-text-secondary mb-1.5">Family & Pets</label>
                                <textarea id="relationships" name="relationships" rows={3}
                                    placeholder="Name (relation)&#10;Example: John (brother)&#10;Fluffy (cat)"
                                    className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted resize-y min-h-20" value={profile.relationships || ''} onChange={handleChange}></textarea>
                                <p className="text-xs text-text-muted mt-1">One per line in format: Name (relation)</p>
                            </div>
                        </div>

                        <div className="mb-8 pb-8 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Additional Context</h3>
                            <div className="mb-4">
                                <label htmlFor="context" className="block text-sm font-medium text-text-secondary mb-1.5">Background Information</label>
                                <textarea id="context" name="notes" rows={8}
                                    placeholder="Any additional context you'd like the AI to know..."
                                    className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-muted resize-y min-h-30" value={profile.notes || ''} onChange={handleChange}></textarea>
                                <p className="text-xs text-text-muted mt-1">This helps personalize your AI interactions</p>
                            </div>
                        </div>

                        {/* Settings Section embedded in Profile Modal as per HTML */}
                        <div className="mb-8 pb-8 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
                            <h3 className="text-lg font-medium text-text-primary mb-4">Settings</h3>

                            <div className="mb-4">
                                <label className="flex items-start gap-3 cursor-pointer select-none group">
                                    <div className="relative inline-block w-9.5 h-5.5 shrink-0 mt-0.5">
                                        <input type="checkbox" id="ragEnabled" className="peer sr-only" checked={ragEnabled} onChange={(e) => setRagEnabled(e.target.checked)} />
                                        <span className="absolute inset-0 bg-[#2A2A2A] border border-border rounded-full transition-all duration-300 peer-checked:bg-brand peer-checked:border-brand"></span>
                                        <span className="absolute left-0.75 top-0.75 h-4 w-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></span>
                                    </div>
                                    <span className="flex flex-col">
                                        <strong className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Knowledge Base Integration</strong>
                                        <small className="text-xs text-text-muted">Use documents from your knowledge base to enhance responses</small>
                                    </span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-start gap-3 cursor-pointer select-none group">
                                    <div className="relative inline-block w-9.5 h-5.5 shrink-0 mt-0.5">
                                        <input type="checkbox" id="webSearchEnabled" className="peer sr-only" checked={webSearchEnabled} onChange={(e) => setWebSearchEnabled(e.target.checked)} />
                                        <span className="absolute inset-0 bg-[#2A2A2A] border border-border rounded-full transition-all duration-300 peer-checked:bg-brand peer-checked:border-brand"></span>
                                        <span className="absolute left-0.75 top-0.75 h-4 w-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></span>
                                    </div>
                                    <span className="flex flex-col">
                                        <strong className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">Web Search</strong>
                                        <small className="text-xs text-text-muted">Allow AI to search the web for current information</small>
                                    </span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="defaultModelProfile" className="block text-sm font-medium text-text-secondary mb-1.5">Default Model</label>
                                <select id="defaultModelProfile" className="w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-text-primary text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer" value={currentModel} onChange={(e) => setCurrentModel(e.target.value)}>
                                    <option value="vaultai16-chat">Mistral Nemo 12B (Chat)</option>
                                    <option value="vaultai16-code">Devstral (Code)</option>
                                    <option value="vaultai16-fast">LLaMA 3.2 3B (Fast)</option>
                                    <option value="flux-schnell">FLUX Image</option>
                                    <option value="infiniteyou-flux">InfiniteYou FLUX</option>
                                </select>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-bg-secondary pt-4 border-t border-border flex justify-between gap-3 -mx-6 px-6 z-10 pb-2">
                             <button type="button" className="px-4 py-2 bg-transparent border border-border text-text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 rounded-lg text-sm font-medium cursor-pointer transition-colors" id="clearProfile" onClick={handleClearProfile}>Clear Profile</button>
                             <button type="submit" className="px-6 py-2 bg-accent-primary text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-accent-hover shadow-lg shadow-accent/20">Save Profile</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
}
