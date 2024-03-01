
import { merge, takeUntil, tap } from 'rxjs';
import { useState } from '../../core';
import { EventService } from '../../core/event/event.service';
// import './modal-outlet.component.scss';
import { ModalService } from './modal.service';

export function ModalOutletComponent(node, data, unsubscribe$, module) {
  let modal_;
  let busy_;
  let lastModal_ = null;
  node.innerHTML = /* html */ `
	<div class="modal-outlet__container">
		<div class="modal-outlet__background" data-event="close"></div>
		<div class="modal-outlet__modal"></div>
		<div class="spinner spinner--contrasted"></div>
	</div>
	`;
  const state = useState(node);

  const modalNode = node.querySelector('.modal-outlet__modal');
  const containerNode = node.querySelector('.modal-outlet__container');

  module.register(containerNode);

  listeners$().pipe(
    takeUntil(unsubscribe$)
  ).subscribe();

  function listeners$() {
    return merge(modal$(), busy$(), event$());
  }

  function modal$() {
    return ModalService.modal$.pipe(
      tap(modal => {
        // console.log('ModalOutletComponent set modal', modal);
        const previousModal = modal_;
        if (previousModal && previousModal.node) {
          module.unregister(previousModal.node);
        }
        modal_ = modal;
        if (modal && modal.node) {
          const lastModal = lastModal_;
          if (lastModal) {
            modalNode.removeChild(lastModal.node);
          }
          modalNode.appendChild(modal.node);
          state.modal = modal;
          // !!! todo immediate registration
          module.observe$(modal.node).subscribe();
          lastModal_ = modal;
          updateClassList();
        } else {
          updateClassList();
        }
      })
    );
  }

  function busy$() {
    return ModalService.busy$.pipe(
      tap(busy => {
        if (busy_ !== busy) {
          busy_ = busy;
          updateClassList();
        }
      })
    );
  }

  function event$() {
    // return EventService.bubble$(this.node).pipe(
    // filter(event => event.type === 'close'),
    return EventService.bubble$(node, 'close').pipe(
      // return EventService.filter$(node, 'close').pipe(
      tap(_ => {
        console.log('ModalOutletComponent.event$.close');
        ModalService.reject();
      })
    );
  }

  function getClassList() {
    const classList = {
      'modal-outlet__container': true,
      busy: busy_ === true,
      active: modal_ != null,
    };
    const lastModal = lastModal_;
    if (lastModal) {
      classList[lastModal.modal.type] = true;
      classList[lastModal.modal.position] = true;
    }
    return Object.keys(classList).filter(key => classList[key] === true).join(' ');
  }

  function updateClassList() {
    const classList = getClassList();
    containerNode.setAttribute('class', classList);
  }
}

ModalOutletComponent.meta = {
  selector: '[data-modal-outlet]',
};
