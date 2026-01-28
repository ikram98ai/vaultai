
import { writeFile, remove, BaseDirectory, exists, mkdir, readFile } from '@tauri-apps/plugin-fs';


// Helper to save physical file
export async function savePhysicalFile(id: string, base64: string, projectId?: string) {
  try {
    // ensure dir
    const dir = projectId ? `knowledgebase/project-${projectId}` : 'knowledgebase';
    const dirExists = await exists(dir, { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir(dir, { baseDir: BaseDirectory.AppData, recursive: true });
    }
    
    // decode base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    await writeFile(`${dir}/${id}`, bytes, { baseDir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Failed to save physical file:', error);
    throw error;
  }
}

// Helper to save generated image file
export async function saveGeneratedImageFile(id: string, base64: string) {
  try {
    const dir = 'generated_images';
    const dirExists = await exists(dir, { baseDir: BaseDirectory.AppData });
    if (!dirExists) {
      await mkdir(dir, { baseDir: BaseDirectory.AppData, recursive: true });
    }

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    await writeFile(`${dir}/${id}.png`, bytes, { baseDir: BaseDirectory.AppData });
    return `${dir}/${id}.png`;
  } catch (error) {
    console.error('Failed to save generated image file:', error);
    throw error;
  }
}

export async function getGeneratedImageAsDataUrl(id: string): Promise<string> {
  try {
    const filePath = `generated_images/${id}.png`;
    const content = await readFile(filePath, { baseDir: BaseDirectory.AppData });
    const base64 = btoa(String.fromCharCode(...new Uint8Array(content)));
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Failed to read generated image file:', error);
    return '';
  }
}

export async function deleteGeneratedImageFile(id: string) {
  try {
    const filePath = `generated_images/${id}.png`;
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });
    if (fileExists) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }
  } catch (error) {
    console.error('Failed to delete generated image file:', error);
    throw error;
  }
}

export async function deletePhysicalFile(id: string, projectId?: string) {
  try {
    const dir = projectId ? `knowledgebase/project-${projectId}` : 'knowledgebase';
    const filePath = `${dir}/${id}`;
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });
    if (fileExists) {
      await remove(filePath, { baseDir: BaseDirectory.AppData });

    }
  } catch (error) {
    console.error('Failed to delete physical file:', error);
    throw error;
  }
}

export async function deleteProjectDirectory(projectId: string) {
  try {
    const dir = `knowledgebase/project-${projectId}`;
    const dirExists = await exists(dir, { baseDir: BaseDirectory.AppData });
    if (dirExists) {
      await remove(dir, { baseDir: BaseDirectory.AppData, recursive: true });
    }
  } catch (error) {
    console.error('Failed to delete project directory:', error);
    throw error;
  }
}