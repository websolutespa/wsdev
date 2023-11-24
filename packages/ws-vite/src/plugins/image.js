import { sanitizeUrl } from '@braintree/sanitize-url';
import cors from 'cors';
import getEtag from 'etag';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { normalizePath } from 'vite';
import { isHtml } from './html/isHtml.js';

// import Debug from 'debug';
// const debug = Debug.debug('ws-image');

const ID = '/@image:';

export const getImageSrc = ({ src = 'placehold', srcset, loading, ...img }) => {
  const options = {
    ...(img.width ? { w: img.width } : {}),
    ...(img.height ? { h: img.height } : {}),
    ...(img.format ? { f: img.format } : {}),
  };
  const searchParams = new URLSearchParams(options);
  const query = searchParams.size > 0 ? '?' + searchParams : '';
  src = `${ID}${src.replace(/\s+/g, '%20')}${query}`;
  // console.log('getImageSrc', src);
  return src;
};

export const getImageSrcSet = ({ src, srcset, breakpoint, loading, ...img }) => {
  if (srcset === true) {
    srcset = [640, 960, 1440, 1920];
  }
  const ratio = img.width && img.height ? img.width / img.height : 0;
  const widths = [...srcset];
  let srcId, width;
  srcset = widths
    .map(x => {
      const id = getImageSrc({
        src,
        width: x,
        ...(ratio ? { height: x / ratio } : {}),
        format: img.format,
      });
      srcId = id;
      width = x;
      return `${id} ${x}w`;
    }).join(', ');
  const breakpoints = Object.values(breakpoint).map(x => parseInt(x));
  const sizes = widths.map((x, i) => {
    const b = breakpoints.find(b => b > x);
    return i < widths.length - 1 ? `(max-width: ${b}px) ${x}px` : `${x}px`;
  }).join(', ');
  return {
    srcset,
    sizes,
    src: srcId,
    width,
    height: 'auto',
  };
};

function keyToSrc(key, userOptions) {
  const [src, query] = key.split('?');
  const searchParams = new URLSearchParams(query);
  const components = path.parse(src);
  const keys = ['w', 'h'];
  const values = keys.filter(k => searchParams.has(k)).map(k => searchParams.get(k));
  const format = 'webp';
  if (components.name === 'placehold') {
    components.dir = path.join('/', userOptions.images);
  }
  return path.join(components.dir, `${[components.name, ...values].join('_')}.${format}`);
}

function keyToParams(key) {
  const [src, query] = key.split('?');
  const searchParams = new URLSearchParams(query);
  const params = Object.fromEntries(searchParams);
  const components = path.parse(src);
  return {
    f: 'webp',
    ...components,
    ...params,
  };
}

export const createBasePath = (base) => {
  return (base?.replace(/\/$/, '') || '') + ID;
};

/*
export function parseURL(rawURL) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}
*/

export const imagePlugin = (userOptions) => {
  // console.log(userOptions);

  if (!userOptions) {
    return false;
  }

  if (typeof userOptions == 'boolean') {
    userOptions = {};
  }

  const options = {
    ...userOptions,
  };

  // console.log('[vite-image]', options);

  const pool = new Map();

  let currentConfig, basePath;

  return {
    name: 'vite:image',
    enforce: 'post',

    configResolved(resolved) {
      currentConfig = resolved;
      // console.log('currentConfig', currentConfig);
      basePath = createBasePath(currentConfig.base);
      // console.log('basePath', basePath);
    },

    /*
    resolveId(id) {
      if (currentConfig.command !== 'build') {
        return null;
      }

      if (id.split('?')[0].endsWith('.html')) {
        return id;
      }

      return null;
    },
    */

    async transformIndexHtml(html, { filename }) {
      if (!isHtml(filename, options.filter)) {
        return;
      }
      if (currentConfig.command !== 'build') {
        return null;
      }
      const regExp = new RegExp(`(="|='|,\\s)(${ID})(.+?)("|'|\\s)`, 'g');
      html = html.replace(
        regExp,
        (m, g1, g2, g3, g4) => {
          const key = g2 + g3;
          if (!pool.has(key)) {
            pool.set(key, null);
          }
          const src = keyToSrc(g3, userOptions);
          // console.log(src);
          return g1 + src + g4;
        }
      );
      return html;
    },

    /*
    async load(id) {
      // console.log('load', id);
    },
    */

    /*
    async generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter(key => {
          // console.log(key);
        });
      if (!files) {
        return;
      }
      // console.log(files);
    },
    */

    configureServer: ({ middlewares }) => {
      middlewares.use(cors({ origin: '*' }));
      middlewares.use(async (req, res, next) => {
        const reqUrl = sanitizeUrl(req.url);
        const url = normalizePath(reqUrl);
        if (url.startsWith(ID)) {
          let buffer = pool.get(reqUrl);
          if (!buffer) {
            // console.log('middleware', 'url', url);
            const [, src] = reqUrl.split(basePath);
            // console.log('middleware', src);
            buffer = await resolveImage({ src, root: currentConfig.root, buffer: true });
            // !!! todo handle content type
            pool.set(reqUrl, buffer);
          }
          res.setHeader('Content-Type', 'image/webp');
          res.setHeader('Cache-Control', 'no-cache');
          const content = Buffer.from(buffer, 'base64');
          res.setHeader('Etag', getEtag(content, { weak: true }));
          res.statusCode = 200;
          res.end(content);
        } else {
          next();
        }
      });
    },

    async closeBundle() {
      // console.log('closeBundle', pool);
      for (const key of pool.keys()) {
        // console.log(key);
        const [_, src] = key.split(basePath);
        // console.log('src', src);
        const output = keyToSrc(src, userOptions);
        const folder = path.dirname(output);
        const basename = path.basename(output);
        const outputFolder = path.join(currentConfig.build.outDir, folder);
        const outputFile = path.join(outputFolder, basename);
        // console.log(output, outputFolder);
        const image = await resolveImage({ src, root: currentConfig.root });
        if (!fs.existsSync(outputFolder)) {
          fs.mkdirSync(outputFolder, { recursive: true });
        }
        try {
          const info = await image.toFile(outputFile);
          console.log(`optimizing ${basename}\t\t${formatBytes(info.size)}`);
        } catch (error) {
          console.log('image.error', error);
        }
      }
    },
  };
};

async function placehold({ w, h, f, buffer }) {
  const width = w ? parseInt(w) : 600;
  const height = h ? parseInt(h) : width;
  const text = `
    <svg width="${width}" height="${height}">
      <style>
        .text {
          fill: white;
          font-family: Arial, Helvetica, system-ui, sans-serif;
          font-weight: 500;
          line-height: 1;
          font-size: ${Math.floor(width / 10)}px;
          transform: translateY(-50%);
        }
      </style>
      <!--
      <rect x="0" y="0" width="100%" height="100%" fill="red" />
      -->
      <text x="50%" y="50%" dy=".25em"
        text-anchor="middle"
        alignment-baseline="central"
        dominant-baseline="central"
        class="text"
      >
        ${width}x${height}
      </text>
    </svg>
    `;
  const textBuffer = Buffer.from(text);
  let image = sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 128, g: 128, b: 128, alpha: 0.5 },
    },
  })
    .composite([{ input: textBuffer, left: 0, top: 0 }]);
  image = format(image, f);
  if (buffer) {
    image = image.toBuffer();
  }
  return image;
}

async function resize({ w, h, f, root, buffer, ...options }) {
  const width = w ? parseInt(w) : undefined;
  const height = h ? parseInt(h) : undefined;
  let image = sharp(path.join(root, options.dir, options.base));
  if (width || height) {
    image = image.resize(width, height);
  }
  image = format(image, f);
  if (buffer) {
    image = image.toBuffer();
  }
  return image;
}

function format(image, f) {
  switch (f) {
    case 'png':
      image = image.png();
      break;
    case 'jpg':
      image = image.jpeg({ mozjpeg: true });
      break;
    default:
      image = image.webp();
  }
  return image;
}

async function resolveImage({ src, root, buffer }) {
  // console.log('image.resolveImage.src', src);
  const options = keyToParams(src);
  // console.log(options.name, options);
  if (options.base !== 'placehold' && existsSync(
    path.join(root, options.dir, options.base)
  )) {
    return await resize({
      ...options,
      root,
      buffer,
    });
  } else {
    return await placehold({
      ...options,
      buffer,
    });
  }
}

function existsSync(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/*
const fsp = require("fs/promises");

app.get("...", async (req, res) => {
  // (... read width, height, filename here...)
  try {
    const img = await fsp.readFile(`${imageDir}${filename}.jpg`);
    const thumbName = `${thumbDir}${filename}-${width}-${height}.jpg`;
    await sharp(img).resize(Number(width), Number(height)).toFile(thumbName);
    const thumb = await fsp.readFile(thumbName);
    // TODO: add correct content-type, etc. headers
    res.end(thumb);
  } catch (err) {
    // TODO: improve error handling
    console.error(err);
    res.status(400).end("Error processing file");
  }
});

async function getMetadata() {
  const metadata = await sharp("sammy.png").metadata();
  // console.log(metadata);
}
*/
