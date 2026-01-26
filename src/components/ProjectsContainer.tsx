import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/projectStore";
import { useChatStore } from "../stores/chatStore";
import { ProjectDetail } from "./ProjectDetail";
import { Dropdown } from "./common/Dropdown";
import { Plus, Folder, MoreVertical, Pencil, Trash2, MessageSquare, File } from "lucide-react";

export function ProjectsContainer() {
  const {
    projects,
    isLoadingProjects,
    loadProjects,
    createProject,
    deleteProject,
    updateProject,
    currentProject,
    setCurrentProject,
  } = useProjectStore();

  const { clearProjectChats } = useChatStore();
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
        clearProjectChats(projectId);
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
              <Plus size={16} />
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
                <Folder size={48} className="mb-4 opacity-30" />
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
                    <Dropdown
                      isOpen={activeProjectMenu === project.id}
                      onOpenChange={(open) => setActiveProjectMenu(open ? project.id : null)}
                      menuClassName="min-w-40 z-1000 p-1"
                      trigger={
                        <button
                          className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md cursor-pointer text-text-secondary opacity-0 transition-all hover:bg-hover-bg hover:text-text-primary group-hover:opacity-100 shrink-0"
                          title="Project options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      }
                    >
                      <button
                        className="w-full px-3 py-2 bg-transparent border-none text-text-primary cursor-pointer rounded text-left text-[13px] transition-colors hover:bg-hover-bg flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameProject(project);
                          setActiveProjectMenu(null);
                        }}
                      >
                        <Pencil size={14} />
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
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </Dropdown>
                  </div>
                  <p className="text-[14px] text-text-secondary m-0 mb-4 line-clamp-2 min-h-[1.5em]">{project.description || "No description"}</p>
                  <div className="flex gap-4 mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                      <MessageSquare size={14} />
                      <div className="flex items-center gap-1">
                        <span>{project.chats ? project.chats.length : 0}</span>
                        <span>chat{project.chats?.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
                      <File size={14} />
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
