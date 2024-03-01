
import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function IfComponent(props) {
  const { node, data, unsubscribe$, module, originalNode } = props;
  delete originalNode.dataset.if;
  // const originalNode = node.cloneNode(true);
  const getValue = module.makeFunction(data.if);
  const ref = document.createComment('if');
  node.parentNode.replaceChild(ref, node);
  let flag_;
  let clonedNode;
  state$(ref).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const flag = getValue(state);
    if (flag_ !== flag) {
      flag_ = flag;
      if (flag) {
        clonedNode = originalNode.cloneNode(true);
        ref.after(clonedNode);
        module.observe$(clonedNode).subscribe();
      } else {
        if (clonedNode) {
          clonedNode.remove();
          clonedNode = null;
        }
        module.unregister(originalNode);
      }
    }
  });
}

IfComponent.meta = {
  selector: '[data-if]',
  structure: true,
};
