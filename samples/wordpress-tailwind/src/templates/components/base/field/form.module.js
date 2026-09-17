import { getMessage, setInvalid } from '../../../../js/common/formValidation.js';

/**
 * form.module.js — generic client-side validation + submission for any
 * `<form data-module="form.module">`, agnostic of the field markup (works
 * with base/field's data-slot="field" wrapper, a raw Formidable form, or
 * plain markup — see src/js/common/formValidation.js for the shared lookup
 * rules).
 *
 * Behaviour:
 *  - sets `novalidate` at init so the browser's native bubble UI never shows;
 *    validity itself (checkValidity/validity) is unaffected and still runs.
 *  - validates one control on `focusout` (blur doesn't bubble; delegated).
 *  - validates every control on `submit`; an invalid form focuses the first
 *    invalid control and never proceeds.
 *  - a control carrying `data-honeypot` with a non-empty value is treated as
 *    a bot fill: the submission is dropped silently (no events, no request).
 *  - on a valid, non-honeypot submit: `node.dataset.submit === 'fetch'` POSTs
 *    the form via fetch (FormData body, Accept: application/json), toggling
 *    `aria-busy` + `data-state="submitting"` on the form and `disabled` on
 *    the submit button for the duration; otherwise the native submission is
 *    allowed to proceed (via `node.submit()`, since the event was already
 *    prevented to run validation first).
 *
 * Events (see PORTING.md §Integration API):
 *  - `form:invalid` (out, bubbles) — detail: { invalid: string[] } (control
 *    names) — submit attempted while one or more controls fail validation.
 *  - `form:submitted` (out, bubbles) — detail: { native: true } for a native
 *    submission, or { ok, status, data } for a fetch submission (`data` is
 *    the parsed JSON body, or null when the response wasn't JSON).
 *  - `form:error` (out, bubbles) — detail: { error } — the fetch itself
 *    rejected (network failure); does not fire for a non-2xx HTTP response
 *    (that is a "submitted", not an "error" — inspect detail.ok instead).
 */
export default function FormModule(node) {
  node.noValidate = true;

  function controls() {
    return Array.from(node.querySelectorAll('input, select, textarea')).filter((el) => el.willValidate);
  }

  function validateControl(control) {
    const valid = control.checkValidity();
    setInvalid(control, valid ? null : getMessage(control));
    return valid;
  }

  function onFocusOut(event) {
    const control = event.target;
    if (!control || !control.willValidate || !node.contains(control)) return;
    validateControl(control);
  }

  async function submitViaFetch() {
    const submitButton = node.querySelector('[type="submit"]');
    node.setAttribute('aria-busy', 'true');
    node.dataset.state = 'submitting';
    if (submitButton) submitButton.disabled = true;
    try {
      const response = await fetch(node.action || window.location.href, {
        method: node.method || 'POST',
        body: new FormData(node),
        headers: { Accept: 'application/json' },
      });
      let data = null;
      try {
        data = await response.clone().json();
      } catch {
        data = null; // non-JSON response body — data stays null, ok/status still reported
      }
      node.dispatchEvent(
        new CustomEvent('form:submitted', { bubbles: true, detail: { ok: response.ok, status: response.status, data } })
      );
    } catch (error) {
      node.dispatchEvent(new CustomEvent('form:error', { bubbles: true, detail: { error } }));
    } finally {
      node.removeAttribute('aria-busy');
      delete node.dataset.state;
      if (submitButton) submitButton.disabled = false;
    }
  }

  function onSubmit(event) {
    event.preventDefault();

    const fields = controls();
    const invalidControls = fields.filter((control) => !validateControl(control));
    if (invalidControls.length) {
      invalidControls[0].focus();
      node.dispatchEvent(
        new CustomEvent('form:invalid', { bubbles: true, detail: { invalid: invalidControls.map((c) => c.name) } })
      );
      return;
    }

    const honeypot = node.querySelector('[data-honeypot]');
    if (honeypot && honeypot.value.trim() !== '') {
      return; // silent drop — no events, no request, indistinguishable from a normal submit to a bot
    }

    if (node.dataset.submit === 'fetch') {
      submitViaFetch();
    } else {
      node.dispatchEvent(new CustomEvent('form:submitted', { bubbles: true, detail: { native: true } }));
      node.submit(); // bypasses the submit event — no risk of re-entering this handler
    }
  }

  node.addEventListener('focusout', onFocusOut);
  node.addEventListener('submit', onSubmit);

  return function dispose() {
    node.removeEventListener('focusout', onFocusOut);
    node.removeEventListener('submit', onSubmit);
  };
}
