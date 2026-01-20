
import Database from '@tauri-apps/plugin-sql';
import { remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import type { 
  Chat, 
  Message, 
  Project, 
  ProjectData, 
  FileInfo, 
  Settings, 
  UserProfile
} from '../../types';

class TauriSqlService {
  private db: Database | null = null;
  private dbName = 'sqlite:vaultai.db';

  async init() {
    if (this.db) return;
    
    try {
      this.db = await Database.load(this.dbName);
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) return;

    // Projects table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        icon TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Chats table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        model TEXT,
        pinned INTEGER DEFAULT 0,
        project_id TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Messages table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER,
        model TEXT,
        generation_time REAL,
        FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
      )
    `);

    // Files table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at INTEGER NOT NULL,
        status TEXT NOT NULL,
        project_id TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Settings table (key-value store)
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  }

  // ============ Projects ============

  async getAllProjects(): Promise<Project[]> {
    await this.init();
    if (!this.db) return [];

    const projects = await this.db.select<any[]>('SELECT * FROM projects ORDER BY updated_at DESC');
    
    // For each project, we need to fetch related file IDs and chat IDs to match the Project interface
    const result: Project[] = [];
    
    for (const p of projects) {
      const fileIds = await this.db.select<{id: string}[]>('SELECT id FROM files WHERE project_id = $1', [p.id]);
      const chatIds = await this.db.select<{id: string}[]>('SELECT id FROM chats WHERE project_id = $1', [p.id]);
      
      result.push({
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        icon: p.icon,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        files: fileIds.map(f => f.id),
        chats: chatIds.map(c => c.id)
      });
    }
    
    return result;
  }

  async getProject(projectId: string): Promise<Project | null> {
    await this.init();
    if (!this.db) return null;

    const projects = await this.db.select<any[]>('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projects.length === 0) return null;

    const p = projects[0];
    const fileIds = await this.db.select<{id: string}[]>('SELECT id FROM files WHERE project_id = $1', [projectId]);
    const chatIds = await this.db.select<{id: string}[]>('SELECT id FROM chats WHERE project_id = $1', [projectId]);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      icon: p.icon,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      files: fileIds.map(f => f.id),
      chats: chatIds.map(c => c.id)
    };
  }

  async createProject(data: ProjectData): Promise<Project> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const now = Date.now();

    const project: Project = {
      id,
      name: data.name,
      description: data.description || undefined,
      color: data.color || undefined,
      icon: data.icon || undefined,
      createdAt: now,
      updatedAt: now,
      files: [],
      chats: []
    };

    await this.db.execute(
      'INSERT INTO projects (id, name, description, color, icon, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [project.id, project.name, project.description || null, project.color || null, project.icon || null, project.createdAt, project.updatedAt]
    );

    return project;
  }

  async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<Project | null> {
    await this.init();
    if (!this.db) return null;

    const current = await this.getProject(projectId);
    if (!current) return null;

    const updated = { ...current, ...updates, updatedAt: Date.now() };

    await this.db.execute(
      'UPDATE projects SET name = $1, description = $2, color = $3, icon = $4, updated_at = $5 WHERE id = $6',
      [updated.name, updated.description || null, updated.color || null, updated.icon || null, updated.updatedAt, projectId]
    );

    return updated;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    // 1. Get files linked to the project
    const files = await this.getProjectFiles(projectId);
    
    // 2. Delete physical files
    for (const f of files) {
      const dir = f.projectId ? `projects/${f.projectId}` : 'files';
      try {
        await remove(`${dir}/${f.id}`, { baseDir: BaseDirectory.AppData });
      } catch (e) { 
        console.warn(`Failed to delete physical file ${f.id}:`, e); 
      }
    }

    // 3. SQL Cleanup (Cascading)
    // Delete files records
    await this.db.execute('DELETE FROM files WHERE project_id = $1', [projectId]);
    
    // Delete chats (and their messages via foreign key cascade if supported/enabled, but let's be explicit)
    // If messages FK has ON DELETE CASCADE (which we defined), deleting chats is enough.
    await this.db.execute('DELETE FROM chats WHERE project_id = $1', [projectId]);
    
    // Delete project
    await this.db.execute('DELETE FROM projects WHERE id = $1', [projectId]);
    
    return true;
  }

  // ============ Chats ============

  async getAllChats(): Promise<Chat[]> {
    await this.init();
    if (!this.db) return [];

    const chatRecords = await this.db.select<any[]>('SELECT * FROM chats ORDER BY timestamp DESC');
    const result: Chat[] = [];

    for (const c of chatRecords) {
      const messages = await this.getMessagesForChat(c.id);
      result.push({
        id: c.id,
        title: c.title,
        timestamp: c.timestamp,
        model: c.model,
        pinned: !!c.pinned,
        projectId: c.project_id,
        messages
      });
    }

    return result;
  }

  async getChat(chatId: string): Promise<Chat | null> {
    await this.init();
    if (!this.db) return null;

    const chats = await this.db.select<any[]>('SELECT * FROM chats WHERE id = $1', [chatId]);
    if (chats.length === 0) return null;

    const c = chats[0];
    const messages = await this.getMessagesForChat(chatId);

    return {
      id: c.id,
      title: c.title,
      timestamp: c.timestamp,
      model: c.model,
      pinned: !!c.pinned,
      projectId: c.project_id,
      messages
    };
  }

  private async getMessagesForChat(chatId: string): Promise<Message[]> {
    if (!this.db) return [];
    
    const msgs = await this.db.select<any[]>('SELECT * FROM messages WHERE chat_id = $1 ORDER BY id ASC', [chatId]);
    
    return msgs.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      model: m.model,
      generationTime: m.generation_time
    }));
  }

  async saveChat(chat: Chat): Promise<Chat> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    // Upsert chat
    // SQLite doesn't have a simple UPSERT for all cases, but INSERT OR REPLACE is easy if ID is primary key
    await this.db.execute(
      `INSERT OR REPLACE INTO chats (id, title, timestamp, model, pinned, project_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [chat.id, chat.title, chat.timestamp, chat.model || null, chat.pinned ? 1 : 0, chat.projectId || null]
    );

    // Replace messages
    // 1. Delete existing messages
    await this.db.execute('DELETE FROM messages WHERE chat_id = $1', [chat.id]);

    // 2. Insert new messages
    for (const msg of chat.messages) {
      await this.db.execute(
        `INSERT INTO messages (chat_id, role, content, timestamp, model, generation_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [chat.id, msg.role, msg.content, msg.timestamp || Date.now(), msg.model || null, msg.generationTime || null]
      );
    }

    return chat;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    await this.db.execute('DELETE FROM chats WHERE id = $1', [chatId]);
    return true;
  }

  async updateChatProperty(chatId: string, property: string, value: any): Promise<Chat | null> {
    await this.init();
    if (!this.db) return null;

    // Validate property to prevent SQL injection or valid schema errors
    const validProps = ['title', 'pinned', 'projectId', 'model'];
    if (!validProps.includes(property)) {
      console.error(`Invalid property update: ${property}`);
      return null;
    }

    // Map property if needed (camelCase to snake_case for DB column)
    let dbProperty = property;
    if (property === 'projectId') dbProperty = 'project_id';

    // Prepare value
    let dbValue = value;
    if (property === 'pinned') dbValue = value ? 1 : 0;

    await this.db.execute(
      `UPDATE chats SET ${dbProperty} = $1 WHERE id = $2`,
      [dbValue, chatId]
    );

    return this.getChat(chatId);
  }

  // ============ Files ============
  
  async getFiles(): Promise<FileInfo[]> {
    await this.init();
    if (!this.db) return [];

    const files = await this.db.select<any[]>('SELECT * FROM files ORDER BY uploaded_at DESC');
    return files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id
    }));
  }

  async getProjectFiles(projectId: string): Promise<FileInfo[]> {
    await this.init();
    if (!this.db) return [];

    const files = await this.db.select<any[]>('SELECT * FROM files WHERE project_id = $1 ORDER BY uploaded_at DESC', [projectId]);
    return files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id
    }));
  }

  async getFile(fileId: string): Promise<FileInfo | null> {
    await this.init();
    if (!this.db) return null;

    const files = await this.db.select<any[]>('SELECT * FROM files WHERE id = $1', [fileId]);
    if (files.length === 0) return null;

    const f = files[0];
    return {
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id
    };
  }

  // Note: Actual file content upload is handled by Tauri command 'upload_files',
  // this service mainly tracks metadata. If we are moving everything to SQL, 
  // we assume the backend command might still handle the physical write, 
  // but we might want to store the metadata here.
  // For now, I'll provide a way to save file metadata.
  
  async addFileRecord(file: FileInfo): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.execute(
      `INSERT OR REPLACE INTO files (id, name, type, size, uploaded_at, status, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [file.id, file.name, file.type, file.size, file.uploadedAt, file.status, file.projectId || null]
    );
  }

  async deleteFile(fileId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;
    
    // 1. Get file info to know the path
    const file = await this.getFile(fileId);
    if (file) {
      const dir = file.projectId ? `projects/${file.projectId}` : 'files';
      try {
        await remove(`${dir}/${file.id}`, { baseDir: BaseDirectory.AppData });
      } catch (e) {
        console.warn(`Failed to delete physical file ${file.id}:`, e);
      }
    }

    // 2. SQL Cleanup
    await this.db.execute('DELETE FROM files WHERE id = $1', [fileId]);
    return true;
  }

  // ============ Settings & Profile ============

  async getSettings(): Promise<Settings> {
    await this.init();
    
    const defaultSettings: Settings = {
      model: { chat: 'vaultai16-code' },
      ui: { streamingEnabled: true },
      rag: { enabled: true },
      agent:{enabled: true},
      privateSearch: true
    };

    if (!this.db) return defaultSettings;

    const result = await this.db.select<{value: string}[]>('SELECT value FROM settings WHERE key = $1', ['app_settings']);
    
    if (result.length > 0) {
      try {
        return { ...defaultSettings, ...JSON.parse(result[0].value) };
      } catch (e) {
        console.error('Failed to parse settings JSON', e);
      }
    }
    
    return defaultSettings;
  }

  async saveSettings(settings: Settings): Promise<Settings> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)',
      ['app_settings', JSON.stringify(settings)]
    );

    return settings;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    await this.init();
    if (!this.db) return null;

    const result = await this.db.select<{value: string}[]>('SELECT value FROM settings WHERE key = $1', ['user_profile']);
    
    if (result.length > 0) {
      try {
        return JSON.parse(result[0].value) as UserProfile;
      } catch (e) {
        console.error('Failed to parse profile JSON', e);
      }
    }
    return null;
  }

  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute(
      'INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)',
      ['user_profile', JSON.stringify(profile)]
    );

    return profile;
  }
}

export const sqlService = new TauriSqlService();
