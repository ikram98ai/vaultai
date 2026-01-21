import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/projectStore";
import { ProjectDetail } from "./ProjectDetail";
import { updateProject } from "../services/tauri/commands";

export function ProjectsContainer() {
  const {
    projects,
    isLoadingProjects,
    loadProjects,
    createProject,
    deleteProject,
    currentProject,
    setCurrentProject,
  } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [activeProjectMenu, setActiveProjectMenu] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const validateForm = () => {
    const name = newProjectName.trim();
    if (!name) {
      setFormError("Project name is required");
      return false;
    }
    if (name.length < 3) {
      setFormError("Project name must be at least 3 characters");
      return false;
    }
    if (name.length > 100) {
      setFormError("Project name must be less than 100 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(name)) {
      setFormError(
        "Project name can only contain letters, numbers, spaces, hyphens, underscores, and dots",
      );
      return false;
    }
    return true;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) return;

    const project = await createProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
    });

    if (project) {
      setCurrentProject(project);
    }

    setNewProjectName("");
    setNewProjectDescription("");
    setFormError("");
    setShowCreateModal(false);
  };

  const handleRenameProject = async (project: any) => {
    const newName = window.prompt("Enter new project name:", project.name);
    if (newName && newName.trim() && newName !== project.name) {
      try {
        await updateProject(project.id, { ...project, name: newName.trim() });
      } catch (error) {
        console.error("Failed to rename project:", error);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  return (
    <div className="projects-container" id="projectsContainer">
      {currentProject ? (
        <ProjectDetail />
      ) : (
        <>
          <div className="projects-header">
            <h2>My Projects</h2>
            <p className="projects-subtitle">
              Organize your work into projects with dedicated chats and files
            </p>
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
              <div className="empty-state">
                <svg
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  fill="currentColor"
                  opacity="0.3"
                >
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                </svg>
                <h4>No projects yet.</h4>
                <p>Create your first project to get started!</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  data-project-id={project.id}
                  onClick={() => setCurrentProject(project)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="project-card-header">
                    <h3>{project.name}</h3>
                    <button
                      className="project-menu-btn"
                      title="Project options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProjectMenu(
                          activeProjectMenu === project.id ? null : project.id,
                        );
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    {activeProjectMenu === project.id && (
                      <div className="project-context-menu">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameProject(project);
                            setActiveProjectMenu(null);
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Rename
                        </button>
                        <button
                          className="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                            setActiveProjectMenu(null);
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p>{project.description || "No description"}</p>
                  <div className="project-stats">
                    <div className="project-stat">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                      {project.chats ? project.chats.length : 0} chat
                      {project.chats?.length !== 1 ? "s" : ""}
                    </div>
                    <div className="project-stat">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                      {project.files ? project.files.length : 0} file
                      {project.files?.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div
          className="modal create-project-modal"
          style={{ display: "flex" }}
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form
              id="createProjectForm"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}
            >
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="Enter project name"
                  className={`form-input ${formError ? "error" : ""}`}
                  required
                  maxLength={100}
                />
                <div className="form-error" id="nameError">
                  {formError}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  name="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project"
                  className="form-input"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  id="cancelProjectBtn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="submitProjectBtn"
                  disabled={!newProjectName.trim()}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
