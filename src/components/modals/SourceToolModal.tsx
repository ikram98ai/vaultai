import { useAppStore } from '../../stores/appStore';
import { useUIStore } from '../../stores/uiStore';

interface SourceItemProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SourceItem({ label, description, icon, checked, onChange }: SourceItemProps) {
  return (
    <div className="source-item">
      <div className="source-info">
        <div className="source-label">
          {icon}
          {label}
        </div>
        <div className="source-desc">{description}</div>
      </div>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}

export function SourceToolModal() {
  const { closeSourceToolModal } = useUIStore();
  const { 
    sourceWebEnabled, setSourceWebEnabled,
    sourceProfileEnabled, setSourceProfileEnabled,
    sourceKnowledgebaseEnabled, setSourceKnowledgebaseEnabled,
    sourceProjectsEnabled, setSourceProjectsEnabled
  } = useAppStore();

  return (
    <div id="sourceToolModal" className="modal" style={{ display: 'flex' }} onClick={closeSourceToolModal}>
      <div className="source-tool-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="source-tool-modal-header">
          <h3 className="modal-title">Sources</h3>
        </div>

        <div className="source-group">
          <SourceItem 
            id="sourceWeb"
            label="Web"
            description="Search across the entire internet"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 0c-3 0-5.25 4.365-5.25 9.75S9 21.75 12 21.75s5.25-4.365 5.25-9.75S15 2.25 12 2.25zm-9.75 9.75h19.5M3.75 8.25h16.5M3.75 15.75h16.5" />
              </svg>
            }
            checked={sourceWebEnabled}
            onChange={setSourceWebEnabled}
          />
          <hr />
        </div>

        <div className="source-group">
          <SourceItem 
            id="sourceProfile"
            label="My Profile"
            description="Use my profile data in the answer context"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.586-7.499-1.632z" />
              </svg>
            }
            checked={sourceProfileEnabled}
            onChange={setSourceProfileEnabled}
          />
          <hr />
        </div>

        <div className="source-group">
          <SourceItem 
            id="sourceKnowledgebase"
            label="Knowledgebase"
            description="Use Knowledgebase data in the answer context"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
              </svg>
            }
            checked={sourceKnowledgebaseEnabled}
            onChange={setSourceKnowledgebaseEnabled}
          />
          <hr />
        </div>

        <div className="source-group">
          <SourceItem 
            id="sourceProjects"
            label="Projects"
            description="Use data from your active projects"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            }
            checked={sourceProjectsEnabled}
            onChange={setSourceProjectsEnabled}
          />
        </div>

      </div>
    </div>
  );
}
