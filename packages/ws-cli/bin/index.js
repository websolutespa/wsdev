#!/usr/bin/env node

// src/commands.ts
import chalk3 from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// src/check-update.ts
import chalk2 from "chalk";
import checkForUpdate from "update-check";

// src/package.ts
import * as fs from "fs";
import * as path from "path";
function getPackagePath() {
  const packagePath = new URL("../package.json", import.meta.url);
  return packagePath;
}
function getPackage() {
  const packagePath = getPackagePath();
  const packageJson2 = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  return packageJson2;
}
function isTest() {
  const cwd = process.cwd();
  const packagePath = getPackagePath();
  const packagePathname = packagePath.pathname.replace(/^\/(\w\:\/)/, (a, b) => b);
  const dirname5 = path.dirname(packagePathname);
  const equals = pathsAreEqual(cwd, dirname5);
  return equals;
}
function pathsAreEqual(path1, path22) {
  path1 = path.normalize(path.resolve(path1));
  path22 = path.normalize(path.resolve(path22));
  if (process.platform == "win32") {
    return path1.toLowerCase() === path22.toLowerCase();
  }
  return path1 === path22;
}
function getPath(...paths) {
  return path.join(isTest() ? "./.ws" : "", ...paths);
}
function getAbsolutePath(...paths) {
  return path.join(process.cwd(), getPath(...paths));
}

// src/utils/logger.ts
import chalk from "chalk";
import * as fs2 from "fs";
import gradient from "gradient-string";
var DEBUG = false;
var green = "#17F112";
var blue = "#0099F7";
var yellow = "#f7cc66";
var red = "#ed6c6c";
var mixerGradient = gradient(blue, green);
function log(...args) {
  console.log(chalk.hex(green)(...args));
}
function info(...args) {
  console.info(chalk.hex(blue)(...args));
}
function warn(...args) {
  console.warn(chalk.hex(yellow)(...args));
}
function error(...args) {
  console.error(chalk.hex(red)(...args));
}
function greenTask(name2, ...args) {
  console.log(chalk.bgHex(green).white(name2), chalk.hex(green)(...args));
}
function blueTask(taskName, ...args) {
  console.log(chalk.bgHex(blue).white(taskName), chalk.hex(blue)(...args));
}
function redTask(taskName, ...args) {
  console.log(chalk.bgHex(red).white(taskName), chalk.hex(red)(...args));
}
function name() {
  console.log(getName() + "\n");
}
function getName() {
  return chalk.bold(mixerGradient("WS cli"));
}
function debug(name2, data) {
  if (DEBUG) {
    const timeStamp = (/* @__PURE__ */ new Date()).getTime();
    name2 = name2.replace("$timeStamp", String(timeStamp));
    const pathname = getAbsolutePath(name2);
    fs2.writeFileSync(pathname, JSON.stringify(data, replaceCircularReference(), 2), { encoding: "utf8" });
  }
}
function replaceCircularReference() {
  const seen = /* @__PURE__ */ new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
var Logger = {
  log,
  info,
  warn,
  error,
  debug,
  name,
  greenTask,
  blueTask,
  redTask
  // box
};

// src/check-update.ts
var packageJson = getPackage();
var promise = checkForUpdate(packageJson).catch(() => null);
async function checkUpdate() {
  try {
    const response = await promise;
    if (response?.latest) {
      console.log();
      console.log(chalk2.gray("A new version of ") + getName() + chalk2.gray(" is available!"));
      console.log(chalk2.gray("Update by running ") + "npm i -g @websolutespa/ws-cli");
      console.log();
    }
  } catch (error2) {
  }
}

// src/create/create.ts
import * as fs5 from "fs";
import * as process3 from "process";

// src/create/create.wizard.ts
import { cancel, confirm, group, intro, isCancel, outro, select, spinner, text } from "@clack/prompts";
import * as process2 from "process";
var REQUEST_AUTH_TOKEN = false;
async function createWizard(options) {
  console.clear();
  Logger.name();
  intro("create");
  const result = await group(
    {
      projectName: () => text({
        message: "Project name",
        placeholder: "{project name}",
        initialValue: options.projectName,
        validate: (value) => {
          if (!value) {
            return "Please enter a project name.";
          }
          return;
        }
      }),
      sampleType: ({ results }) => {
        return select({
          message: `Select a sample type for ${results.projectName}?`,
          options: [
            { value: "tailwind", label: "Tailwind" },
            { value: "twig", label: "Twig" },
            { value: "liquid", label: "Liquid" },
            { value: "wordpress", label: "WordPress" },
            { value: "drupal", label: "Drupal" },
            { value: "shopify", label: "Shopify", hint: "available soon", disabled: true },
            { value: "react", label: "React", hint: "available soon", disabled: true }
          ]
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
        if (["shopify", "react"].includes(results.sampleType)) {
          cancel("Not available yet.");
          process2.exit(0);
        }
        if (!REQUEST_AUTH_TOKEN) {
          return Promise.resolve(null);
        }
        return text({
          message: "Enter auth token",
          placeholder: "{auth token}",
          validate: (value) => {
            if (!value) {
              return "Please enter your github auth token.";
            }
            return;
          }
        });
      }
    },
    {
      onCancel: ({ results }) => {
        cancel("Operation cancelled.");
        process2.exit(0);
      }
    }
  );
  result.projectName = result.projectName || "my-project";
  result.projectName = result.projectName.toLowerCase().replace(/\s/g, "-");
  result.sampleType = result.sampleType || "tailwind";
  await options.check(result, cancel);
  const s = spinner();
  if (result.authToken || !REQUEST_AUTH_TOKEN) {
    s.start("downloading repo...");
  }
  await options.download(result, cancel);
  if (result.authToken || !REQUEST_AUTH_TOKEN) {
    s.stop("Repo downloaded");
  }
  const installDependencies = await confirm({
    message: "Do you want to install dependencies?",
    initialValue: false
  });
  if (isCancel(installDependencies)) {
    cancel("Operation cancelled.");
    process2.exit(0);
  }
  if (installDependencies) {
    s.start("Installing via npm");
    await options.install(result, cancel);
    s.stop("Installed via npm");
  }
  outro("You're all set!");
  process2.exit(0);
}

// src/create/download.ts
import * as fs4 from "fs";
import { downloadTemplate } from "giget";
import * as path3 from "path";

// src/utils/fs.ts
import * as fs3 from "fs";
import * as path2 from "path";
import { v4 as uuid } from "uuid";
async function fsWrite(pathname, data, encoding = "utf8") {
  try {
    await fs3.promises.mkdir(path2.dirname(pathname), { recursive: true });
    return await fs3.promises.writeFile(pathname, data, encoding);
  } catch (error2) {
    console.log("fsWrite", error2, pathname);
    return Promise.reject(error2);
  }
}
async function fsRead(pathname, encoding = "utf8") {
  try {
    const data = await fs3.promises.readFile(pathname, encoding);
    return data || null;
  } catch (error2) {
    console.log("fsRead", error2, pathname);
    return null;
  }
}
async function fsReadJson(pathname) {
  try {
    const data = await fsRead(pathname);
    if (data) {
      return JSON.parse(String(data));
    } else {
      return null;
    }
  } catch (error2) {
    console.log("fsReadJson", error2, pathname);
    return null;
  }
}
async function fsWriteJson(pathname, data) {
  return await fsWrite(pathname, JSON.stringify(data, null, 2));
}
async function fsReadFiles(folderName) {
  try {
    const dirents = await fs3.promises.readdir(folderName, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const pathname = path2.resolve(folderName, dirent.name);
      return dirent.isDirectory() ? fsReadFiles(pathname) : pathname;
    }));
    return Array.prototype.concat(...files);
  } catch (error2) {
    console.log("fsReadFiles", error2, folderName);
    return Promise.reject(error2);
  }
}
function getTemporaryFolderName() {
  const uid = uuid();
  const folderName = `temp-${uid}`;
  return folderName;
}
async function removeDirectory(pathname) {
  return await fs3.promises.rm(pathname, { recursive: true, force: true });
}
async function copyDirectory(fromDir, toDir) {
  try {
    return fs3.promises.cp(fromDir, toDir, {
      recursive: true,
      force: true,
      filter: (source, destination) => {
        const normalizedSource = path2.normalize(source);
        const isNodeModules = normalizedSource.includes("node_modules");
        return !isNodeModules;
      }
    });
  } catch (error2) {
    console.log("copyDirectory", error2, fromDir, toDir);
    return Promise.reject(error2);
  }
}

// src/create/download.ts
async function doDownload(options) {
  try {
    if (isTest()) {
      const projectPath = path3.resolve(process.cwd(), "..", "..");
      const outputPath = getAbsolutePath(options.projectName);
      await copyDirectory(
        path3.join(projectPath, "samples", options.sampleType),
        path3.join(outputPath, "")
      );
      await copyDirectory(
        path3.join(projectPath, ".vscode"),
        path3.join(outputPath, ".vscode")
      );
    } else {
      const temporaryName = getTemporaryFolderName();
      const temporaryFolder = getPath(temporaryName);
      const temporaryPath = getAbsolutePath(temporaryName);
      const outputPath = getAbsolutePath(options.projectName);
      const results = await downloadTemplate("github:websolutespa/wsdev", {
        dir: temporaryFolder,
        cwd: process.cwd(),
        auth: options.authToken || void 0
      });
      await copyDirectory(
        path3.join(temporaryPath, "samples", options.sampleType),
        path3.join(outputPath, "")
      );
      await copyDirectory(
        path3.join(temporaryPath, ".vscode"),
        path3.join(outputPath, ".vscode")
      );
      await removeDirectory(temporaryPath);
      return results;
    }
  } catch (error2) {
    if (error2.message.includes("404")) {
      Logger.error("\nError\n", `Template ${options.sampleType} ${"does not exist!"}`);
    } else {
      Logger.error("\nError\n", error2.message);
    }
    if (fs4.existsSync(options.projectFolder)) {
      fs4.rmdirSync(options.projectFolder);
    }
    process.exit(1);
  }
  return new Promise((resolve5) => setTimeout(resolve5, 1e3));
}
async function updateRepo(options, folder) {
  const folderName = folder || options.projectFolder;
  const files = await fsReadFiles(folderName);
  const packages = files.filter((x) => path3.basename(x) === "package.json");
  for (const file of packages) {
    const isPackage = path3.dirname(file).split(path3.sep).includes("packages");
    await updatePackage(options, file, isPackage);
  }
  const sources = files.filter((x) => /^\.(js|jsx|ts|tsx|mdx)$/.test(path3.extname(x)));
  for (const file of sources) {
    await updateSource(options, file);
  }
  const jsons = files.filter((x) => path3.extname(x) === ".json" && !packages.includes(x) && !x.includes(".vscode"));
  for (const file of jsons) {
    await updateJson(options, file);
  }
}
function updateScripts(options, data) {
  const scripts = {};
  Object.entries(data).forEach(([key, value]) => {
    scripts[key] = String(value).replace(new RegExp(`@${options.sampleType}`, "g"), `@${options.projectName}`);
  });
  return scripts;
}
function updateDependencies(options, data, isPackage) {
  const dependencies = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key.indexOf("@websolutespa") !== -1) {
      dependencies[key] = isPackage ? String(value) : "latest";
    } else if (key.indexOf(`@${options.sampleType}`) !== -1) {
      dependencies[key.replace(`@${options.sampleType}`, `@${options.projectName}`)] = String(value);
    } else {
      dependencies[key] = String(value);
    }
  });
  return dependencies;
}
async function updatePackage(options, pathname, isPackage) {
  try {
    const data = await fsReadJson(pathname);
    if (data.name === options.sampleType) {
      data.name = options.projectName;
    } else if (data.name.indexOf(`@${options.sampleType}`) === 0) {
      data.name = data.name.split(`@${options.sampleType}`).join(`@${options.projectName}`);
    }
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
  } catch (error2) {
    console.error("updatePackage", error2);
  }
}
async function updateSource(options, pathname) {
  try {
    const data = await fsRead(pathname);
    const source = String(data).replace(new RegExp(`@${options.sampleType}`, "g"), `@${options.projectName}`);
    await fsWrite(pathname, source);
  } catch (error2) {
    console.error("updateSource", error2);
  }
}
async function updateJson(options, pathname) {
  try {
    const data = await fsReadJson(pathname);
    if (typeof data.$schema === "string") {
      data.$schema = data.$schema.indexOf("../../../node_modules/") === 0 ? data.$schema.replace("../../../node_modules/", "../node_modules/") : data.$schema.replace("../../../../node_modules/", "../../node_modules/");
    }
    await fsWriteJson(pathname, data);
  } catch (error2) {
    console.error("updatePackage", error2);
  }
}

// src/utils/spawn.ts
import spawn from "cross-spawn";
import { parse } from "shell-quote";
function changeCwd(folder) {
  try {
    process.chdir(folder);
  } catch (error2) {
    Logger.log("changeCwd", error2);
  }
}
function doSpawn(command, silent = false, options = {}) {
  return new Promise((resolve5, reject) => {
    const sanitizedCommand = parse(command);
    const args = sanitizedCommand;
    const name2 = args.shift();
    const child = spawn(name2, args, {
      stdio: silent ? "pipe" : "inherit",
      // stdio: [process.stdin, process.stdout, 'pipe']
      ...options
    });
    let result = "";
    if (silent) {
      child.stdout?.on("data", function(data) {
        result += data.toString();
      });
    }
    child.on("close", (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve5(result);
      }
    });
    child.on("error", (error2) => {
      reject(`Failed to spawn command ${command}`);
    });
  });
}

// src/create/install.ts
var BYPASS_INSTALLATION = false;
function doInstall(folder, name2) {
  if (folder) {
    changeCwd(folder);
  }
  if (!BYPASS_INSTALLATION) {
    return doSpawn("npm install", false);
  }
  return new Promise((resolve5) => setTimeout(resolve5, 3e3));
}

// src/create/create.ts
async function doCreate(projectName) {
  await createWizard({
    projectName,
    check: async (result, cancel2) => {
      const projectFolder = getAbsolutePath(result.projectName);
      if (fs5.existsSync(projectFolder)) {
        cancel2(`ERR folder ./${result.projectName} already exists!`);
        process3.exit(1);
      }
    },
    download: async (result, cancel2) => {
      const projectFolder = getAbsolutePath(result.projectName);
      const options = {
        ...result,
        projectFolder
      };
      await doDownload(options);
      await updateRepo(options);
    },
    install: async (result, cancel2) => {
      const projectFolder = getAbsolutePath(result.projectName);
      await doInstall(projectFolder, result.projectName);
    }
  });
  process3.exit(0);
}

// src/pack/pack.ts
import * as fs6 from "fs";
var BYPASS_WRITE = false;
function readPackage() {
  let item = null;
  try {
    const packagePath = getAbsolutePath("./package.json");
    const data = fs6.readFileSync(packagePath, "utf8");
    item = JSON.parse(data);
  } catch (error2) {
    Logger.error(error2);
  }
  return item;
}
function writePackageSync(item) {
  if (item) {
    const packagePath = getAbsolutePath("./package.json");
    try {
      if (!BYPASS_WRITE) {
        fs6.writeFileSync(packagePath, JSON.stringify(item, null, 2));
      }
      Logger.info("writed package", packagePath);
    } catch (error2) {
      Logger.error(error2);
    }
  }
}
function diffMerge(object, from, to) {
  object = { ...object };
  Object.keys(from).forEach((key) => {
    delete object[key];
    Logger.warn("removed key", key);
  });
  Object.entries(to).forEach(([key, value]) => {
    object[key] = value;
    Logger.log("added key", key, value);
  });
  return object;
}
function doPrepack() {
  let item = readPackage();
  if (item && item.prepack && item.postpack) {
    item = diffMerge(item, item.postpack, item.prepack);
    writePackageSync(item);
  }
}
function doPostpack() {
  let item = readPackage();
  if (item && item.prepack && item.postpack) {
    item = diffMerge(item, item.prepack, item.postpack);
    writePackageSync(item);
  }
}

// src/turbo/turbo.ts
import * as fs7 from "fs";
import * as path4 from "path";
async function fsFindNode(folder, app, parent) {
  try {
    let node = void 0;
    const dirents = await fs7.promises.readdir(folder, { withFileTypes: true });
    for (const dirent of dirents) {
      const pathname = path4.resolve(folder, dirent.name);
      if (dirent.isDirectory()) {
        const dirname5 = pathname.split(path4.sep).pop();
        if (!["node_modules", ".next", ".ws"].includes(dirname5)) {
          if (parent && dirname5 === "packages") {
            parent.dependencies.push(pathname);
          }
          const dirNode = {
            folder: pathname,
            parent,
            dependencies: []
          };
          const childNode = await fsFindNode(pathname, app, dirNode);
          if (childNode) {
            node = childNode;
          }
        }
      } else {
        const filename = path4.basename(pathname);
        if (filename === "package.json") {
          const json = await fsReadJson(pathname);
          if (json.name === app) {
            node = {
              app: json.name,
              folder: path4.dirname(pathname),
              parent,
              dependencies: []
            };
          }
        }
      }
    }
    return node;
  } catch (error2) {
    console.log("fsCollectPackages", error2, folder);
    return Promise.reject(error2);
  }
}
function checkRoot() {
  const root = getAbsolutePath("");
  const turboConfig = path4.join(root, "turbo.json");
  if (!fs7.existsSync(turboConfig)) {
    throw `turbo.json not found at ${turboConfig}`;
  }
  return root;
}
async function getApp(app) {
  const root = checkRoot();
  const node = await fsFindNode(root, app, {
    folder: root,
    dependencies: []
  });
  if (!node || !node.app) {
    throw `${app} not found`;
  }
  const dependencies = [];
  let parentNode = node.parent;
  while (parentNode) {
    dependencies.push(...parentNode.dependencies.map((x) => path4.join(path4.relative(root, x), "*").split(path4.sep).join("/")));
    parentNode = parentNode.parent;
  }
  return {
    app: node.app,
    folder: path4.relative(root, node.folder).split(path4.sep).join("/"),
    dependencies
  };
}
function getFilters(paths) {
  return `${paths.map((x) => `--filter=${x}`).join(" ")}`;
}
async function runTurboDev(app) {
  try {
    const appNode = await getApp(app);
    const filters = getFilters([appNode.app, ...appNode.dependencies]);
    const command = `turbo run dev --parallel ${filters} --no-daemon`;
    console.log("runTurboDev", command);
    await doSpawn(command);
  } catch (error2) {
    Logger.error(error2);
  }
}

// src/commands.ts
async function RunCommand() {
  return await yargs(hideBin(process.argv)).scriptName("ws").version(false).usage(null).command(
    "create [project]",
    "create a new project",
    (yargs2) => {
      return yargs2.options({
        project: {
          describe: "name of the project",
          type: "string",
          default: "my-project"
        }
      });
    },
    async (argv) => {
      return await doCreate(argv.project);
    }
  ).command(
    "dev <app>",
    "run turbo dev",
    (yargs2) => {
      return yargs2.options({
        app: {
          describe: "app name",
          type: "string"
        }
      });
    },
    async (argv) => {
      if (argv.app) {
        const promise2 = await runTurboDev(argv.app);
        return promise2;
      }
    }
  ).command(
    "prepack",
    "prepare package before packing",
    () => {
    },
    (argv) => {
      doPrepack();
    }
  ).command(
    "postpack",
    "restore package after packing",
    () => {
    },
    (argv) => {
      doPostpack();
    }
  ).demandCommand(1, 1, "").strictCommands(true).showHelpOnFail(false).fail(async function(message, error2, yargs2) {
    if (error2)
      throw error2;
    if (message) {
      Logger.error(message);
    } else {
      console.clear();
      Logger.name();
      Logger.error(chalk3.white(yargs2.help()));
      await checkUpdate();
    }
  }).help("h").alias("h", "help").epilog(chalk3.gray(`websolute \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()}
    `)).parse();
}

// src/index.ts
RunCommand().then((_) => {
}).catch((error2) => {
  Logger.error(error2);
  process.exit(1);
});
