import { setState } from '../../../../js/common/dataState.js';

/**
 * avatar.module.js — mirrors Radix Avatar's async image status: the <img>
 * starts `hidden` and the fallback stays visible until the image actually
 * finishes loading, so a slow or broken URL never flashes a broken-image icon.
 */
export default function AvatarModule(node) {
  const image = node.querySelector('[data-slot="avatar-image"]');
  const fallback = node.querySelector('[data-slot="avatar-fallback"]');
  if (!image) return () => {};

  function reveal() {
    setState(image, 'loaded');
    image.hidden = false;
    if (fallback) fallback.hidden = true;
  }
  function fail() {
    setState(image, 'error');
    image.hidden = true;
    if (fallback) fallback.hidden = false;
  }

  // A cached image is already `complete` before the listener attaches, so it
  // would never fire another 'load' event — check synchronously too.
  if (image.complete && image.naturalWidth > 0) {
    reveal();
  } else {
    image.addEventListener('load', reveal);
    image.addEventListener('error', fail);
  }

  return function dispose() {
    image.removeEventListener('load', reveal);
    image.removeEventListener('error', fail);
  };
}
