/**
 * OTP input ported from shadcn/ui input-otp. The upstream library renders one
 * invisible input over fake slot divs; here every slot is a real native
 * <input maxlength="1"> and this module recreates the single-field semantics:
 *
 * - per-slot input keeps only the last pattern-valid char, then advances focus
 * - multi-char input (paste anywhere / WebOTP autofill) distributes the code
 *   across the slots starting from slot 0
 * - Backspace on an empty slot clears the previous slot and focuses it
 * - ArrowLeft / ArrowRight move focus between slots
 * - data-active="true" mirrors focus (drives the upstream data-[active=true]
 *   ring classes); content is selected on focus so typing overwrites
 * - every change syncs the hidden input, dispatches 'change' on the root and
 *   CustomEvent 'input-otp:complete' (detail.value) when all slots are filled
 *
 * Allowed characters come from [data-pattern] on the root: 'digits' (default)
 * or 'alphanumeric'.
 */
export default function InputOtpModule(node) {
  const slots = Array.from(node.querySelectorAll('input[data-slot="input-otp-slot"]'));
  const hidden = node.querySelector('input[type="hidden"]');
  if (!slots.length) return () => {};

  const charRe = node.dataset.pattern === 'alphanumeric' ? /[0-9a-zA-Z]/ : /[0-9]/;
  const sanitize = (text) => Array.from(String(text)).filter((ch) => charRe.test(ch));
  const cleanups = [];

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const getValue = () => slots.map((slot) => slot.value).join('');

  const sync = () => {
    const value = getValue();
    if (hidden) hidden.value = value;
    node.dispatchEvent(new Event('change', { bubbles: true }));
    if (value.length === slots.length) {
      node.dispatchEvent(new CustomEvent('input-otp:complete', { bubbles: true, detail: { value } }));
    }
  };

  const focusSlot = (index) => {
    const slot = slots[Math.max(0, Math.min(index, slots.length - 1))];
    slot.focus();
    slot.select();
  };

  // Paste/autofill semantics mirror the upstream single-input model: the code
  // always restarts from slot 0 and leftover slots are cleared.
  const distribute = (text) => {
    const chars = sanitize(text).slice(0, slots.length);
    if (!chars.length) return;
    slots.forEach((slot, i) => {
      slot.value = chars[i] || '';
    });
    focusSlot(chars.length); // next empty slot, clamped to the last one
    sync();
  };

  slots.forEach((slot, index) => {
    on(slot, 'input', () => {
      const chars = sanitize(slot.value);
      if (chars.length > 1) {
        // WebOTP/autofill can drop the whole code into one slot despite maxlength.
        distribute(chars.join(''));
        return;
      }
      slot.value = chars.join(''); // '' when the typed char fails the pattern
      if (slot.value && index < slots.length - 1) focusSlot(index + 1);
      sync();
    });

    on(slot, 'keydown', (event) => {
      if (event.key === 'Backspace' && !slot.value && index > 0) {
        event.preventDefault();
        slots[index - 1].value = '';
        focusSlot(index - 1);
        sync();
      } else if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        focusSlot(index - 1);
      } else if (event.key === 'ArrowRight' && index < slots.length - 1) {
        event.preventDefault();
        focusSlot(index + 1);
      }
    });

    on(slot, 'focus', () => {
      slot.setAttribute('data-active', 'true');
      slot.select();
    });
    on(slot, 'blur', () => slot.setAttribute('data-active', 'false'));
  });

  // Delegated: a paste on any slot bubbles to the root.
  on(node, 'paste', (event) => {
    const text = event.clipboardData && event.clipboardData.getData('text');
    if (!text) return;
    event.preventDefault();
    distribute(text);
  });

  if (hidden) hidden.value = getValue();

  return () => cleanups.forEach((fn) => fn());
}
