import { getState } from '../../core';

export function ModalComponent(node, data, unsubscribe$) {
  const state = getState(node);
  if (state) {
    console.log('ModalComponent.state', state);
  }
}

ModalComponent.meta = {
  selector: '[data-modal]',
};
