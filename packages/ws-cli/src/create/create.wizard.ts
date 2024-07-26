import { cancel, confirm, group, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';
// import { multiselect } from '@clack/prompts';
import * as process from 'process';
import { Logger } from '../utils/logger.js';

export type Cancel = typeof cancel;

export const REQUEST_AUTH_TOKEN = false;

export type CreateOptions = {
  projectName?: string;
  check: (result: CreateResult, cancel: Cancel) => Promise<void>;
  download: (result: CreateResult, cancel: Cancel) => Promise<void>;
  install: (result: CreateResult, cancel: Cancel) => Promise<void>;
};

export type CreateResult = {
  projectName: string;
  sampleType: string;
  // includedTools: string[];
  authToken?: string;
};

export async function createWizard(options: CreateOptions) {
  // Logger.log('createWizard', options);
  console.clear();

  Logger.name();

  intro('create');
  const result = await group(
    {

      projectName: () =>
        text({
          message: 'Project name',
          placeholder: '{project name}',
          initialValue: options.projectName,
          validate: (value) => {
            if (!value) {
              return 'Please enter a project name.';
            }
            return;
          },
        }),

      sampleType: ({ results }) => {
        return select({
          message: `Select a sample type for ${results.projectName}?`,
          options: [
            { value: 'twig', label: 'Twig' },
            { value: 'liquid', label: 'Liquid' },
            { value: 'wordpress', label: 'Wordpress' },
            { value: 'shopify', label: 'Shopify', hint: 'available soon', disabled: true },
            { value: 'react', label: 'React', hint: 'available soon', disabled: true },
          ],
          // https://github.com/natemoo-re/clack/issues/122
        });
      },

      /*
      includedTools: ({ results }) => {
        return multiselect({
          message: 'Select tools to be included.',
          options: [
            { value: 'bowl', label: 'Bowl', hint: 'payload headless cms' },
            { value: 'oven', label: 'Oven', hint: '.net core layer' },
            { value: 'mixer', label: 'Mixer', hint: 'node application stack' },
          ],
          initialValues: ['mixer'],
          required: true,
        });
      },
      */

      authToken: ({ results }) => {
        if (['shopify', 'react'].includes(results.sampleType as string)) {
          cancel('Not available yet.');
          process.exit(0);
        }
        if (!REQUEST_AUTH_TOKEN) {
          return Promise.resolve(null);
        }
        return text({
          message: 'Enter auth token',
          placeholder: '{auth token}',
          validate: (value) => {
            if (!value) {
              return 'Please enter your github auth token.';
            }
            return;
          },
        });
      },

    },
    {
      onCancel: ({ results }) => {
        cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  ) as CreateResult;

  result.projectName = result.projectName || 'my-project';
  result.projectName = result.projectName.toLowerCase().replace(/\s/g, '-');
  result.sampleType = result.sampleType || 'twig';
  // result.includedTools = result.includedTools || ['mixer'];

  await options.check(result, cancel);

  const s = spinner();
  if (result.authToken || !REQUEST_AUTH_TOKEN) {
    s.start('downloading repo...');
  }
  await options.download(result, cancel);
  if (result.authToken || !REQUEST_AUTH_TOKEN) {
    s.stop('Repo downloaded');
  }

  const installDependencies = await confirm({
    message: 'Do you want to install dependencies?',
    initialValue: false,
  });
  if (isCancel(installDependencies)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  if (installDependencies) {
    s.start('Installing via npm');
    await options.install(result, cancel);
    s.stop('Installed via npm');
  }

  // initialize secrets
  // do you want to initialize secrets?

  // complete
  outro('You\'re all set!');
  process.exit(0);

  /*
  outro(`You\'re all set!

  Please run
  cd ${options.name}
  npm run mixer
  `);
  */
}
