module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-websolute`
  extends: ['websolute'],
  ignorePatterns: ['node_modules', 'dist', 'bin', '*.md'],
  settings: {
    next: {
      rootDir: ['src/'],
    },
  }
};
