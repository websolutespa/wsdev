import Lenis from '@studio-freight/lenis';

export const lenis = () => {
  const lenis = new Lenis({
    smoothTouch: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return lenis;
};
