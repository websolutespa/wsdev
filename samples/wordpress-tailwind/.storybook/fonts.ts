/**
 * Loads the project's Google Fonts (see src/templates/components/layout/fonts/fonts.twig)
 * once per Storybook session, since stories render outside the WP <head> build.
 */
import main from '../src/theme/main.json';

export function injectFonts() {
  if (document.getElementById('sb-fonts')) {
    return;
  }
  const preconnectGoogleapis = document.createElement('link');
  preconnectGoogleapis.rel = 'preconnect';
  preconnectGoogleapis.href = 'https://fonts.googleapis.com';

  const preconnectGstatic = document.createElement('link');
  preconnectGstatic.rel = 'preconnect';
  preconnectGstatic.href = 'https://fonts.gstatic.com';
  preconnectGstatic.crossOrigin = 'anonymous';

  const stylesheet = document.createElement('link');
  stylesheet.id = 'sb-fonts';
  stylesheet.rel = 'stylesheet';
  // Already percent-encoded (e.g. "%2E%2E" for the variable-font ".." ranges) — see fonts.twig.
  stylesheet.href = main.fonts.googleFontsUrl;

  document.head.append(preconnectGoogleapis, preconnectGstatic, stylesheet);
}
