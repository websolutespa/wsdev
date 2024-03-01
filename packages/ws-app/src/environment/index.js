import { merge } from '../common/helper/helper';

export const NODE = (typeof module !== 'undefined' && module.exports);
export const PARAMS = NODE ? { get: () => { } } : new URLSearchParams(window.location.search);
export const DEBUG = false || (PARAMS.get('debug') != null);
export const BASE_HREF = NODE ? null : document.querySelector('base').getAttribute('href');
export const HEROKU = NODE ? false : (window && window.location.host.indexOf('herokuapp') !== -1);
export const STATIC = NODE ? false : (HEROKU || (window && (window.location.port === '48481' || window.location.port === '5000' || window.location.port === '6443' || window.location.host === 'actarian.github.io')));
export const DEVELOPMENT = NODE ? false : (window && ['localhost', '127.0.0.1', '0.0.0.0'].indexOf(window.location.host.split(':')[0]) !== -1);
export const PRODUCTION = !DEVELOPMENT;
export const ENV = {
  STATIC,
  DEVELOPMENT,
  PRODUCTION,
};

export class Environment {

  get STATIC() {
    return ENV.STATIC;
  }
  set STATIC(STATIC) {
    ENV.STATIC = (STATIC === true || STATIC === 'true');
    console.log('Environment.STATIC.set', ENV.STATIC);
  }

  get href() {
    if (HEROKU) {
      return this.githubDocs;
    } else {
      return BASE_HREF;
    }
  }

  getAbsoluteUrl(path, params) {
    let url = `${window.location.origin}${path}`;
    // let url = `${window.location.protocol}//${window.location.host}${path}`;
    Object.keys(params).forEach(key => {
      url = url.replace(`$${key}`, params[key]);
    });
    return url;
  }

  getPath(path) {
    return this.isLocal(path) ? (this.href + path) : path;
  }

  isLocal(path) {
    return path.indexOf('://') === -1;
  }

  constructor(options) {
    if (options) {
      Object.assign(this, options);
    }
  }
}


export function useEnvironment(development, production) {
  const environmentOptions = window.STATIC ? development : production;
  const defaultOptions = {
    port: 5000,
    flags: {
      production: false,
      heroku: HEROKU,
    },
    slug: {},
    markets: ['IT', 'EU', 'AM', 'AS', 'IN'],
    defaultMarket: 'IT',
    currentMarket: 'IT',
    languages: ['it', 'en'],
    defaultLanguage: 'it',
    currentLanguage: 'it',
    labels: {
      select: 'Seleziona',
      browse: 'Sfoglia',
      cancel: 'Annulla',
      error_email: 'Email non valida',
      error_match: 'I campi non corrispondono',
      error_required: 'Campo obbligatorio',
      loading: 'caricamento',
      remove: 'Rimuovi',
      required: 'Richiesto',
      select_file: 'Seleziona una file...',
      update: 'Aggiorna',
      upload: 'Carica',
      drag_and_drop_images: 'Drag And Drop your images here',
    },
  };
  let options = Object.assign(defaultOptions, environmentOptions);
  options = merge(options, window.environment);
  const environment = new Environment(options);
  return environment;
}
