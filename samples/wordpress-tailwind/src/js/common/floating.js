import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom';

const ORIGIN_BY_SIDE = {
  top: 'center bottom',
  bottom: 'center top',
  left: 'right center',
  right: 'left center',
};

const STATIC_SIDE = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * Anchored positioning shared by every floating component (tooltip, popover,
 * dropdown-menu, select, ...). Wraps @floating-ui/dom (the library Radix uses)
 * and emits the attributes/vars shadcn's class strings rely on:
 *   data-side / data-align            → slide/fade animation direction
 *   --transform-origin                → zoom animations (Radix: --radix-*-transform-origin)
 *   --available-height                → max-height clamping
 *   --available-width                 → max-width clamping (panels wider than the viewport)
 *   --anchor-width / --anchor-height  → e.g. select panel min-width
 *   --viewport-width / --viewport-height → the floating panel's own size (Radix: --radix-*-viewport-width/height, navigation-menu)
 *
 * @param {Element|{getBoundingClientRect: () => DOMRect}} anchor — element or virtual anchor (context-menu)
 * @param {HTMLElement} panel
 * @returns {{ update: () => Promise<void>, destroy: () => void }}
 */
export function createFloating(anchor, panel, options = {}) {
  const {
    placement = 'bottom',
    offset: offsetValue = 4,
    flip: enableFlip = true,
    shift: shiftPadding = 8,
    arrow: arrowEl = null,
    matchWidth = false,
    strategy = 'fixed',
  } = options;

  panel.style.position = strategy;

  const middleware = [offset(offsetValue)];
  if (enableFlip) middleware.push(flip({ padding: 8 }));
  middleware.push(shift({ padding: shiftPadding }));
  middleware.push(
    size({
      padding: 8,
      apply({ availableWidth, availableHeight, rects }) {
        panel.style.setProperty('--available-height', `${Math.max(0, Math.floor(availableHeight))}px`);
        panel.style.setProperty('--available-width', `${Math.max(0, Math.floor(availableWidth))}px`);
        panel.style.setProperty('--anchor-width', `${rects.reference.width}px`);
        panel.style.setProperty('--anchor-height', `${rects.reference.height}px`);
        panel.style.setProperty('--viewport-width', `${rects.floating.width}px`);
        panel.style.setProperty('--viewport-height', `${rects.floating.height}px`);
        if (matchWidth) {
          panel.style.minWidth = `${rects.reference.width}px`;
        }
      },
    })
  );
  if (arrowEl) middleware.push(arrow({ element: arrowEl, padding: 4 }));

  const update = async () => {
    const { x, y, placement: actualPlacement, middlewareData } = await computePosition(anchor, panel, {
      placement,
      strategy,
      middleware,
    });
    Object.assign(panel.style, { left: `${x}px`, top: `${y}px` });
    const [side, align = 'center'] = actualPlacement.split('-');
    panel.dataset.side = side;
    panel.dataset.align = align;
    panel.style.setProperty('--transform-origin', ORIGIN_BY_SIDE[side]);
    if (arrowEl && middlewareData.arrow) {
      const { x: ax, y: ay } = middlewareData.arrow;
      Object.assign(arrowEl.style, {
        position: 'absolute',
        left: ax != null ? `${ax}px` : '',
        top: ay != null ? `${ay}px` : '',
        [STATIC_SIDE[side]]: `${-arrowEl.offsetWidth / 2}px`,
      });
    }
  };

  const stop = autoUpdate(
    'getBoundingClientRect' in anchor && !(anchor instanceof Element) ? panel : anchor,
    panel,
    update
  );

  return {
    update,
    destroy: () => {
      stop();
      panel.style.minWidth = '';
    },
  };
}
