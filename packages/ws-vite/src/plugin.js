import postcssFunctions from 'postcss-functions';
import { accessiblePlugin } from './plugins/accessible.js';
import { htmlPlugin } from './plugins/html.js';
import { iconsPlugin } from './plugins/icons.js';
import { imagePlugin } from './plugins/image.js';
import { liquidPlugin } from './plugins/liquid.js';
import { tailwindPlugin } from './plugins/tailwind.js';
import { themePlugin } from './plugins/theme.js';
import { twigPlugin } from './plugins/twig.js';
import { vituumPlugin } from './plugins/vituum.js';
import { input } from './utils/input.js';
import { resolvePaths } from './utils/paths.js';
import { server } from './utils/server.js';
// import { criticalPlugin } from './plugins/critical.js';
// import { dynamicPlugin } from './plugins/dynamic-import.js';
// import { purgePlugin } from './plugins/purge.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const defaultOptions = {
  base: undefined,
  paths: {
    src: './src',
    dist: './dist',
    assets: './assets',
    images: './assets/img',
    icons: './assets/icons',
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
      ...(typeof options.icons === 'boolean' ? {} : options.icons),
    } : null),
    imagePlugin(options.image ? {
      ...paths,
      ...(typeof options.image === 'boolean' ? {} : options.image),
    } : null),
    htmlPlugin(options.html),
    accessiblePlugin(options.accessible),
    // dynamicPlugin(options.dynamic),
    // purgePlugin(options.purge),
    // criticalPlugin(options.critical),
    // https://github.com/Jax-p/vite-plugin-html-purgecss
    tailwindPlugin(options.tailwind),
  ];
}

export async function wsViteConfig(userOptions = {}, viteOptions = {}) {
  // console.log('config', userOptions);
  const options = {
    ...defaultOptions,
    ...userOptions,
  };
  // options.server.origin = 'http://' + options.server.host + ':' + options.server.port + options.base;
  const paths = resolvePaths(options.paths);
  const isBuilding = viteOptions.command === 'build';
  const isDev = viteOptions.mode === 'development';
  const isPreview = viteOptions.command === 'serve' && viteOptions.mode === 'production';
  // console.log('env', viteOptions.env);
  // console.log('command', viteOptions.command, 'mode', viteOptions.mode);
  const config = {
    base: (isBuilding || isPreview) ? options.base : './',
    root: paths.src,
    // publicDir: paths.assets,
    css: {
      devSourcemap: true,
      ...(options.postcssFunctions ? {
        postcss: {
          plugins: [
            postcssFunctions(options.postcssFunctions)
          ]
        }
      } : {}),
    },
    define: {
      'import.meta.env.WS_VITE': JSON.stringify(packageJson.version),
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
            // console.log('entryFileNames', info.name, info.type);
            if (isBuilding) {
              return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
            }
            return 'js/[name].js';
          },
          chunkFileNames: (info) => {
            // console.log('chunkFileNames', info.name, info.type);
            if (isBuilding) {
              return `js/${info.name.replace(/\.twig|\.liquid/g, '')}.min.js`;
            }
            return 'js/[name].js';
          },
          assetFileNames: (info) => {
            // console.log('assetFileNames', info.name, info.type, isBuilding);
            if (info.name.indexOf('.css') !== -1) {
              return `css/[name]${isBuilding ? '.min' : ''}.[ext]`;
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
      assetsInlineLimit: 0,
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
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        console.log(filename, hostType);
        return { relative: true };
        /*
        if (hostType === 'js') {
          return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` };
        } else {
          return { relative: true };
        }
        */
      },
    },
  };
  // console.log('wsViteConfig', config);
  return config;
}

/*
"devDependencies": {
  "@mojojoejo/vite-plugin-virtual-css-variables": "^1.1.0",
  "imagemin-webp": "^8.0.0",
  "imagemin": "^8.0.1",
  "vite-plugin-imagemin": "^0.6.1",
  "vite-plugin-mjml": "https://github.com/innocenzi/vite-plugin-mjml"
}
*/

