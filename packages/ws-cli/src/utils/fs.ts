import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export async function fsWrite(pathname: string, data: string, encoding = 'utf8') {
  try {
    await fs.promises.mkdir(path.dirname(pathname), { recursive: true });
    return await fs.promises.writeFile(pathname, data, encoding as any);
  } catch (error) {
    console.log('fsWrite', error, pathname);
    return Promise.reject(error);
  }
}

export async function fsRead(pathname: string, encoding = 'utf8') {
  try {
    const data = await fs.promises.readFile(pathname, encoding as any);
    return data || null;
  } catch (error) {
    console.log('fsRead', error, pathname);
    return null;
  }
}

export async function fsReadJson(pathname: string) {
  try {
    const data = await fsRead(pathname);
    if (data) {
      return JSON.parse(String(data));
    } else {
      return null;
    }
  } catch (error) {
    console.log('fsReadJson', error, pathname);
    // throw (error);
    return null;
  }
}

export async function fsWriteJson(pathname: string, data: {}) {
  return await fsWrite(pathname, JSON.stringify(data, null, 2));
}

export async function fsReadFiles(folderName: string): Promise<string[]> {
  try {
    const dirents = await fs.promises.readdir(folderName, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const pathname = path.resolve(folderName, dirent.name);
      return dirent.isDirectory() ? fsReadFiles(pathname) : pathname;
    }));
    return Array.prototype.concat(...files);
  } catch (error) {
    console.log('fsReadFiles', error, folderName);
    return Promise.reject(error);
  }
}

export async function isEmptyDir(pathname: string): Promise<boolean> {
  try {
    const directory = await fs.promises.opendir(pathname);
    const entry = await directory.read();
    await directory.close();
    return entry === null;
  } catch (error) {
    console.log('isEmptyDir', error, pathname);
    return false;
  }
}

export async function ensureDirectoryExists(pathname: string): Promise<void> {
  await fs.promises.mkdir(pathname, { recursive: true });
}

export async function exists(pathname: string): Promise<boolean> {
  try {
    await fs.promises.access(pathname);
    return true;
  } catch {
    return false;
  }
}

export function getTemporaryFolderName(): string {
  const uid = uuid();
  const folderName = `temp-${uid}`;
  return folderName;
}

export function getTemporaryFolder(pathname: string): string {
  const folderName = getTemporaryFolderName();
  const folderPath = path.join(pathname, folderName);
  return folderPath;
}

export async function ensureTemporaryFolderExists(pathname: string): Promise<string> {
  const folderName = getTemporaryFolder(pathname);
  await ensureDirectoryExists(folderName);
  return folderName;
}

export async function removeDirectory(pathname: string): Promise<void> {
  return await fs.promises.rm(pathname, { recursive: true, force: true });
}

export async function copyDirectory(fromDir: string, toDir: string): Promise<void> {
  try {
    return fs.promises.cp(fromDir, toDir, {
      recursive: true,
      force: true,
      filter: (source: string, destination: string) => {
        const normalizedSource = path.normalize(source);
        const isNodeModules = normalizedSource.includes('node_modules');
        return !isNodeModules;
      },
    });
  } catch (error) {
    console.log('copyDirectory', error, fromDir, toDir);
    return Promise.reject(error);
  }
}

export async function symlinkDirectory(fromDir: string, toDir: string): Promise<void> {
  return await fs.promises.symlink(toDir, fromDir, 'junction');
}
