
import { writeFile,remove, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';


// Helper to save physical file
export async function savePhysicalFile(id: string, base64: string, projectId?: string) {
  try {
    // ensure dir
    const dir = projectId ? `projects/${projectId}` : 'files';
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

export async function deletePhysicalFile(id: string, projectId?: string) {
  try {
    const dir = projectId ? `projects/${projectId}` : 'files';
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