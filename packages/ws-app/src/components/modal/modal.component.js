import { getState } from '../../core';

export function ModalComponent(element, data, unsubscribe$) {
  const state = getState(element);
  if (state) {
    console.log('ModalComponent.state', state);
  }
}

ModalComponent.meta = {
  selector: '[data-modal]',
};
