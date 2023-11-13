import { getImageSrc, getImageSrcSet } from '../image.js';

export function getImage(breakpoint) {
  const keys = Object.keys(breakpoint);
  const values = Object.values(breakpoint).map(x => parseInt(String(x)));
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
    if (!options.src) {
      options.src = 'placehold';
    }
    // multiple image ratio -> outputting source & default img
    if (Array.isArray(options.src)) {
      const { src, ...rest } = options;
      const sources = src.map(x => {
        const s = {
          ...rest,
          ...x,
        };
        if (!s.src) {
          s.src = 'placehold';
        }
        s.src = getImageSrc(s);
        if (s.down || s.up) {
          s.breakpoint = s.down || s.up;
        } else {
          s.breakpoint = 'xs';
          s.down = 'xs';
        }
        const i = keys.indexOf(s.breakpoint);
        const value = s.down ? (
          (i < values.length - 1) ?
            values[i + 1] - 0.2 :
            10000
        ) : values[i];
        const media = `(${s.down ? 'max-width' : 'min-width'}: ${value.toFixed(2)}px)`;
        s.media = media;
        return s;
      });
      const widest = sources.reduce((p, c) => {
        const unit = breakpoint[c.breakpoint];
        const size = parseInt(String(unit));
        if (p) {
          if (size > p.size) {
            return { size, source: c };
          }
        } else {
          return { size, source: c };
        }
      }, undefined);
      const source = widest.source;
      // console.log('source', source);
      // console.log('sources', sources);
      const outputs = sources.filter(x => x !== source).map(x => {
        return `<source
        media="${x.media}"
        srcset="${x.src}"
        width="${x.width}"
        height="${x.height}"
        />`;
      });
      return outputs.join('\n') + `<img
      src="${source.src}"
      width="${source.width}"
      height="${source.height}"
      loading="${source.loading}"
      alt="${source.alt}"
    >`;
      // srcset -> outputting img with srcset
    } else if (options.srcset) {
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
      // src -> outputting img with resize
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
    /*
    { src: '/assets/a.jpg', width: 1440 }
    { src: '/assets/a.jpg', width: 1440, height: 540 }
    { src: '/assets/a.jpg', srcset: [810, 1080, 1440] }
    { width: 1080, height: 540, srcset: [810, 1080, 1440] }
    { src: [
      { src: '', width: 768, height: 614, down: 'xs' },
      { src: '', width: 1024, height: 718, down: 'sm' },
      { src: '', width: 1440, height: 900, down: 'md' },
      { src: '', width: 1600, height: 900, down: 'lg' }
    ] }
    { src: [
      { src: '', width: 768, height: 614, down: 'xs' }, // 1.25
      { src: '', width: 1024, height: 682, down: 'sm' }, // 1.50
      { src: '', width: 1440, height: 822, down: 'md' }, // 1.75
      { src: '', width: 1600, height: 800, down: 'lg' }, // 2.00
    ] }
    <picture>
      <source media="(max-width: 767px)" srcset="xs.jpg" />
      <source media="(max-width: 1023px)" srcset="sm.jpg" />
      <source media="(max-width: 1439px)" srcset="md.jpg" />
      <img src="lg.jpg" alt="text" />
    </picture>
    <picture>
      <source media="(min-width: 1440px)" srcset="lg.jpg" />
      <source media="(min-width: 1024px)" srcset="md.jpg" />
      <source media="(min-width: 768px)" srcset="sm.jpg" />
      <img src="xs.jpg" alt="text" />
    </picture>
    */
  };
}
