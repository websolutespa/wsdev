#!/usr/bin/env node
import { RunCommand } from './commands.js';
import { Logger } from './utils/logger.js';

RunCommand()
  .then((_) => {
    // Logger.log('exit');
    // process.exit(0);
  })
  .catch((error) => {
    Logger.error(error);
    process.exit(1);
  });
