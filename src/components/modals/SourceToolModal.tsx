import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';
import { X, Globe, User, BookOpen, Folder } from 'lucide-react';

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
    sourceProjectIds, toggleSourceProject
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
                className="bg-transparent border-none text-text-muted cursor-pointer p-0 leading-none hover:text-text-primary transition-colors flex items-center justify-center"
            >
                <X size={24} />
            </button>
        </div>

        <div className="p-2 overflow-y-auto custom-scrollbar">
          <div className="mb-2">
            <SourceItem 
                id="sourceWeb"
                label="Web"
                description="Search across the entire internet"
                icon={<Globe size={18} />}
                checked={sourceWebEnabled}
                onChange={setSourceWebEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceProfile"
                label="My Profile"
                description="Use my profile data in the answer context"
                icon={<User size={18} />}
                checked={sourceProfileEnabled}
                onChange={setSourceProfileEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceKnowledgebase"
                label="Knowledgebase"
                description="Use Knowledgebase data in the answer context"
                icon={<BookOpen size={18} />}
                checked={ragEnabled}
                onChange={setRagEnabled}
            />
            <div className="h-px bg-border/50 mx-4 my-1"></div>
          
            <SourceItem 
                id="sourceProjects"
                label="My Projects"
                description="Use data from your active projects"
                icon={<Folder size={18} />}
                checked={sourceProjectsEnabled}
                onChange={setSourceProjectsEnabled}
            />
          </div>

          {sourceProjectsEnabled && projects.length > 0 && (
            <div className="pl-2 pr-2 pb-2 -mt-1 animate-fadeIn">
              {projects.map((project) => (
                <SourceItem
                  key={project.id}
                  id={`project-${project.id}`}
                  label={project.name}
                  checked={sourceProjectIds.includes(project.id)}
                  onChange={() => toggleSourceProject(project.id)}
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
