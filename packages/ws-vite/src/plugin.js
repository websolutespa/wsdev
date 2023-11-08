import { accessiblePlugin } from './plugins/accessible.js';
import { htmlPlugin } from './plugins/html.js';
import { iconsPlugin } from './plugins/icons.js';
import { imagePlugin } from './plugins/image.js';
import { liquidPlugin } from './plugins/liquid.js';
import { themePlugin } from './plugins/theme.js';
import { twigPlugin } from './plugins/twig.js';
import { vituumPlugin } from './plugins/vituum.js';
import { input } from './utils/input.js';
import { resolvePaths } from './utils/paths.js';
import { server } from './utils/server.js';
// import { criticalPlugin } from './plugins/critical.js';
// import { dynamicPlugin } from './plugins/dynamic-import.js';
// import { purgePlugin } from './plugins/purge.js';
// const require = createRequire(import.meta.url);

const defaultOptions = {
  paths: {
    src: './src',
    dist: './dist',
    assets: './src/assets',
    icons: './src/assets/icons',
  },
  server: {
    host: 'localhost',
    port: 8000,
  },
  appType: 'spa',
  // baseURL: 'http://localhost:8000/', // !!! ??
};

export function wsVitePlugin(userOptions) {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };
  const paths = resolvePaths(options.paths);
  return [
    vituumPlugin(options.vituum), // always
    themePlugin(options.theme),
    twigPlugin(options.twig),
    liquidPlugin(options.liquid),
    iconsPlugin(options.icons ? {
      dirs: [paths.iconsPath],
      ...options.icons,
    } : null),
    imagePlugin(options.image),
    htmlPlugin(options.html),
    accessiblePlugin(options.accessible),
    // dynamicPlugin(options.dynamic),
    // purgePlugin(options.purge),
    // criticalPlugin(options.critical),
    // https://github.com/Jax-p/vite-plugin-html-purgecss
  ];
}

export async function wsViteConfig(userOptions = {}, viteOptions = {}) {
  // console.log('config', userOptions);
  const options = {
    ...defaultOptions,
    ...userOptions,
  };
  const paths = resolvePaths(options.paths);
  const isBuilding = viteOptions.command === 'build';
  const isDev = viteOptions.mode === 'development';
  // console.log('env', viteOptions.env);
  return {
    root: paths.src,
    // publicDir: paths.assets,
    css: {
      devSourcemap: true,
    },
    plugins: [
      wsVitePlugin(options),
    ],
    server: server({ ...options.server, paths }),
    build: {
      outDir: paths.distPath,
      emptyOutDir: true,
      rollupOptions: {
        input: input({ paths }),
        // output: output(options),
        output: {
          entryFileNames: (info) => {
            if (isBuilding) {
              return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
            }
            return 'js/[name].js';
          },
          chunkFileNames: (info) => {
            if (isBuilding) {
              return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
            }
            return 'js/[name].js';
          },
          assetFileNames: (info) => {
            if (info.name.indexOf('.css') !== -1) {
              return `css/[name]${isBuilding ? '' : '.min'}.[ext]`;
            } else {
              return 'assets/[name].[ext]';
            }
          },
          sourcemap: true,
        },
      },
      minify: isBuilding ? 'terser' : 'esbuild',
      cssMinify: 'esbuild',
      sourcemap: true,
      reportCompressedSize: false,
      // manifest: true,
      // cssCodeSplit: true, // default
    },
    // build: build({ ...options.build, paths }),
    resolve: {
      alias: [
        {
          find: /~(.+)/,
          replacement: paths.nodeModulesAliasPath,
        },
        /*
        {
          find: /@\//,
          replacement: path.join(process.cwd(), './src/renderer') + '/',
        },
        */
      ],
    },
    optimizeDeps: {
      entries: [],
    },
  };
}

/*
// import meta env
{
  "MODE": "production",
  "DEV": false,
  "PROD": true,
  "SSR": false,
  "BASE_URL": "/",
  "VITE_VERCEL_URL": "wsdev-twig-dpby9zd87-actarian.vercel.app",
  "VITE_VERCEL_BRANCH_URL": "wsdev-twig-git-main-actarian.vercel.app",
  "VITE_VERCEL_ENV": "production",
  "VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN": "actarian",
  "VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME": "Luca Zampetti",
  "VITE_VERCEL_GIT_COMMIT_MESSAGE": "Update turbo.json",
  "VITE_VERCEL_GIT_COMMIT_REF": "main",
  "VITE_VERCEL_GIT_COMMIT_SHA": "a2f8f5b5d957be40bf4e93e13d820ada27180611",
  "VITE_VERCEL_GIT_PREVIOUS_SHA": "",
  "VITE_VERCEL_GIT_PROVIDER": "github",
  "VITE_VERCEL_GIT_PULL_REQUEST_ID": "",
  "VITE_VERCEL_GIT_REPO_ID": "704246552",
  "VITE_VERCEL_GIT_REPO_OWNER": "actarian",
  "VITE_VERCEL_GIT_REPO_SLUG": "wsdev",
}
*/

// JSON data
// const require = createRequire(fileURL);
// const en = require(`./${src}/data/en.json`);

/*
"devDependencies": {
  "@mojojoejo/vite-plugin-virtual-css-variables": "^1.1.0",
  "imagemin-webp": "^8.0.0",
  "imagemin": "^8.0.1",
  "vite-plugin-imagemin": "^0.6.1",
  "vite-plugin-mjml": "https://github.com/innocenzi/vite-plugin-mjml"
}
*/

