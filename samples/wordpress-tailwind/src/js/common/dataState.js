/** Sets the Radix-style data-state attribute driving tw-animate-css animations. */
export function setState(node, state) {
  node.dataset.state = state;
}

/**
 * Sets data-state (default "closed"), waits for the exit animation/transition
 * to finish (or `timeout` ms, or immediately with prefers-reduced-motion),
 * then calls `done`. The primitive that lets shadcn's animate-out classes play
 * before hiding/closing a node.
 */
export function closeWithAnimation(node, done, { state = 'closed', timeout = 300 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.dataset.state = state;
    done();
    return;
  }
  let finished = false;
  let timer;
  // Hoisted function declarations (not const arrows): finish() and onEnd()
  // reference each other, so whichever is declared as a const would trip
  // no-use-before-define on the other.
  function finish() {
    if (finished) return;
    finished = true;
    node.removeEventListener('animationend', onEnd);
    node.removeEventListener('transitionend', onEnd);
    clearTimeout(timer);
    done();
  }
  function onEnd(event) {
    if (event.target === node) finish();
  }
  node.addEventListener('animationend', onEnd);
  node.addEventListener('transitionend', onEnd);
  node.dataset.state = state;
  requestAnimationFrame(() => {
    const style = getComputedStyle(node);
    const hasAnimation = style.animationName !== 'none' && parseFloat(style.animationDuration) > 0;
    const hasTransition = parseFloat(style.transitionDuration) > 0;
    if (!hasAnimation && !hasTransition) finish();
  });
  timer = setTimeout(finish, timeout);
}
