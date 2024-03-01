


import { getState } from '../../core';
import { mapErrors_ } from '../helpers/helpers';

export function getForm(node) {
  const state = getState(node);
  return state ? state.form : null;
  let form = null;
  let parentNode = node.parentNode;
  while (parentNode) {
    if (parentNode.form_) {
      form = parentNode.form_;
    }
    parentNode = (form ? null : parentNode.parentNode);
  }
  return form;
}

export function getControl(node, fieldName) {
  // const fieldName = getField(node);
  if (fieldName === '') {
    return;
  }
  const form = getForm(node);
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

export function updateControl(node, control) {
  const flags = control.flags;
  Object.keys(flags).forEach(key => {
    node.classList.toggle(key, flags[key]);
  });
  node.classList.toggle('value', hasValue(control));
  node.classList.toggle('required', control.validators.length > 0);
  const errors = mapErrors_(control.errors);
  errors.forEach(kv => {
    node.classList.toggle(`error--${kv.key}`, kv.value != null);
  });
}

function hasValue(control) {
  return control.value != null && control.value != '';
}
