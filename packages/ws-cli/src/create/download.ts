import * as fs from 'fs';
import { GitInfo, TemplateProvider, downloadTemplate } from 'giget';
import * as path from 'path';
import { getAbsolutePath, getPackage, getPath, isTest } from '../package.js';
import { copyDirectory, fsRead, fsReadFiles, fsReadJson, fsWrite, fsWriteJson, getTemporaryFolderName, removeDirectory } from '../utils/fs.js';
import { Logger } from '../utils/logger.js';
import { ICreateOptions } from './types.js';

const inputRegex = /^(?<repo>[\w.-]+\/[\w.-]+)(?<subdir>[^#]+)?(?<ref>#[\w.-]+)?/;

export function parseGitURI(input: string): GitInfo {
  const m = input.match(inputRegex)?.groups as Record<string, string>;
  return <GitInfo>{
    repo: m.repo,
    subdir: m.subdir || '/',
    ref: m.ref ? m.ref.slice(1) : 'main',
  };
}

export const github: TemplateProvider = (input, options) => {
  const packageJson = getPackage();
  const parsed = parseGitURI(input);
  const github = 'https://github.com';
  const version = `${packageJson.name}@${packageJson.version}`; // parsed.ref;
  const provider = {
    name: parsed.repo.replace('/', '-'),
    version: version,
    subdir: parsed.subdir,
    headers: {
      authorization: options.auth ? `Bearer ${options.auth}` : '',
    },
    url: `${github}/${parsed.repo}/tree/${version}${parsed.subdir}`,
    tar: `${github}/${parsed.repo}/archive/${version}.tar.gz`,
  };
  // console.log(provider);
  // console.log(packageJson);
  // throw '';
  return provider;
};

export async function doDownload(options: ICreateOptions): Promise<unknown> {
  try {
    if (isTest()) {
      const projectPath = path.resolve(process.cwd(), '..', '..');
      const outputPath = getAbsolutePath(options.projectName);

      await copyDirectory(
        path.join(projectPath, 'samples', options.sampleType),
        path.join(outputPath, '')
      );

      await copyDirectory(
        path.join(projectPath, '.vscode'),
        path.join(outputPath, '.vscode')
      );

    } else {
      const temporaryName = getTemporaryFolderName();
      const temporaryFolder = getPath(temporaryName);
      const temporaryPath = getAbsolutePath(temporaryName);
      const outputPath = getAbsolutePath(options.projectName);

      // symlinks
      /*
      await symlinkDirectory(
        getAbsolutePath('aa'),
        getAbsolutePath('bb')
      );
      */

      /*
      console.log('temporaryName', temporaryName);
      console.log('temporaryPath', temporaryPath);
      console.log('options.projectName', options.projectName); // my-project2
      console.log('options.projectFolder', options.projectFolder); // C:\XXX\wsdev\packages\ws-cli\.ws\my-project2
      console.log('getPath(options.projectName)', getPath(options.projectName)); // .ws\my-project2
      console.log('process.cwd()', process.cwd()); // C:\XXX\wsdev\packages\ws-cli
      */

      const results = await downloadTemplate('github:websolutespa/wsdev', {
        dir: temporaryFolder,
        cwd: process.cwd(),
        auth: options.authToken || undefined,
      });

      await copyDirectory(
        path.join(temporaryPath, 'samples', options.sampleType),
        path.join(outputPath, '')
      );

      /*
      await copyDirectory(
        path.join(temporaryPath, 'samples', '@shared', 'src', 'assets'),
        path.join(outputPath, 'src', 'assets')
      );

      await copyDirectory(
        path.join(temporaryPath, 'samples', '@shared', 'src', 'css'),
        path.join(outputPath, 'src', 'css')
      );

      await copyDirectory(
        path.join(temporaryPath, 'samples', '@shared', 'src', 'js'),
        path.join(outputPath, 'src', 'js')
      );

      await copyDirectory(
        path.join(temporaryPath, 'samples', '@shared', 'src', 'public'),
        path.join(outputPath, 'src', 'public')
      );
      */

      await copyDirectory(
        path.join(temporaryPath, '.vscode'),
        path.join(outputPath, '.vscode')
      );

      await removeDirectory(temporaryPath);
      // Logger.log('results', results);
      return results;
    }
  } catch (error: any) {
    if (error.message.includes('404')) {
      Logger.error('\nError\n', `Template ${options.sampleType} ${'does not exist!'}`);
    } else {
      Logger.error('\nError\n', error.message);
    }
    if (fs.existsSync(options.projectFolder)) {
      fs.rmdirSync(options.projectFolder);
    }
    process.exit(1);
  }
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function updateRepo(options: ICreateOptions, folder?: string): Promise<void> {
  const folderName: string = folder || options.projectFolder;
  const files = await fsReadFiles(folderName);
  const packages = files.filter(x => path.basename(x) === 'package.json');
  for (const file of packages) {
    const isPackage = path.dirname(file).split(path.sep).includes('packages');
    await updatePackage(options, file, isPackage);
  }
  const sources = files.filter(x => /^\.(js|jsx|ts|tsx|mdx)$/.test(path.extname(x)));
  for (const file of sources) {
    await updateSource(options, file);
  }
  const jsons = files.filter(x => path.extname(x) === '.json' && !packages.includes(x) && !x.includes('.vscode'));
  for (const file of jsons) {
    await updateJson(options, file);
  }
}

export function updateScripts(options: ICreateOptions, data: Record<string, string>): Record<string, string> {
  const scripts: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    scripts[key] = String(value).replace(new RegExp(`@${options.sampleType}`, 'g'), `@${options.projectName}`);
  });
  return scripts;
}

export function updateDependencies(options: ICreateOptions, data: Record<string, string>, isPackage: boolean): Record<string, string> {
  const dependencies: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key.indexOf('@websolutespa') !== -1) {
      // !!! only apps dependencies should be updated to latest
      dependencies[key] = isPackage ? String(value) : 'latest';
    } else if (key.indexOf(`@${options.sampleType}`) !== -1) {
      dependencies[key.replace(`@${options.sampleType}`, `@${options.projectName}`)] = String(value);
    } else {
      dependencies[key] = String(value);
    }
  });
  return dependencies;
}

export async function updatePackage(options: ICreateOptions, pathname: string, isPackage: boolean): Promise<void> {
  try {
    const data = await fsReadJson(pathname);
    if (data.name === options.sampleType) {
      data.name = options.projectName;
    } else if (data.name.indexOf(`@${options.sampleType}`) === 0) {
      data.name = data.name.split(`@${options.sampleType}`).join(`@${options.projectName}`);
    }
    // data.workspaces = updateWorkspaces(options, data.workspaces);
    if (data.scripts) {
      data.scripts = updateScripts(options, data.scripts);
    }
    if (data.dependencies) {
      data.dependencies = updateDependencies(options, data.dependencies, isPackage);
    }
    if (data.peerDependencies) {
      data.peerDependencies = updateDependencies(options, data.peerDependencies, isPackage);
    }
    if (data.devDependencies) {
      data.devDependencies = updateDependencies(options, data.devDependencies, isPackage);
    }
    await fsWriteJson(pathname, data);
  } catch (error) {
    console.error('updatePackage', error);
  }
}

export async function updateSource(options: ICreateOptions, pathname: string): Promise<void> {
  try {
    const data = await fsRead(pathname);
    const source = String(data).replace(new RegExp(`@${options.sampleType}`, 'g'), `@${options.projectName}`);
    await fsWrite(pathname, source);
  } catch (error) {
    console.error('updateSource', error);
  }
}

export async function updateJson(options: ICreateOptions, pathname: string): Promise<void> {
  try {
    const data = await fsReadJson(pathname);
    if (typeof data.$schema === 'string') {
      data.$schema = data.$schema.indexOf('../../../node_modules/') === 0 ?
        data.$schema.replace('../../../node_modules/', '../node_modules/') :
        data.$schema.replace('../../../../node_modules/', '../../node_modules/');
    }
    await fsWriteJson(pathname, data);
  } catch (error) {
    console.error('updatePackage', error);
  }
}
