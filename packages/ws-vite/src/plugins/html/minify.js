import { minify as minifyFn } from 'html-minifier-terser';

export async function minifyHtml(html, options) {
  if (options === false) {
    return html;
  }
  if (options === true) {
    options = {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: false,
      removeScriptTypeAttributes: false,
      removeStyleLinkTypeAttributes: false,
      removeEmptyAttributes: false,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
    };
  }
  return await minifyFn(html, options);
}
