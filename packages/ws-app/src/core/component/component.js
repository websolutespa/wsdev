import { state$, useState } from '../state/state';

// const elementRefs = new WeakMap();

export class Component {

  constructor(props) {
    const { element, data, unsubscribe$, originalElement, module } = props;
    this.element = element;
    this.data = data;
    this.unsubscribe$ = unsubscribe$;
    this.originalElement = originalElement;
    this.module = module;
    /*
    let refs;
    if (elementRefs.has(element)) {
      refs = elementRefs.get(element);
    } else {
      refs = [];
      elementRefs.set(element, refs);
    }
    refs.push(this);
    */
    this.onInit();
  }

  onInit() { }

  onDestroy() { }

  destroy() {
    this.unsubscribe$.next();
    this.onDestroy();
    /*
    const element = this.element;
    const refs = elementRefs.get(element);
    refs.splice(refs.indexOf(this), 1);
    if (refs.length === 0) {
      elementRefs.delete(element);
    }
    */
    this.element = null;
    this.unsubscribe$ = null;
    this.module.destroy(this);
  }

  get state() {
    if (!this.state_) {
      this.state_ = useState(this.element);
    }
    return this.state_;
  }
  set state(state) {
    throw 'state cannot be set';
  }

  get state$() {
    return state$(this.element);
  }

  /*
  static create(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstElementChild;
  }
  */

}
