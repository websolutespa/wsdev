import { BehaviorSubject } from 'rxjs';

const empty = new BehaviorSubject(null);
const states = new WeakMap();

export function state$(element) {
  let state = null;
  let parentElement = element; // .parentElement;
  while (!state && parentElement) {
    if (states.has(parentElement)) {
      state = states.get(parentElement);
      // console.log('state$', state);
    } else {
      parentElement = parentElement.parentElement;
    }
  }
  return state || empty;
}

export function getState(element) {
  const state = state$(element);
  // console.log('getState', state);
  return state ? state.getValue() : null;
}

export function upstate$(element) {
  const results = [];
  let parentElement = element;
  while (parentElement) {
    if (states.has(parentElement)) {
      results.push(states.get(parentElement));
    }
    parentElement = parentElement.parentElement;
  }
  return results;
}

export function getParentState(element) {
  const states = upstate$(element).map(x => x.getValue());
  return Object.assign({}, ...states);
  /*
  const parentState = {};
  while (states.length) {
    Object.assign(parentState, states.shift());
  }
  return parentState;
  */
}

export function useState(element, state_ = {}) {
  /*
  function onChange(key, value) {
    const className = `state-${key}`;
    if (typeof value === 'string' || typeof value === 'number') {
      element.setAttribute(className, value);
    } else {
      element.classList.toggle(className, value);
    }
  }
  Object.keys(state_).forEach(key => {
    onChange(key, state_[key]);
  });
  */
  // console.log(Array.from(element.classList));
  const change$ = new BehaviorSubject(state_);
  const handler = {
    /*
    get(state, key, proxy) {
      // console.log(state, key, proxy);
      return Reflect.get(...arguments);
    },
    */
    set(state, key, value) {
      const status = Reflect.set(...arguments);
      /*
      onChange(key, value);
      */
      change$.next({ ...state });
      // console.log(state, key, value, status);
      return status;
    },
  };
  const proxy = new Proxy(state_, handler);
  // console.log('proxy', proxy);
  if (states.has(element)) {
    throw ('only one state per element');
  } else {
    states.set(element, change$);
    // console.log('useState', change$);
  }
  return proxy;
}

export function deleteState(element) {
  if (states.has(element)) {
    states.delete(element);
  }
}

export function inspectTree() {
  const tree = [];
  function each(element, tree_) {
    if (element) {
      let branch = tree_;
      if (states.has(element)) {
        branch = [];
        tree_.push({ state: states.get(element), element, tree: each(element.firstElementChild, branch) });
      } else if (element.firstElementChild) {
        each(element.firstElementChild, branch);
      }
      if (element.nextElementSibling) {
        each(element.nextElementSibling, tree_);
      }
    }
    return tree_;
  }
  each(document.firstElementChild, tree);
  return tree;
}

export function inspectParent(element) {
  const parents = [];
  let parentElement = element;
  while (parentElement) {
    parents.push({ element: parentElement, state: states.get(parentElement) });
    parentElement = parentElement.parentElement;
  }
  return parents;
}
