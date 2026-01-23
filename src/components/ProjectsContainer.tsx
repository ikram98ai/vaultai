import { useEffect, useRef, useState } from "react";
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
  const projectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  // Close project menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setActiveProjectMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [projectMenuRef]);

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
    <div className="p-6 h-full overflow-y-auto bg-bg-primary" id="projectsContainer">
      {currentProject ? (
        <ProjectDetail />
      ) : (
        <>
          <div className="flex flex-col items-center justify-center text-center mb-16 py-8">
            <div className="mb-6">  
              <h2 className="text-[32px] font-semibold mb-2 text-brand tracking-tight">My Projects</h2>
              <p className="text-text-secondary text-base max-w-lg mx-auto leading-relaxed">
                Organize your work into projects with dedicated chats and files.
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-accent-hover hover:-translate-y-px"
              id="createProjectBtn"
              onClick={() => setShowCreateModal(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" className="fill-current">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="projectsGrid">
            {isLoadingProjects ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted" id="loadingProjects">
                <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted text-center px-4">
                <svg
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  fill="currentColor"
                  className="mb-4 opacity-30"
                >
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                </svg>
                <h4 className="text-lg font-bold text-text-primary mb-2">No projects yet.</h4>
                <p className="text-sm max-w-md">Create your first project to get started!</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-bg-secondary/30 border border-border rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative group"
                  data-project-id={project.id}
                  onClick={() => setCurrentProject(project)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[18px] font-semibold text-text-primary m-0 flex-1 mr-2 truncate">{project.name}</h3>
                    <button
                      className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md cursor-pointer text-text-secondary opacity-0 transition-all hover:bg-hover-bg hover:text-text-primary group-hover:opacity-100 shrink-0"
                      title="Project options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProjectMenu(
                          activeProjectMenu === project.id ? null : project.id,
                        );
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" className="fill-current">
                        <path
                          d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                        />
                      </svg>
                    </button>
                    {activeProjectMenu === project.id && (
                      <div 
                        ref={projectMenuRef}
                        className="absolute top-10 right-4 bg-bg-secondary border border-border rounded-lg p-1 shadow-lg min-w-40 z-1000"
                      >
                        <button
                          className="w-full px-3 py-2 bg-transparent border-none text-text-primary cursor-pointer rounded text-left text-[13px] transition-colors hover:bg-hover-bg flex items-center gap-2"
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
                          className="w-full px-3 py-2 bg-transparent border-none text-[#ff6b6b] cursor-pointer rounded text-left text-[13px] transition-colors hover:bg-hover-bg flex items-center gap-2"
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
                  <p className="text-[14px] text-text-secondary m-0 mb-4 line-clamp-2 min-h-[1.5em]">{project.description || "No description"}</p>
                  <div className="flex gap-4 mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                      <div className="flex items-center gap-1">
                        <span>{project.chats ? project.chats.length : 0}</span>
                        <span>chat{project.chats?.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                          d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                        />
                      </svg>
                      <div className="flex items-center gap-1">
                        <span>{project.files ? project.files.length : 0}</span>
                        <span>file{project.files?.length !== 1 ? "s" : ""}</span>
                      </div>
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
          className="fixed inset-0 z-1000 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-125 p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6 text-text-primary m-0">Create New Project</h2>
            <form
              id="createProjectForm"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}
            >
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-text-secondary mb-2">Project Name</label>
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
                  className={`w-full bg-bg-input border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent ${formError ? "border-error" : ""}`}
                  required
                  maxLength={100}
                />
                <div className="text-error text-xs mt-1 min-h-[1.2em]" id="nameError">
                  {formError}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="projectDescription" className="block text-sm font-medium text-text-secondary mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  name="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project"
                  className="w-full bg-bg-input border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent min-h-25 resize-y"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-transparent border border-border rounded-lg text-text-primary text-sm font-medium cursor-pointer transition-colors hover:bg-hover-bg"
                  id="cancelProjectBtn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
