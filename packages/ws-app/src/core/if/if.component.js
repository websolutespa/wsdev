
import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function IfComponent(props) {
  const { element, data, unsubscribe$, module, originalElement } = props;
  delete originalElement.dataset.if;
  // const originalElement = element.cloneNode(true);
  const getValue = module.makeFunction(data.if);
  const ref = document.createComment('if');
  element.parentElement.replaceChild(ref, element);
  let flag_;
  let clonedElement;
  state$(ref).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const flag = getValue(state);
    if (flag_ !== flag) {
      flag_ = flag;
      if (flag) {
        clonedElement = originalElement.cloneNode(true);
        ref.after(clonedElement);
        module.observe$(clonedElement).subscribe();
      } else {
        if (clonedElement) {
          clonedElement.remove();
          clonedElement = null;
        }
        module.unregister(originalElement);
      }
    }
  });
}

IfComponent.meta = {
  selector: '[data-if]',
  structure: true,
};
