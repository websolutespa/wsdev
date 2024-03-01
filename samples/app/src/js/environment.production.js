
export const environmentProduction = {
  flags: {
    production: true,
  },
  markets: ['IT', 'EU', 'AM', 'AS', 'IN'],
  defaultMarket: 'IT',
  currentMarket: 'IT',
  languages: ['it', 'en', 'de', 'ch'],
  defaultLanguage: 'it',
  currentLanguage: 'it',
  api: '/api',
  assets: '/Client/docs/',
  slug: {
  },
  template: {
    modal: {
      userModal: '/template/modals/user-modal.cshtml',
    },
  },
  facebook: {
    appId: 123,
    fields: 'id,name,first_name,last_name,email,gender,picture,cover,link',
    scope: 'public_profile, email', // publish_stream
    tokenClient: '',
    version: 'v11.0',
  },
  google: {
    clientId: 'xxx',
  },
  googleMaps: {
    apiKey: 'xxx',
  },
  thron: {
    clientId: '',
  },
  workers: {
    image: '/Client/docs/js/workers/image.service.worker.js',
    prefetch: '/Client/docs/js/workers/prefetch.service.worker.js',
  },
  githubDocs: 'https://raw.githubusercontent.com/actarian/davide-groppi/main/docs/',
};
