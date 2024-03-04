const LAZY_MODULES = import.meta.glob('../../templates/components/**/*.module.js');
// console.log('LAZY_MODULES', Object.keys(LAZY_MODULES).join(','));

const loaders = new WeakMap();
const modules = new Map();

export function lazyLoad(targetElement = document, callback = () => { }) {
  const disposables = new Map();
  if (loaders.has(targetElement)) {
    throw ('element already registered');
  }
  const onView = (element) => {
    load(element, modules).then(dispose => {
      disposables.set(element, dispose);
      callback(dispose);
    });
  };
  const intersectionObserver = observeIntersections(targetElement, onView);
  const mutationObserver = observeMutations(targetElement, ({ addedNodes, removedNodes }) => {
    const elements = queryElements(addedNodes);
    elements.forEach(element => intersectionObserver.observe(element));
  });
  const elements = queryElements(targetElement);
  elements.forEach(element => intersectionObserver.observe(element));
  const dispose = () => {
    // console.log('lazy.dispose');
    intersectionObserver.disconnect();
    mutationObserver.disconnect();
    disposables.forEach(dispose => dispose());
  };
  loaders.set(targetElement, dispose);
  return dispose;
}

async function load(element, cache) {
  let dispose;
  const key = element.getAttribute('data-module');
  // console.log(key);
  if (cache.has(key)) {
    const module = cache.get(key);
    dispose = module.default(element);
    element.classList.add('init');
  } else {
    const loader = Object.entries(LAZY_MODULES).find(([k, v]) => {
      return k.indexOf(`/${key}`) !== -1;
    });
    if (loader) {
      const module = await loader[1]();
      // console.log(module);
      dispose = module.default(element);
      element.classList.add('init');
      cache.set(key, module);
    }
  }
  return dispose;
}

function observeIntersections(targetElement = document, callback = () => { }) {
  let observer;
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: targetElement.parentElement ? targetElement.parentElement : targetElement,
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

function observeMutations(targetElement = document, callback = () => { }) {
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
  observer.observe(targetElement, config);
  return observer;
}

function queryElements(elements) {
  const filteredElements = [];
  (Array.isArray(elements) ?
    elements :
    (isIterable(elements) ?
      Array.from(elements) :
      [elements]
    )
  ).forEach(element => {
    if (typeof element.querySelectorAll === 'function') {
      const elements = Array.from(element.querySelectorAll('[data-module]'));
      filteredElements.push(...elements);
      if ('hasAttribute' in element && element.hasAttribute('data-module')) {
        filteredElements.push(element);
      }
    }
  });
  return filteredElements;
}

function isIterable(element) {
  return element != null && typeof element[Symbol.iterator] === 'function';
}
