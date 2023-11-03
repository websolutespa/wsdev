import * as fs from 'fs';
import * as path from 'path';

export async function fsWrite(pathname, data, encoding = 'utf8') {
  try {
    await fs.promises.mkdir(path.dirname(pathname), { recursive: true });
    return await fs.promises.writeFile(pathname, data, encoding);
  } catch (error) {
    console.log('fsWrite', error, pathname);
    return Promise.reject(error);
  }
}

export async function fsRead(pathname, encoding = 'utf8') {
  try {
    const data = await fs.promises.readFile(pathname, encoding);
    return data || null;
  } catch (error) {
    console.log('fsRead', error, pathname);
    return null;
  }
}

export async function fsReadJson(pathname) {
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

export async function fsWriteJson(pathname, data) {
  return await fsWrite(pathname, JSON.stringify(data, null, 2));
}

export async function fsReadFiles(folderName) {
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
