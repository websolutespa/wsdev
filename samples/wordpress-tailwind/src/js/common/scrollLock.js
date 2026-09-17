/**
 * Ref-counted body scroll lock with scrollbar-gutter compensation.
 * Needed by the dialog family: native showModal() does NOT lock body scroll.
 */
let count = 0;
let prevOverflow = '';
let prevPaddingRight = '';

export function lockScroll() {
  if (++count > 1) return;
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  prevOverflow = document.body.style.overflow;
  prevPaddingRight = document.body.style.paddingRight;
  document.body.style.overflow = 'hidden';
  if (gutter > 0) {
    document.body.style.paddingRight = `${gutter}px`;
  }
}

export function unlockScroll() {
  if (count === 0 || --count > 0) return;
  document.body.style.overflow = prevOverflow;
  document.body.style.paddingRight = prevPaddingRight;
}
