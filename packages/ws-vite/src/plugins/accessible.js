import { getIdByKey } from './helpers/server.js';

export const accessiblePlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };
  const MODULE_ID = 'virtual:accessible';
  let currentConfig;
  return {
    name: 'vite:accessible',
    enforce: 'post',
    // apply: 'serve', // try apply serve without import

    configResolved(resolved) {
      currentConfig = resolved;
    },

    resolveId(id) {
      if (id === MODULE_ID) {
        return getIdByKey(id);
      }
      return null;
    },

    async load(id, ssr) {
      // console.log(id);
      if (id === getIdByKey(MODULE_ID)) {
        /*
        base: '/',
        command: 'serve',
        mode: 'development',
        ssr: {
          format: 'esm',
          target: 'node',
          optimizeDeps: { disabled: true, esbuildOptions: [Object] }
        },
        isProduction: false,
        envDir: '/Users/lucazampetti/Desktop/GIT/wsdev/samples/twig/src',
        env: { BASE_URL: '/', MODE: 'development', DEV: true, PROD: false },
        assetsInclude??
        */
        // const isBuilding = currentConfig.command === 'build' || currentConfig.ssr;
        // const isDev = currentConfig.mode === 'development';
        if (currentConfig.mode === 'development') {
          let code = `
  if (typeof window !== 'undefined') {
    function logViolation(item) {
      console.group('%c[' + item.impact + '] ' + item.id, 'color: #c353c3');
      console.info('%c' + item.description, 'color: #e5e5e5');
      console.info('%c' + item.help, 'color: #14a8cd');
      console.info('%c' + item.helpUrl, 'color: #757575');
      console.groupCollapsed('elements');
      item.nodes.forEach(x => {
        const nodes = document.querySelectorAll(...x.target);
        console.info(nodes);
      });
      console.groupEnd();
      console.groupEnd();
    }
    function logPasses(item) {
      console.groupCollapsed('%c[passed] ' + item.id, 'color: #0dbc79');
      console.info('%c' + item.description, 'color: #e5e5e5');
      console.info('%c' + item.help, 'color: #14a8cd');
      console.info('%c' + item.helpUrl, 'color: #757575');
      console.groupCollapsed('elements');
      item.nodes.forEach(x => {
        const nodes = document.querySelectorAll(...x.target);
        console.info(nodes);
      });
      console.groupEnd();
      console.groupEnd();
    }
    function runAxe() {
      const body = document.body;
      let script = document.getElementById('axe');
      function onReady() {
        const axe = window.axe;
        if (axe) {
          axe
            .run()
            .then(results => {
              // console.log('axe', results);
              console.info(results.violations.length + ' accessibility issues found');
              results.violations.forEach(x => logViolation(x));
              results.passes.forEach(x => logPasses(x));
            });
        }
      }
      if (!script) {
        script = document.createElement('script');
        script.id = 'axe';
        script.setAttribute('src', 'https://www.unpkg.com/axe-core/axe.min.js');
        script.addEventListener('load', onReady);
        body.insertBefore(script, body.firstChild);
      } else {
        onReady();
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAxe);
    } else {
      runAxe();
    }
  }
  export default {};
  `;
          return {
            id,
            code,
          };
        } else {
          return {
            id,
            code: 'export default {};',
          };
        }
      }
    },

  };
};
