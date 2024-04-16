const LAZY_MODULES = import.meta.glob('../../templates/components/**/*.module.js');
// console.log('LAZY_MODULES', Object.keys(LAZY_MODULES).join(','));

const loaders = new WeakMap();
const modules = new Map();

export function lazyLoad(targetNode = document, callback = () => { }) {
  const disposables = new Map();
  if (loaders.has(targetNode)) {
    throw ('node already registered');
  }
  const onView = (node) => {
    load(node, modules).then(dispose => {
      disposables.set(node, dispose);
      callback(dispose);
    });
  };
  const intersectionObserver = observeIntersections(targetNode, onView);
  const mutationObserver = observeMutations(targetNode, ({ addedNodes, removedNodes }) => {
    const nodes = queryNodes(addedNodes);
    nodes.forEach(node => intersectionObserver.observe(node));
  });
  const nodes = queryNodes(targetNode);
  nodes.forEach(node => intersectionObserver.observe(node));
  const dispose = () => {
    // console.log('lazy.dispose');
    intersectionObserver.disconnect();
    mutationObserver.disconnect();
    disposables.forEach(dispose => dispose());
  };
  loaders.set(targetNode, dispose);
  return dispose;
}

async function load(node, cache) {
  let dispose;
  const key = node.getAttribute('data-module');
  // console.log(key);
  if (cache.has(key)) {
    const module = cache.get(key);
    dispose = module.default(node);
    node.classList.add('init');
  } else {
    const loader = Object.entries(LAZY_MODULES).find(([k, v]) => {
      return k.indexOf(`/${key}`) !== -1;
    });
    if (loader) {
      const module = await loader[1]();
      // console.log(module);
      dispose = module.default(node);
      node.classList.add('init');
      cache.set(key, module);
    }
  }
  return dispose;
}

function observeIntersections(targetNode = document, callback = () => { }) {
  let observer;
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: targetNode.parentNode ? targetNode.parentNode : targetNode,
      rootMargin: '50px',
      threshold: [0.01, 0.99],
    };
    observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
  } else {
    observer = {
      observe: callback,
    };
  }
  return observer;
}

function observeMutations(targetNode = document, callback = () => { }) {
  const config = { attributes: false, childList: true, subtree: true };
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        if (typeof callback === 'function') {
          callback(mutation);
        }
      }
      /* else if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
      */
    }
  });
  observer.observe(targetNode, config);
  return observer;
}

function queryNodes(nodes) {
  const filteredNodes = [];
  (Array.isArray(nodes) ?
    nodes :
    (isIterable(nodes) ?
      Array.from(nodes) :
      [nodes]
    )
  ).forEach(node => {
    if (typeof node.querySelectorAll === 'function') {
      const nodes = Array.from(node.querySelectorAll('[data-module]'));
      filteredNodes.push(...nodes);
      if ('hasAttribute' in node && node.hasAttribute('data-module')) {
        filteredNodes.push(node);
      }
    }
  });
  return filteredNodes;
}

function isIterable(node) {
  return node != null && typeof node[Symbol.iterator] === 'function';
}
