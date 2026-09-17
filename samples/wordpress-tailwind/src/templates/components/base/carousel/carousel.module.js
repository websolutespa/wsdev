import EmblaCarousel from 'embla-carousel';

/**
 * Carousel: embla-carousel (vanilla core v8) mounted on the upstream
 * `carousel-content` viewport, whose first child is the flex track. Mirrors
 * the upstream React component: prev/next `disabled` follow canScrollPrev /
 * canScrollNext, and ArrowLeft/ArrowRight on the region scroll the carousel
 * (capture phase, as upstream's onKeyDownCapture).
 *
 * Integration API:
 *   in    CustomEvent 'carousel:prev' / 'carousel:next' on the component root
 *         CustomEvent 'carousel:goto' ({ detail: { index } }) on the root
 *   out   CustomEvent 'carousel:change' ({ detail: { index, count } },
 *         bubbles: true) on the root — fired on every embla `select` and once
 *         after init so listeners start in sync
 *   hooks data-orientation / data-loop / data-align on the root → embla
 *         options; [data-carousel-prev], [data-carousel-next],
 *         [data-carousel-dot][data-index]
 */
export default function CarouselModule(node) {
  const viewport = node.querySelector('[data-slot="carousel-content"]');
  if (!viewport) return () => {};

  const cleanups = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const prevButton = node.querySelector('[data-carousel-prev]');
  const nextButton = node.querySelector('[data-carousel-next]');
  const dots = Array.from(node.querySelectorAll('[data-carousel-dot]'));

  const embla = EmblaCarousel(viewport, {
    axis: node.dataset.orientation === 'vertical' ? 'y' : 'x',
    loop: node.dataset.loop === 'true',
    align: node.dataset.align || 'start',
  });

  function syncNav() {
    if (prevButton) prevButton.disabled = !embla.canScrollPrev();
    if (nextButton) nextButton.disabled = !embla.canScrollNext();
    const index = embla.selectedScrollSnap();
    dots.forEach((dot, i) => {
      dot.toggleAttribute('data-active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function onSelect() {
    syncNav();
    node.dispatchEvent(new CustomEvent('carousel:change', {
      bubbles: true,
      detail: { index: embla.selectedScrollSnap(), count: embla.scrollSnapList().length },
    }));
  }

  embla.on('select', onSelect);
  embla.on('reInit', syncNav);
  // Initial sync: listeners attached before init see the starting index too.
  onSelect();

  if (prevButton) on(prevButton, 'click', () => embla.scrollPrev());
  if (nextButton) on(nextButton, 'click', () => embla.scrollNext());
  dots.forEach((dot) => {
    on(dot, 'click', () => embla.scrollTo(Number(dot.dataset.index)));
  });

  on(node, 'keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      embla.scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      embla.scrollNext();
    }
  }, { capture: true });

  on(node, 'carousel:prev', () => embla.scrollPrev());
  on(node, 'carousel:next', () => embla.scrollNext());
  on(node, 'carousel:goto', (event) => {
    const index = Number(event.detail && event.detail.index);
    if (Number.isFinite(index)) embla.scrollTo(index);
  });

  return () => {
    embla.off('select', onSelect);
    embla.off('reInit', syncNav);
    cleanups.forEach((fn) => fn());
    embla.destroy();
  };
}
