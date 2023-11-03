import * as fs from 'fs';
import * as process from 'process';
import { getAbsolutePath } from '../package.js';
import { Cancel, CreateResult, createWizard } from './create.wizard.js';
import { doDownload, updateRepo } from './download.js';
import { doInstall } from './install.js';
import { ICreateOptions } from './types.js';

export async function doCreate(projectName?: string) {
  // Logger.log('doCreate', projectName);

  await createWizard({
    projectName,
    check: async (result: CreateResult, cancel: Cancel) => {
      const projectFolder = getAbsolutePath(result.projectName);
      if (fs.existsSync(projectFolder)) {
        // already exists!
        // Console.error(`ERR folder ./${result.projectName} already exists!`);
        cancel(`ERR folder ./${result.projectName} already exists!`);
        process.exit(1);
      }
    },
    download: async (result: CreateResult, cancel: Cancel) => {
      const projectFolder = getAbsolutePath(result.projectName);
      const options: ICreateOptions = {
        ...result,
        projectFolder,
      } as ICreateOptions;
      await doDownload(options);
      // await doDownloadIcons(options);
      // await removeUnused(options);
      await updateRepo(options);
    },
    install: async (result: CreateResult, cancel: Cancel) => {
      const projectFolder = getAbsolutePath(result.projectName);
      await doInstall(projectFolder, result.projectName);
    },
  });

  process.exit(0);

}
