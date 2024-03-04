// import { Subject, finalize, map, takeUntil } from 'rxjs';
// import { deleteState, state$ } from '../state/state';
import { Subject, finalize, takeUntil } from 'rxjs';
import { deleteState } from '../state/state';

// const modules = new WeakMap();

/*
type Props = {
  element: element,
  data: element's data- attributes,
  unsubscribe$: unsubscribe$,
  module: Module,
  originalElement: originalElement,
}
*/

// Props & { factories: Meta[] };
function Factory({ factories, ...props }) {
  const { element, data, unsubscribe$, module, originalElement } = props;
  return Promise.all(factories.map(factory => {
    return module.resolveFactory(factory).then(factory => {
      if (typeof factory === 'function') {
        if (factory.length > 0) {
          // collect matched selector value if attribute
          /*
          const getValue = props.module.makeFunction(props.data.attr);
          props.state$ = state$(props.element).pipe(
            map(state => getValue(state)),
            takeUntil(props.unsubscribe$)
          );
          */
          factory(props);
          // const subscription = props.state$.subscribe();
          // factory(element, element.dataset, unsubscribe$, originalElement);
          return unsubscribe$;
        } else {
          // typeof factory === 'function' && factory.prototype?.constructor
          const instance = new factory.prototype.constructor(props);
          return instance;
        }
      } else if (typeof factory === 'object') {
        const submodule = useModule(factory);
        submodule.observe$(element).pipe(
          takeUntil(unsubscribe$),
          finalize(_ => submodule.unregister(element))
        ).subscribe();
      }
    });
  }));
}

class Module {

  constructor(metas) {
    this.factories = metas.factories || [];
    this.pipes = metas.pipes || {};
    this.dynamics = metas.dynamics || {};
    this.store = {
      factories: new Map(),
      observers: new WeakMap(),
      instances: new WeakMap(),
    };
  }

  resolveFactory(factory) {
    const store = this.store;
    return new Promise((resolve, reject) => {
      if (Array.isArray(factory)) {
        const name = factory[1];
        if (store.factories.has(name)) {
          resolve(store.factories.get(name));
        } else {
          const src = factory[0];
          const key = Object.keys(this.dynamics).find(key => key.indexOf(src) !== -1);
          if (key) {
            const loader = this.dynamics[key];
            loader().then(module => {
              if (name in module) {
                factory = module[name];
                store.factories.set(name, factory);
                resolve(factory);
              } else {
                reject(`cannot find ${name} in module ${src}`);
              }
            });
          } else {
            reject(`cannot find ${name} in modules`);
          }
        }
      } else {
        resolve(factory);
      }
    });
  }

  init(factories, element, data, unsubscribe$, originalElement) {
    return Promise.all(factories.map(meta => {
      return this.resolveFactory(meta).then(factory => {
        if (typeof factory === 'object') {
          const submodule = useModule(factory);
          submodule.observe$(element).pipe(
            takeUntil(unsubscribe$),
            finalize(_ => submodule.unregister(element))
          ).subscribe();
        } else if (factory.length > 0) {
          factory(element, data, unsubscribe$, this, originalElement);
          // factory(element, element.dataset, unsubscribe$, originalElement);
          return unsubscribe$;
        } else {
          const instance = new factory.prototype.constructor(element, data, unsubscribe$, this, originalElement);
          return instance;
        }
      });
    }));
  }

  matches(factories, element = document) {
    const elementFactories = new Map();
    const datas = new WeakMap();
    const originalElements = new WeakMap();
    factories = Module.sortFactories(factories);
    const selectors = factories.map((factory) => (Array.isArray(factory) ? factory[2] : factory.meta.selector));
    const match = function(element) {
      let elementHasLazyFactory = false;
      let elementHasStructureFactory = false;
      const matchedFactories = [];
      elementFactories.set(element, matchedFactories);
      selectors.forEach(function(selector, i) {
        if (elementHasStructureFactory || elementHasLazyFactory) {
          return;
        }
        if (element.matches(selector)) {
          const factory = factories[i];
          if (Array.isArray(factory)) {
            elementHasLazyFactory = true;
          } else if (factory.meta.structure) {
            elementHasStructureFactory = true;
            const originalElement = element.cloneNode(true);
            originalElements.set(element, originalElement);
          }
          matchedFactories.push(factory);
        }
      });
      if (matchedFactories.length) {
        const data = {};
        Object.keys(element.dataset).forEach(key => {
          data[key] = element.dataset[key];
          delete element.dataset[key];
        });
        datas.set(element, data);
      } else {
        elementFactories.delete(element);
      }
      return elementHasLazyFactory || elementHasStructureFactory;
    };
    function matchElement(element) {
      if (element) {
        const skipChilds = match(element);
        matchElement(element.nextElementSibling);
        if (!skipChilds) {
          matchElement(element.firstElementChild);
        }
      }
    }
    if ('matches' in element) {
      match(element);
    }
    matchElement(element.firstElementChild);
    // Module.stats(`elementFactories ${elementFactories.size}`);
    return { elementFactories, datas, originalElements };
    // return elementFactories;
  }

  register(element = document) {
    const store = this.store;
    if (store.instances.has(element)) {
      throw ('element already registered');
      // this.unregister(element);
    }
    const factories = this.factories;
    const instances = [];
    store.instances.set(element, instances);
    const { elementFactories, datas, originalElements } = this.matches(factories, element);
    const observingElements = Array.from(elementFactories.keys());
    return Promise.all(observingElements.map(element => {
      const data = datas.get(element);
      const originalElement = originalElements.get(element);
      const factories = elementFactories.get(element);
      const unsubscribe$ = new Subject();
      return Factory({ factories, element, data, unsubscribe$, originalElement, model: this });
    })).then(items => {
      return instances.push(...items);
    });
  }

  observe$(element = document) {
    const store = this.store;
    if (store.instances.has(element)) {
      throw ('element already registered');
      // this.unregister(element);
    }
    const factories = this.factories;
    const instances = [];
    store.instances.set(element, instances);
    const instances$ = new Subject();
    const { elementFactories, datas, originalElements } = this.matches(factories, element);
    const observingElements = Array.from(elementFactories.keys());
    const initialize = (element) => {
      if (elementFactories.has(element)) {
        const data = datas.get(element);
        const originalElement = originalElements.get(element);
        const factories = elementFactories.get(element);
        const unsubscribe$ = new Subject();
        Factory({ factories, element, data, unsubscribe$, originalElement, module: this }).then(items => {
          instances.push(...items);
          instances$.next(instances.slice());
        });
      }
    };
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: element.parentElement ? element.parentElement : element,
        rootMargin: '50px',
        threshold: [0.01, 0.99],
      };
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initialize(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      observingElements.forEach((element) => {
        observer.observe(element);
      });
      store.observers.set(element, observer);
    } else {
      observingElements.forEach((element) => {
        initialize(element);
      });
    }
    return instances$;
  }

  unregister(element = document) {
    const store = this.store;
    if (store.observers.has(element)) {
      const observer = store.observers.get(element);
      observer.disconnect();
      store.observers.delete(element);
    }
    if (store.instances.has(element)) {
      const instances = store.instances.get(element);
      instances.forEach(instance => {
        if (typeof instance.destroy === 'function') {
          instance.destroy();
        } else {
          instance.next();
        }
      });
      store.instances.delete(element);
    }
    deleteState(element);
  }

  destroy(instance) {
    const store = this.store;
    store.instances.forEach(instances => {
      const index = instances.indexOf(instance);
      if (index !== -1) {
        instances.splice(index, 1);
      }
    });
  }

  makeFunction(expression) {
    return Module.makeFunction(expression, this);
  }

  static makeFunction(expression, module) {
    // console.log(expression, module);
    // static makeFunction(expression, params = ['$instance']) {
    expression = Module.parseExpression(expression);
    /*
    const expressionFunction = `with(this) {
  return (function (${params.join(',')}, $$module) {
    try {
      const $$pipes = $$module.meta.pipes;
      return ${expression};
    } catch(error) {
      console.log(error, this, ${JSON.stringify(expression)}, arguments);
      // $$module.nextError(error, this, ${JSON.stringify(expression)}, arguments);
    }
  }.bind(this)).apply(this, arguments);
}`;
    */
    const expressionFunction = `
			with(state) {
				try {
					return ${expression};
				} catch (error) {
					console.warn('getExpression.error', error, 'state', state, ${JSON.stringify(expression)});
					return null;
				}
			}
		`;
    // console.log('Module.makeFunction.expressionFunction', expressionFunction);
    const callback = new Function('state', '$$pipes', expressionFunction);
    // return () => { return null; };
    // callback.expression = expression;
    return function(state) {
      return callback(state, module.pipes);
    };
  }

  static parseExpression(expression) {
    const l = '┌';
    const r = '┘';
    const rx1 = /(\()([^\(\)]*)(\))/;
    while (expression.match(rx1)) {
      expression = expression.replace(rx1, function(substring, ...args) {
        return `${l}${Module.parsePipes(args[1])}${r}`;
      });
    }
    expression = Module.parsePipes(expression);
    expression = expression.replace(/(┌)|(┘)/g, function(substring, ...args) {
      return args[0] ? '(' : ')';
    });
    return expression;
    // return Module.parseOptionalChaining(expression);
  }

  static parsePipes(expression) {
    const l = '┌';
    const r = '┘';
    const rx1 = /(.*?[^\|])\|([^\|]+)/;
    while (expression.match(rx1)) {
      expression = expression.replace(rx1, function(substring, ...args) {
        const value = args[0].trim();
        const params = Module.parsePipeParams(args[1]);
        const func = params.shift().trim();
        return `$$pipes.${func}${l}${[value, ...params]}${r}`;
        // return `$$pipes.${func}.transform${l}${[value, ...params]}${r}`;
      });
    }
    return expression;
  }

  static parsePipeParams(expression) {
    const segments = [];
    let i = 0;
    let word = '';
    let block = 0;
    const t = expression.length;
    while (i < t) {
      const c = expression.substr(i, 1);
      if (c === '{' || c === '(' || c === '[') {
        block++;
      }
      if (c === '}' || c === ')' || c === ']') {
        block--;
      }
      if (c === ':' && block === 0) {
        if (word.length) {
          segments.push(word.trim());
        }
        word = '';
      } else {
        word += c;
      }
      i++;
    }
    if (word.length) {
      segments.push(word.trim());
    }
    return segments;
  }

  static parseOptionalChaining(expression) {
    const regex = /(\w+(\?\.))+([\.|\w]+)/g;
    let previous;
    expression = expression.replace(regex, function(substring, ...args) {
      const tokens = substring.split('?.');
      for (let i = 0; i < tokens.length - 1; i++) {
        const a = i > 0 ? `(${tokens[i]} = ${previous})` : tokens[i];
        const b = tokens[i + 1];
        previous = i > 0 ? `${a}.${b}` : `(${a} ? ${a}.${b} : void 0)`;
      }
      return previous || '';
    });
    return expression;
  }

  static sortFactories(factories) {
    factories.sort((a, b) => {
      const isArrayA = Array.isArray(a);
      const isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return 0;
      } else if (isArrayA) {
        return 1;
      } else if (isArrayB) {
        return -1;
      } else {
        const isStructureA = a.meta.structure;
        const isStructureB = b.meta.structure;
        if (isStructureA && isStructureB) {
          return 0;
        } else if (isStructureA) {
          return -1;
        } else {
          return 1;
        }
      }
    });
    return factories;
  }

  static stats(key) {
    const lpt = Module.lpt || performance.now();
    const now = performance.now();
    const div = document.createElement('div');
    const ts = (key ? key : 'stats') + ' (' + Math.floor((now - lpt) * 100) / 100 + 'ms)';
    console.log('Module.stats', ts);
    /*
    div.innerHTML = ts;
    const body = document.querySelector('body');
    body.insertBefore(div, body.firstElementChild);
    */
    Module.lpt = now;
  }
}

function parseOptions(options) {
  const factories = [];
  const pipes = {};
  const dynamics = {};
  if (options.imports) {
    options.imports.forEach(x => {
      const m = parseOptions(x);
      factories.push(...m.factories);
      Object.keys(m.pipes).forEach(key => {
        pipes[key] = m.pipes[key];
      });
      Object.assign(dynamics, m.dynamics);
    });
  }
  if (options.factories) {
    factories.push(...options.factories);
  }
  if (options.pipes) {
    options.pipes.forEach(x => {
      pipes[x.meta.name] = x;
    });
  }
  Object.assign(dynamics, options.dynamics);
  return { factories, pipes, dynamics };
}

export function useModule(options) {
  options = parseOptions(options);
  return new Module(options);
}
