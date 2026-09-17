import { uid } from './uid.js';

/** ValidityState flags, checked in the same precedence order the browser itself uses. */
const VALIDITY_FLAGS = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
  'customError',
];

/** "valueMissing" -> "errorValueMissing" (matches the data-error-value-missing dataset key). */
function overrideKey(flag) {
  return `error${flag.charAt(0).toUpperCase()}${flag.slice(1)}`;
}

/**
 * formValidation.js — pure, framework-agnostic helpers shared by any
 * `data-module="form.module"` form and, in principle, by other validation
 * entry points. No DOM traversal beyond a single control's own ancestry, no
 * side effects beyond the DOM writes each function's name promises.
 */

/**
 * Resolves the message to show for a control currently failing validation.
 * Uses `control.validationMessage` (the browser's localized native text)
 * unless the control carries a `data-error-<flag>` override for the specific
 * ValidityState flag that is failing (kebab-case flag, e.g.
 * `data-error-value-missing` for `validity.valueMissing`).
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} control
 * @returns {string} empty string when the control is currently valid
 */
export function getMessage(control) {
  const validity = control.validity;
  if (!validity || validity.valid) return '';
  for (const flag of VALIDITY_FLAGS) {
    if (validity[flag]) {
      return control.dataset[overrideKey(flag)] || control.validationMessage;
    }
  }
  return control.validationMessage;
}

/** Upstream FieldError classes, reused verbatim for a slot created on the fly. */
const FIELD_ERROR_CLASSES = 'text-sm font-normal text-destructive';

/**
 * Finds (or creates) the element a control's error message should be written
 * into, in priority order: an existing `[data-slot="field-error"]` inside the
 * closest `[data-slot="field"]`; else an existing `.frm_error` inside the
 * closest `.frm_form_field` (Formidable); else a `<p data-slot="field-error">`
 * created immediately after the control.
 * @param {HTMLElement} control
 * @returns {HTMLElement}
 */
export function findErrorSlot(control) {
  const field = control.closest('[data-slot="field"]');
  if (field) {
    const slot = field.querySelector('[data-slot="field-error"]');
    if (slot) return slot;
  }
  const formidableField = control.closest('.frm_form_field');
  if (formidableField) {
    const slot = formidableField.querySelector('.frm_error');
    if (slot) return slot;
  }
  const created = document.createElement('p');
  created.setAttribute('data-slot', 'field-error');
  created.setAttribute('role', 'alert');
  created.className = FIELD_ERROR_CLASSES;
  control.insertAdjacentElement('afterend', created);
  return created;
}

/**
 * Toggles a control's invalid presentation: `aria-invalid` on the control,
 * `data-invalid` on its closest field wrapper (`[data-slot="field"]` or
 * `.frm_form_field`), and the message text in its error slot (found/created
 * via findErrorSlot), wired up via `aria-describedby`. Pass `null`/falsy
 * `message` to clear everything back to the valid state.
 * @param {HTMLElement} control
 * @param {string|null} message
 */
export function setInvalid(control, message) {
  const wrapper = control.closest('[data-slot="field"], .frm_form_field');
  if (message) {
    control.setAttribute('aria-invalid', 'true');
    if (wrapper) wrapper.setAttribute('data-invalid', 'true');
    const slot = findErrorSlot(control);
    slot.id = slot.id || uid('field-error');
    slot.textContent = message;
    slot.hidden = false;
    control.setAttribute('aria-describedby', slot.id);
  } else {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    if (wrapper) wrapper.removeAttribute('data-invalid');
    const slot = findErrorSlot(control);
    slot.textContent = '';
    slot.hidden = true;
  }
}
