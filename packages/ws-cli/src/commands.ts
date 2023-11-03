import chalk from 'chalk';
import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { checkUpdate } from './check-update.js';
import { doCreate } from './create/create.js';
import { doPostpack, doPrepack } from './pack/pack.js';
import { runTurboDev } from './turbo/turbo.js';
import { Logger } from './utils/logger.js';

export async function RunCommand() {
  return await yargs(hideBin(process.argv))
    .scriptName('ws')
    .version(false)
    // .version(packageJson.version)
    // .usage('WS cli')
    .usage(null as any)
    // create
    .command(
      'create [project]',
      'create a new project',
      (yargs: Argv) => {
        return yargs.options({
          project: {
            describe: 'name of the project',
            type: 'string',
            default: 'my-project',
          },
        });
      },
      async (argv) => {
        /*
        if (argv.verbose) {
          Logger.info('create');
        }
        */
        return await doCreate(argv.project);
      }
    )
    // dev
    .command(
      'dev <app>',
      'run turbo dev',
      (yargs: Argv) => {
        return yargs.options({
          app: {
            describe: 'app name',
            type: 'string',
          },
        });
      },
      async (argv) => {
        if (argv.app) {
          const promise = await runTurboDev(argv.app);
          return promise;
        }
      }
    )
    /*
    // test
    .command(
      'test <app>',
      'run turbo test',
      (yargs: Argv) => {
        return yargs.options({
          app: {
            describe: 'app name',
            type: 'string',
          },
        });
      },
      async (argv) => {
        if (argv.app) {
          const promise = await runTurboTest(argv.app);
          return promise;
        }
      }
    )
    // build
    .command(
      'build <app>',
      'run turbo build',
      (yargs: Argv) => {
        return yargs.options({
          app: {
            describe: 'app name',
            type: 'string',
          },
        });
      },
      async (argv) => {
        if (argv.app) {
          const promise = await runTurboBuild(argv.app);
          return promise;
        }
      }
    )
    // start
    .command(
      'start <app>',
      'run turbo start',
      (yargs: Argv) => {
        return yargs.options({
          app: {
            describe: 'app name',
            type: 'string',
          },
        });
      },
      async (argv) => {
        if (argv.app) {
          const promise = await runTurboStart(argv.app);
          return promise;
        }
      }
    )
    */
    // prepack
    .command(
      'prepack',
      'prepare package before packing',
      () => { },
      (argv) => {
        /*
        if (argv.verbose) {
          Logger.info('prepack');
        }
        */
        doPrepack();
      }
    )
    // postpack
    .command(
      'postpack',
      'restore package after packing',
      () => { },
      (argv) => {
        /*
        if (argv.verbose) {
          Logger.info('postpack');
        }
        */
        doPostpack();
      }
    )
    .demandCommand(1, 1, '')
    .strictCommands(true)
    /*
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
      })
      */
    .showHelpOnFail(false)
    .fail(async function (message, error, yargs) {
      if (error) throw error; // preserve stack
      if (message) {
        Logger.error(message);
      } else {
        // Logger.error(chalk.gray('please submit one of the following\n\n'), chalk.white(yargs.help()));
        console.clear();
        Logger.name();
        Logger.error(chalk.white(yargs.help()));
        await checkUpdate();
      }
      // process.exit(1);
    })
    .help('h')
    .alias('h', 'help')
    .epilog(chalk.gray(`websolute © ${new Date().getFullYear()}
    `))
    .parse();
}
