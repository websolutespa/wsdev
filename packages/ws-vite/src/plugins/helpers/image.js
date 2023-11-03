import { getImageSrc, getImageSrcSet } from '../image.js';

export function getImage(breakpoint) {
  // console.log('getImage.breakpoint', breakpoint);
  return (userOptions) => {
    // move logic to image
    // console.log('getImage', userOptions);
    const options = {
      format: 'webp',
      alt: 'picture',
      loading: 'lazy',
      ...userOptions,
    };
    if (!options.src && !options.srcset) {
      options.src = 'placehold';
    }
    if (options.src && options.srcset) {
      const srcset = getImageSrcSet({ ...options, breakpoint });
      return `<img
      srcset="${srcset.srcset}"
      sizes="${srcset.sizes}"
      src="${srcset.src}"
      width="${srcset.width}"
      height="${srcset.height}"
      loading="${options.loading}"
      alt="${options.alt}"
    >`;
    } else {
      const src = getImageSrc(options);
      return `<img
      src="${src}"
      width="${options.width || 600}"
      height="${options.height || 'auto'}"
      loading="${options.loading}"
      alt="${options.alt}"
    >`;
    }
  };
}
