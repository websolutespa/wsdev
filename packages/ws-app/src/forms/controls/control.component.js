


import { getState } from '../../core';
import { mapErrors_ } from '../helpers/helpers';

export function getForm(element) {
  const state = getState(element);
  return state ? state.form : null;
  let form = null;
  let parentElement = element.parentElement;
  while (parentElement) {
    if (parentElement.form_) {
      form = parentElement.form_;
    }
    parentElement = (form ? null : parentElement.parentElement);
  }
  return form;
}

export function getControl(element, fieldName) {
  // const fieldName = getField(element);
  if (fieldName === '') {
    return;
  }
  const form = getForm(element);
  // console.log(form);
  if (!form) {
    return;
  }
  const control = form.get(fieldName);
  if (!control) {
    return;
  }
  return control;
}

export function updateControl(element, control) {
  const flags = control.flags;
  Object.keys(flags).forEach(key => {
    element.classList.toggle(key, flags[key]);
  });
  element.classList.toggle('value', hasValue(control));
  element.classList.toggle('required', control.validators.length > 0);
  const errors = mapErrors_(control.errors);
  errors.forEach(kv => {
    element.classList.toggle(`error--${kv.key}`, kv.value != null);
  });
}

function hasValue(control) {
  return control.value != null && control.value != '';
}
