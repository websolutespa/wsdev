import Lenis from '@studio-freight/lenis';

const USE_LENIS = true;

export const lenis = () => {
  if (USE_LENIS) {
    const lenis = new Lenis({
      smoothTouch: true,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }
  return lenis;
};
