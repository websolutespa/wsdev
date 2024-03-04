
import { takeUntil } from 'rxjs';
import { getParentState, state$, useState } from '../state/state';

export function ForComponent(props) {
  const { element, data, unsubscribe$, module, originalElement } = props;
  delete originalElement.dataset.for;
  const tokens = getEachExpressionTokens(data.for);
  const ref = document.createComment('for');
  element.before(ref);
  element.remove();
  // {key: 'index', value: 'item', iterable: 'items'}
  // console.log(tokens);
  const elements = [];
  const states = [];
  const getValue = module.makeFunction(tokens.iterable);
  state$(ref).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const items = getValue(state);
    updateItems(items);
  });

  function updateItems(items = []) {
    const isArray = Array.isArray(items);
    const array = isArray ? items : Object.keys(items);
    const total = array.length;
    const previous = elements.length;
    const end = Math.max(previous, total);
    const parentState = getParentState(ref);
    // console.log('updateItems', this.tokens, items, previous, total, array);
    for (let i = 0; i < end; i++) {
      if (i < total) {
        const key = isArray ? i : array[i];
        const value = isArray ? array[key] : items[key];
        if (i < previous) {
          // update
          const state = states[i];
          Object.assign(state, parentState);
          state[tokens.key] = key;
          state[tokens.value] = value;
        } else {
          // create
          const clonedElement = originalElement.cloneNode(true);
          const state = useState(clonedElement);
          Object.assign(state, parentState);
          state[tokens.key] = key;
          state[tokens.value] = value;
          // console.log('ForComponent.key', tokens.key, key);
          // console.log('ForComponent.value', tokens.value, value);
          ref.parentElement.insertBefore(clonedElement, ref);
          // const args = [tokens.key, key, tokens.value, value, i, total];
          // console.log(args);
          // const skipSubscription = true;
          module.observe$(clonedElement).subscribe();
          elements.push(clonedElement);
          states.push(state);
          // console.log('updateItems.create', i, state);
        }
      } else {
        // remove
        const clonedElement = elements[i];
        clonedElement.remove();
        module.unregister(clonedElement);
      }
    }
    elements.length = array.length;
    states.length = array.length;
  }
}

ForComponent.meta = {
  selector: '[data-for]',
  structure: true,
};

function getEachExpressionTokens(expression) {
  if (expression === null) {
    throw new Error('invalid each');
  }
  if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
    throw new Error('invalid each');
  }
  const expressions = expression.split(';').map(x => x.trim()).filter(x => x !== '');
  const eachExpressions = expressions[0].split(' of ').map(x => x.trim());
  let value = eachExpressions[0].replace(/\s*let\s*/, '');
  const iterable = eachExpressions[1];
  let key = 'index';
  const keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
  if (keyValueMatches) {
    key = keyValueMatches[1];
    value = keyValueMatches[2];
  }
  if (expressions.length > 1) {
    const indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
    if (indexExpressions.length === 3) {
      key = indexExpressions[1];
    }
  }
  return { key, value, iterable };
}
