use crate::app_state::AppState;
use crate::types;
use tauri::State;

// ============ Project Commands ============

#[tauri::command]
pub fn get_all_projects(state: State<AppState>) -> Vec<types::Project> {
    state.projects.lock().unwrap().clone()
}

#[tauri::command]
pub fn get_project(state: State<AppState>, project_id: String) -> Option<types::Project> {
    state
        .projects
        .lock()
        .unwrap()
        .iter()
        .find(|p| p.id == project_id)
        .cloned()
}

#[tauri::command]
pub fn create_project(state: State<AppState>, project_data: types::ProjectData) -> types::Project {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let project = types::Project {
        id: format!("project_{}", now),
        name: project_data.name,
        description: project_data.description,
        color: project_data.color,
        icon: project_data.icon,
        files: Vec::new(),
        chats: Vec::new(),
        created_at: now,
        updated_at: now,
    };

    state.projects.lock().unwrap().push(project.clone());
    project
}

#[tauri::command]
pub fn update_project(
    state: State<AppState>,
    project_id: String,
    updates: types::ProjectData,
) -> Option<types::Project> {
    let mut projects = state.projects.lock().unwrap();

    if let Some(project) = projects.iter_mut().find(|p| p.id == project_id) {
        project.name = updates.name;
        if updates.description.is_some() {
            project.description = updates.description;
        }
        if updates.color.is_some() {
            project.color = updates.color;
        }
        if updates.icon.is_some() {
            project.icon = updates.icon;
        }
        project.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;

        return Some(project.clone());
    }

    None
}

#[tauri::command]
pub fn delete_project(state: State<AppState>, project_id: String) -> bool {
    let mut projects = state.projects.lock().unwrap();
    let initial_len = projects.len();
    projects.retain(|p| p.id != project_id);
    projects.len() < initial_len
}

#[tauri::command]
pub fn get_project_files(state: State<AppState>, project_id: String) -> Vec<types::FileInfo> {
    state
        .files
        .lock()
        .unwrap()
        .iter()
        .filter(|f| f.project_id.as_ref() == Some(&project_id))
        .cloned()
        .collect()
}

#[tauri::command]
pub fn upload_project_files(
    state: State<AppState>,
    project_id: String,
    mut files: Vec<types::FileInfo>,
) -> types::UploadResult {
    // Set project_id on all files
    for file in &mut files {
        file.project_id = Some(project_id.clone());
    }

    let mut stored_files = state.files.lock().unwrap();
    stored_files.extend(files.clone());

    types::UploadResult {
        success: true,
        files: Some(files),
        error: None,
    }
}
