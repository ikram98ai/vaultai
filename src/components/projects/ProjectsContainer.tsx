import { useEffect, useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import type { Project } from '../../types';

export function ProjectsContainer() {
  const { projects, isLoadingProjects, loadProjects, createProject, deleteProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    await createProject({
      name: newProjectName,
      description: newProjectDescription,
    });
    
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateModal(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  const getProjectColor = (project: Project) => {
    return project.color || '#4f46e5';
  };

  return (
    <div className="projects-container" id="projectsContainer">
      <div className="projects-header">
        <h2>My Projects</h2>
        <p className="projects-subtitle">Organize your work into projects with dedicated chats and files</p>
        <button 
          className="create-project-btn" 
          id="createProjectBtn"
          onClick={() => setShowCreateModal(true)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          New Project
        </button>
      </div>

      <div className="projects-grid" id="projectsGrid">
        {isLoadingProjects ? (
          <div className="loading-projects" id="loadingProjects">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-projects">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
            </svg>
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card"
              style={{ borderLeftColor: getProjectColor(project) }}
            >
              <div className="project-card-header">
                <div 
                  className="project-icon" 
                  style={{ backgroundColor: getProjectColor(project) }}
                >
                  {project.icon || '📁'}
                </div>
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="project-card-meta">
                <span className="project-files-count">{project.files.length} files</span>
                <span className="project-chats-count">{project.chats.length} chats</span>
              </div>
              <div className="project-card-actions">
                <button 
                  className="project-action-btn"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">Description (optional)</label>
                <textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateProject}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
