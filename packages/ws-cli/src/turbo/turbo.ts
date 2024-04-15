import * as fs from 'fs';
import * as path from 'path';
import { getAbsolutePath } from '../package.js';
import { fsReadJson } from '../utils/fs.js';
import { Logger } from '../utils/logger.js';
import { doSpawn } from '../utils/spawn.js';

export type INode = {
  folder: string;
  app?: string;
  parent?: INode;
  dependencies: string[];
};

export type IAppNode = {
  app: string;
  folder: string;
  dependencies: string[];
};

export async function fsFindNode(folder: string, app: string, parent?: INode): Promise<INode | undefined> {
  // console.log('fsFindNode', folder, app);
  try {
    let node: INode | undefined = undefined;
    const dirents = await fs.promises.readdir(folder, { withFileTypes: true });
    for (const dirent of dirents) {
      const pathname = path.resolve(folder, dirent.name);
      if (dirent.isDirectory()) {
        const dirname: string = pathname.split(path.sep).pop() as string;
        if (!['node_modules', '.next', '.ws'].includes(dirname)) {
          if (parent && dirname === 'packages') {
            parent.dependencies.push(pathname);
          }
          const dirNode: INode = {
            folder: pathname,
            parent: parent,
            dependencies: [],
          };
          const childNode = await fsFindNode(pathname, app, dirNode);
          if (childNode) {
            node = childNode;
          }
        }
      } else {
        const filename = path.basename(pathname);
        if (filename === 'package.json') {
          // console.log(pathname);
          const json = await fsReadJson(pathname);
          if (json.name === app) {
            node = {
              app: json.name,
              folder: path.dirname(pathname),
              parent,
              dependencies: [],
            };
          }
        }
      }
    }
    return node;
  } catch (error) {
    console.log('fsCollectPackages', error, folder);
    return Promise.reject(error);
  }
}

export function checkRoot(): string {
  const root = getAbsolutePath('');
  const turboConfig = path.join(root, 'turbo.json');
  if (!fs.existsSync(turboConfig)) {
    throw `turbo.json not found at ${turboConfig}`;
  }
  return root;
}

export async function getApp(app: string): Promise<IAppNode> {
  const root = checkRoot();
  // console.log('root', root);
  const node = await fsFindNode(root, app, {
    folder: root,
    dependencies: [],
  });
  if (!node || !node.app) {
    throw `${app} not found`;
  }
  const dependencies = [];
  let parentNode = node.parent;
  while (parentNode) {
    dependencies.push(...parentNode.dependencies.map(x => path.join(path.relative(root, x), '*').split(path.sep).join('/')));
    parentNode = parentNode.parent;
  }
  // console.log(app, dependencies);
  return {
    app: node.app,
    folder: path.relative(root, node.folder).split(path.sep).join('/'),
    dependencies,
  };
}

export function getFilters(paths: string[]) {
  return `${paths.map(x => `--filter=${x}`).join(' ')}`;
}

export async function runTurboDev(app: string) {
  try {
    const appNode = await getApp(app);
    // console.log(appNode);
    const filters = getFilters([appNode.app, ...appNode.dependencies]);
    const command = `turbo run dev --parallel ${filters} --no-daemon`;
    console.log('runTurboDev', command);
    await doSpawn(command);
  } catch (error) {
    Logger.error(error);
  }
}

export async function runTurboTest(app: string) {
  try {
    const appNode = await getApp(app);
    // console.log(appNode);
    const filters = getFilters([appNode.app, ...appNode.dependencies]);
    const command = `turbo run test --parallel ${filters} --no-daemon`;
    console.log('runTurboTest', command);
    await doSpawn(command);
  } catch (error) {
    Logger.error(error);
  }
}

export async function runTurboBuild(app: string) {
  try {
    const appNode = await getApp(app);
    // console.log(appNode);
    const filters = getFilters([appNode.app, ...appNode.dependencies]);
    const command = `turbo run build ${filters} --no-daemon`;
    console.log('runTurboBuild', command);
    await doSpawn(command);
  } catch (error) {
    Logger.error(error);
  }
}

export async function runTurboStart(app: string) {
  try {
    const appNode = await getApp(app);
    // console.log(appNode);
    const filters = getFilters([appNode.app, ...appNode.dependencies]);
    const command = `turbo run start --parallel ${filters} --no-daemon`;
    console.log('runTurboStart', command);
    await doSpawn(command);
  } catch (error) {
    Logger.error(error);
  }
}

