import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function ClassComponent(props) {
  const { node, data, unsubscribe$, module } = props;
  const initialKeys = [];
  Array.prototype.slice.call(node.classList).forEach((value) => {
    initialKeys.push(value);
  });
  const getValue = module.makeFunction(data.class);
  state$(node).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const value = getValue(state);
    let keys = [];
    if (typeof value === 'object') {
      for (let key in value) {
        if (value[key]) {
          keys.push(key);
        }
      }
    } else if (typeof value === 'string') {
      keys = value.split(/\s+/);
    }
    keys = keys.concat(initialKeys);
    node.setAttribute('class', keys.join(' '));
  });
}

ClassComponent.meta = {
  selector: '[data-class]',
};
