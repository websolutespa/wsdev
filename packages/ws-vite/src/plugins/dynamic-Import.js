import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import ts from 'typescript';

/**
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
const copyRecursiveSync = async (src, dest) => {
  dest = dest.replace('.ts', '.js');
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    try {
      fs.copyFileSync(src, dest);
      const file = fs.readFileSync(src, 'utf8');
      const convert = await ts.transpileModule(file, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
        },
      });
      const compiled = await minify(convert.outputText);
      fs.writeFileSync(dest, compiled.code, 'utf8');
      console.log(`📦 Module ${chalk.green(path.basename(src))} successfully converted and copied to ${chalk.yellow(path.dirname(dest))}`);
    } catch (error) {
      console.error(error);
    }
  }
};

export const dynamicPlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };
  let currentConfig;
  return {
    name: 'vite:dynamic',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
    },

    async closeBundle() {
      copyRecursiveSync(
        `${options.src}/assets/js/modules`,
        `${options.dist}/assets/modules`
      );
    },
  };
};
