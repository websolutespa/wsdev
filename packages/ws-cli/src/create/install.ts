import { changeCwd, doSpawn } from '../utils/spawn.js';

const BYPASS_INSTALLATION = false;

export function doInstall(folder: string, name: string) {
  if (folder) {
    changeCwd(folder);
  }
  if (!BYPASS_INSTALLATION) {
    return doSpawn('npm install', false);
  }
  return new Promise((resolve) => setTimeout(resolve, 3000));
  // return doSpawn('npm install', false, { cwd: folder }); // --prefix "${folder}"
}

function nodeVersion() {
  return new Promise((resolve, reject) => {
    doSpawn('node -v', true).then(
      (success: string) => {
        resolve(success.replace('\n', ''));
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function npmVersion() {
  return new Promise((resolve, reject) => {
    doSpawn('npm -v', true).then(
      (success: string) => {
        resolve(success.replace('\n', ''));
      },
      (error) => {
        reject(error);
      }
    );
  });
}
