import { state$, useState } from '../state/state';

// const noderef = new WeakMap();

export class Component {

  constructor(props) {
    const { node, data, unsubscribe$, originalNode, module } = props;
    this.node = node;
    this.data = data;
    this.unsubscribe$ = unsubscribe$;
    this.originalNode = originalNode;
    this.module = module;
    /*
    let refs;
    if (noderef.has(node)) {
      refs = noderef.get(node);
    } else {
      refs = [];
      noderef.set(node, refs);
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
    const node = this.node;
    const refs = noderef.get(node);
    refs.splice(refs.indexOf(this), 1);
    if (refs.length === 0) {
      noderef.delete(node);
    }
    */
    this.node = null;
    this.unsubscribe$ = null;
    this.module.destroy(this);
  }

  get state() {
    if (!this.state_) {
      this.state_ = useState(this.node);
    }
    return this.state_;
  }
  set state(state) {
    throw 'state cannot be set';
  }

  get state$() {
    return state$(this.node);
  }

  /*
  static create(html) {
    const node = document.createElement('div');
    node.innerHTML = html;
    return node.firstElementChild;
  }
  */

}
