import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';

interface SourceItemProps {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isProject?: boolean;
}

function SourceItem({ label, description, icon, checked, onChange, isProject }: SourceItemProps) {
  return (
    <label className={`flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer group ${isProject ? 'pl-9 border-l-2 border-border ml-3 my-1' : ''}`} htmlFor={description ? undefined : `switch-${label}`}>
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
          {icon && <span className="text-text-secondary group-hover:text-accent transition-colors">{icon}</span>}
          {label}
        </div>
        {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
      </div>
      <div className="relative inline-block w-9.5 h-5.5 shrink-0">
        <input 
          type="checkbox" 
          id={`switch-${label}`} // Ensure unique ID if label is unique
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="absolute inset-0 bg-[#2A2A2A] border border-border rounded-full transition-all duration-300 peer-checked:bg-brand peer-checked:border-brand"></span>
        <span className="absolute left-0.75 top-0.75 h-4 w-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4"></span>
      </div>
    </label>
  );
}

export function SourceToolModal() {
  const { closeSourceToolModal } = useUIStore();
  const { 
    sourceWebEnabled, setSourceWebEnabled,
    sourceProfileEnabled, setSourceProfileEnabled,
    ragEnabled, setRagEnabled,
    sourceProjectsEnabled, setSourceProjectsEnabled,
    sourceProjectSlugs, toggleSourceProject
  } = useAppStore();

  const { projects, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div id="sourceToolModal" className="fixed inset-0 z-2000 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={closeSourceToolModal}>
      <div className="bg-bg-primary w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border bg-bg-primary shrink-0">
          <h3 className="text-lg font-semibold text-text-primary m-0">Sources</h3>
          <button 
                onClick={closeSourceToolModal}
                className="bg-transparent border-none text-text-muted text-2xl cursor-pointer p-0 leading-none hover:text-text-primary transition-colors"
            >
                ×
            </button>
        </div>

        <div className="p-2 overflow-y-auto custom-scrollbar">
          <div className="mb-2">
            <SourceItem 
                id="sourceWeb"
                label="Web"
                description="Search across the entire internet"
                icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 0c-3 0-5.25 4.365-5.25 9.75S9 21.75 12 21.75s5.25-4.365 5.25-9.75S15 2.25 12 2.25zm-9.75 9.75h19.5M3.75 8.25h16.5M3.75 15.75h16.5" />
                </svg>
                }
                checked={sourceWebEnabled}
                onChange={setSourceWebEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceProfile"
                label="My Profile"
                description="Use my profile data in the answer context"
                icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.586-7.499-1.632z" />
                </svg>
                }
                checked={sourceProfileEnabled}
                onChange={setSourceProfileEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceKnowledgebase"
                label="Knowledgebase"
                description="Use Knowledgebase data in the answer context"
                icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
                </svg>
                }
                checked={ragEnabled}
                onChange={setRagEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceProjects"
                label="My Projects"
                description="Use data from your active projects"
                icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                }
                checked={sourceProjectsEnabled}
                onChange={setSourceProjectsEnabled}
            />
          </div>

          {sourceProjectsEnabled && projects.length > 0 && (
            <div className="pl-2 pr-2 pb-2 -mt-1 animate-fadeIn">
              {projects.map((project) => (
                <SourceItem
                  key={project.id}
                  id={`project-${project.slug}`}
                  label={project.name}
                  checked={sourceProjectSlugs.includes(project.slug)}
                  onChange={() => toggleSourceProject(project.slug)}
                  isProject={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
