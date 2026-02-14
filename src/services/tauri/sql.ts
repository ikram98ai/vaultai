import Database from "@tauri-apps/plugin-sql";
import type {
  Chat,
  Message,
  Project,
  ProjectData,
  FileInfo,
  Prompt,
  PromptCategory,
  GeneratedImage,
} from "../../types";
import { PREMADE_PROMPTS } from "../../data/premadePrompts";

class TauriSqlService {
  private db: Database | null = null;
  private dbName = "sqlite:vaultai.db";

  async init() {
    if (this.db) return;

    try {
      this.db = await Database.load(this.dbName);
      await this.createTables();
      await this.seedPrompts();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) return;

    // Projects table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        slug TEXT,
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
        sources Text,
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

    // Prompts table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT
      )
    `);

    // Generated Images table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS generated_images (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        url TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  private async seedPrompts() {
    if (!this.db) return;

    try {
      // Check if prompts table is empty
      const countResult = await this.db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM prompts",
      );
      if (countResult[0].count > 0) return;

      console.log("Seeding premade prompts...");
      for (const prompt of PREMADE_PROMPTS) {
        await this.savePrompt(prompt);
      }
      console.log(`Seeded ${PREMADE_PROMPTS.length} prompts.`);
    } catch (error) {
      console.error("Failed to seed prompts:", error);
    }
  }

  // ============ Projects ============

  async getAllProjects(): Promise<Project[]> {
    await this.init();
    if (!this.db) return [];

    const projects = await this.db.select<any[]>(
      "SELECT * FROM projects ORDER BY updated_at DESC",
    );

    // For each project, we need to fetch related file IDs and chat IDs to match the Project interface
    const result: Project[] = [];

    for (const p of projects) {
      const fileIds = await this.db.select<{ id: string }[]>(
        "SELECT id FROM files WHERE project_id = $1",
        [p.id],
      );
      const chatIds = await this.db.select<{ id: string }[]>(
        "SELECT id FROM chats WHERE project_id = $1",
        [p.id],
      );

      result.push({
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        icon: p.icon,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        files: fileIds.map((f) => f.id),
        chats: chatIds.map((c) => c.id),
      });
    }

    return result;
  }

  async getProject(projectId: string): Promise<Project | null> {
    await this.init();
    if (!this.db) return null;

    const projects = await this.db.select<any[]>(
      "SELECT * FROM projects WHERE id = $1",
      [projectId],
    );
    if (projects.length === 0) return null;

    const p = projects[0];
    const fileIds = await this.db.select<{ id: string }[]>(
      "SELECT id FROM files WHERE project_id = $1",
      [projectId],
    );
    const chatIds = await this.db.select<{ id: string }[]>(
      "SELECT id FROM chats WHERE project_id = $1",
      [projectId],
    );

    return {
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      icon: p.icon,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      files: fileIds.map((f) => f.id),
      chats: chatIds.map((c) => c.id),
    };
  }

  async createProject(data: ProjectData): Promise<Project> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    const id = crypto.randomUUID();
    const now = Date.now();
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const project: Project = {
      id,
      slug: slug || id,
      name: data.name,
      description: data.description || undefined,
      color: data.color || undefined,
      icon: data.icon || undefined,
      createdAt: now,
      updatedAt: now,
      files: [],
      chats: [],
    };

    await this.db.execute(
      "INSERT INTO projects (id, slug, name, description, color, icon, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        project.id,
        project.slug,
        project.name,
        project.description || null,
        project.color || null,
        project.icon || null,
        project.createdAt,
        project.updatedAt,
      ],
    );

    return project;
  }

  async updateProject(
    projectId: string,
    updates: Partial<ProjectData>,
  ): Promise<Project | null> {
    await this.init();
    if (!this.db) return null;

    const current = await this.getProject(projectId);
    if (!current) return null;

    const updated = { ...current, ...updates, updatedAt: Date.now() };

    // Update slug if name changed
    if (updates.name) {
      updated.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    await this.db.execute(
      "UPDATE projects SET name = $1, slug = $2, description = $3, color = $4, icon = $5, updated_at = $6 WHERE id = $7",
      [
        updated.name,
        updated.slug,
        updated.description || null,
        updated.color || null,
        updated.icon || null,
        updated.updatedAt,
        projectId,
      ],
    );

    return updated;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    // SQL Cleanup (Cascading)
    await this.db.execute("DELETE FROM projects WHERE id = $1", [projectId]);

    return true;
  }

  // ============ Chats ============

  async getAllChats(): Promise<Chat[]> {
    await this.init();
    if (!this.db) return [];

    const chatRecords = await this.db.select<any[]>(
      "SELECT * FROM chats ORDER BY timestamp DESC",
    );
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
        messages,
      });
    }

    return result;
  }

  async getProjectChats(projectId: string): Promise<Chat[]> {
    await this.init();
    if (!this.db) return [];

    const chatRecords = await this.db.select<any[]>(
      "SELECT * FROM chats WHERE project_id = $1 ORDER BY timestamp DESC",
      [projectId],
    );
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
        messages,
      });
    }

    return result;
  }

  async getChat(chatId: string): Promise<Chat | null> {
    await this.init();
    if (!this.db) return null;

    const chats = await this.db.select<any[]>(
      "SELECT * FROM chats WHERE id = $1",
      [chatId],
    );
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
      messages,
    };
  }

  private async getMessagesForChat(chatId: string): Promise<Message[]> {
    if (!this.db) return [];

    const msgs = await this.db.select<any[]>(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY id ASC",
      [chatId],
    );

    return msgs.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      model: m.model,
      generationTime: m.generation_time,
    }));
  }

  async createChat(chat: Chat): Promise<Chat> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(
      `INSERT OR REPLACE INTO chats (id, title, timestamp, model, pinned, project_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        chat.id,
        chat.title,
        chat.timestamp,
        chat.model || null,
        chat.pinned ? 1 : 0,
        chat.projectId || null,
      ],
    );

    return chat;
  }

  async addMessage(chatId: string, message: Message): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      // 1. Insert message
      await this.db.execute(
        `INSERT INTO messages (chat_id, role, content, timestamp, model, sources, generation_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          chatId,
          message.role,
          message.content,
          message.timestamp || Date.now(),
          message.model || null,
          message.sources?.toString() || null,
          message.generationTime || null,
        ],
      );

      // 2. Update chat timestamp
      await this.db.execute("UPDATE chats SET timestamp = $1 WHERE id = $2", [
        Date.now(),
        chatId,
      ]);

      return true;
    } catch (error) {
      console.error("Failed to add message:", error);
      return false;
    }
  }

  async deleteMessage(chatId: string, timestamp: number): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      await this.db.execute(
        "DELETE FROM messages WHERE chat_id = $1 AND timestamp = $2",
        [chatId, timestamp],
      );
      return true;
    } catch (error) {
      console.error("Failed to delete message:", error);
      return false;
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    await this.db.execute("DELETE FROM chats WHERE id = $1", [chatId]);
    return true;
  }

  async updateChatProperty(
    chatId: string,
    property: string,
    value: any,
  ): Promise<Chat | null> {
    await this.init();
    if (!this.db) return null;

    // Validate property to prevent SQL injection or valid schema errors
    const validProps = ["title", "pinned", "projectId", "model"];
    if (!validProps.includes(property)) {
      console.error(`Invalid property update: ${property}`);
      return null;
    }

    // Map property if needed (camelCase to snake_case for DB column)
    let dbProperty = property;
    if (property === "projectId") dbProperty = "project_id";

    // Prepare value
    let dbValue = value;
    if (property === "pinned") dbValue = value ? 1 : 0;

    await this.db.execute(`UPDATE chats SET ${dbProperty} = $1 WHERE id = $2`, [
      dbValue,
      chatId,
    ]);

    return this.getChat(chatId);
  }

  // ============ Files ============

  async getFiles(): Promise<FileInfo[]> {
    await this.init();
    if (!this.db) return [];

    const files = await this.db.select<any[]>(
      "SELECT * FROM files ORDER BY uploaded_at DESC",
    );
    return files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id,
    }));
  }

  async getProjectFiles(projectId: string): Promise<FileInfo[]> {
    await this.init();
    if (!this.db) return [];

    const files = await this.db.select<any[]>(
      "SELECT * FROM files WHERE project_id = $1 ORDER BY uploaded_at DESC",
      [projectId],
    );
    return files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id,
    }));
  }

  async isDuplicateFile(
    name: string,
    size: number,
    type: string,
    projectId?: string,
  ): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    let files;
    if (projectId) {
      files = await this.db.select<any[]>(
        "SELECT * FROM files WHERE name = $1 AND size = $2 AND type = $3 AND project_id = $4",
        [name, size, type, projectId],
      );
    } else {
      files = await this.db.select<any[]>(
        "SELECT * FROM files WHERE name = $1 AND size = $2 AND type = $3 AND project_id IS NULL",
        [name, size, type],
      );
    }
    return files.length > 0;
  }

  async getFile(fileId: string): Promise<FileInfo | null> {
    await this.init();
    if (!this.db) return null;

    const files = await this.db.select<any[]>(
      "SELECT * FROM files WHERE id = $1",
      [fileId],
    );
    if (files.length === 0) return null;

    const f = files[0];
    return {
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: f.uploaded_at,
      status: f.status,
      projectId: f.project_id,
    };
  }

  // Note: Actual file content upload is handled by Tauri command 'upload_files',
  async addFileRecord(file: FileInfo): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.execute(
      `INSERT OR REPLACE INTO files (id, name, type, size, uploaded_at, status, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        file.id,
        file.name,
        file.type,
        file.size,
        file.uploadedAt,
        file.status,
        file.projectId || null,
      ],
    );
  }

  async deleteFile(fileId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    // SQL Cleanup
    await this.db.execute("DELETE FROM files WHERE id = $1", [fileId]);
    return true;
  }

  // ============ Prompts ============

  async getAllPrompts(): Promise<Prompt[]> {
    await this.init();
    if (!this.db) return [];

    const prompts = await this.db.select<any[]>("SELECT * FROM prompts");
    return prompts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category as PromptCategory,
      icon: p.icon,
    }));
  }

  async savePrompt(prompt: Prompt): Promise<Prompt> {
    await this.init();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(
      `INSERT OR REPLACE INTO prompts (id, title, description, content, category, icon)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        prompt.id,
        prompt.title,
        prompt.description,
        prompt.content,
        prompt.category,
        prompt.icon,
      ],
    );

    return prompt;
  }

  async deletePrompt(promptId: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    await this.db.execute("DELETE FROM prompts WHERE id = $1", [promptId]);
    return true;
  }

  // ============ Generated Images ============

  async getAllGeneratedImages(): Promise<GeneratedImage[]> {
    await this.init();
    if (!this.db) return [];

    const images = await this.db.select<any[]>(
      "SELECT * FROM generated_images ORDER BY created_at DESC",
    );
    return images.map((img) => ({
      id: img.id,
      prompt: img.prompt,
      url: img.url,
      model: img.model,
      createdAt: img.created_at,
    }));
  }

  async saveGeneratedImage(image: GeneratedImage): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.execute(
      `INSERT INTO generated_images (id, prompt, url, model, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [image.id, image.prompt, image.url, image.model, image.createdAt],
    );
  }

  async deleteGeneratedImage(id: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    await this.db.execute("DELETE FROM generated_images WHERE id = $1", [id]);
    return true;
  }
}

export const sqlService = new TauriSqlService();
