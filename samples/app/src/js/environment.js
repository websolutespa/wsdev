import { useEnvironment } from '@websolutespa/ws-app';
import { environmentProduction } from './environment.production';

export const environment = useEnvironment({
  flags: {
    production: false,
  },
  markets: ['IT', 'EU', 'AM', 'AS', 'IN'],
  defaultMarket: 'IT',
  currentMarket: 'IT',
  languages: ['it', 'en', 'de', 'ch'],
  defaultLanguage: 'it',
  currentLanguage: 'it',
  api: '/davide-groppi/api',
  assets: '/davide-groppi/',
  slug: {
  },
  template: {
    modal: {
      userModal: '/davide-groppi/partials/modals/user-modal.html',
    },
  },
  facebook: {
    appId: 610048027052371,
    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
    scope: 'public_profile, email', // publish_stream
    tokenClient: '951b013fe59b05cf471d869aae9ba6ba',
    version: 'v11.0',
  },
  google: {
    clientId: '760742757246-61qknlmthbmr54bh7ch19kjr0sftm4q3.apps.googleusercontent.com',
  },
  googleMaps: {
    apiKey: 'AIzaSyDvGw6iAoKdRv8mmaC9GeT-LWLPQtA8p60',
  },
  thron: {
    clientId: '',
  },
  workers: {
    image: './js/workers/image.service.worker.js',
    prefetch: './js/workers/prefetch.service.worker.js',
  },
  githubDocs: 'https://raw.githubusercontent.com/actarian/davide-groppi/main/docs/',
}, environmentProduction);
