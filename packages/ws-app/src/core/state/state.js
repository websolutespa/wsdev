import { BehaviorSubject } from 'rxjs';

const empty = new BehaviorSubject(null);
const states = new WeakMap();

export function state$(node) {
  let state = null;
  let parentNode = node; // .parentNode;
  while (!state && parentNode) {
    if (states.has(parentNode)) {
      state = states.get(parentNode);
      // console.log('state$', state);
    } else {
      parentNode = parentNode.parentNode;
    }
  }
  return state || empty;
}

export function getState(node) {
  const state = state$(node);
  // console.log('getState', state);
  return state ? state.getValue() : null;
}

export function upstate$(node) {
  const results = [];
  let parentNode = node;
  while (parentNode) {
    if (states.has(parentNode)) {
      results.push(states.get(parentNode));
    }
    parentNode = parentNode.parentNode;
  }
  return results;
}

export function getParentState(node) {
  const states = upstate$(node).map(x => x.getValue());
  return Object.assign({}, ...states);
  /*
  const parentState = {};
  while (states.length) {
    Object.assign(parentState, states.shift());
  }
  return parentState;
  */
}

export function useState(node, state_ = {}) {
  /*
  function onChange(key, value) {
    const className = `state-${key}`;
    if (typeof value === 'string' || typeof value === 'number') {
      node.setAttribute(className, value);
    } else {
      node.classList.toggle(className, value);
    }
  }
  Object.keys(state_).forEach(key => {
    onChange(key, state_[key]);
  });
  */
  // console.log(Array.from(node.classList));
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
  if (states.has(node)) {
    throw ('only one state per node');
  } else {
    states.set(node, change$);
    // console.log('useState', change$);
  }
  return proxy;
}

export function deleteState(node) {
  if (states.has(node)) {
    states.delete(node);
  }
}

export function inspectTree() {
  const tree = [];
  function each(node, tree_) {
    if (node) {
      let branch = tree_;
      if (states.has(node)) {
        branch = [];
        tree_.push({ state: states.get(node), node, tree: each(node.firstElementChild, branch) });
      } else if (node.firstElementChild) {
        each(node.firstElementChild, branch);
      }
      if (node.nextElementSibling) {
        each(node.nextElementSibling, tree_);
      }
    }
    return tree_;
  }
  each(document.firstElementChild, tree);
  return tree;
}

export function inspectParent(node) {
  const parents = [];
  let parentNode = node;
  while (parentNode) {
    parents.push({ node: parentNode, state: states.get(parentNode) });
    parentNode = parentNode.parentNode;
  }
  return parents;
}
