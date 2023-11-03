
export const server = (config) => {
  if (config.server === false) {
    return false;
  }
  const server = {
    host: 'localhost',
    open: true,
    port: 8000,
    ...config.server,
  };
  // console.log('[vite-server]', server);
  return server;
};
