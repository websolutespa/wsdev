import tailwindcss from '@tailwindcss/vite';
// import tailwindcss from '@vituum/vite-plugin-tailwindcss';

export const tailwindPlugin = (userOptions) => {
  if (!userOptions) {
    return false;
  }
  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }
  const options = {
    ...userOptions,
  };
  /*
  {
    // Disable Lightning CSS optimization
    optimize: false,
  }
  {
    // Enable Lightning CSS but disable minification
    optimize: { minify: false },
  }
  */
  return tailwindcss(options);
};
