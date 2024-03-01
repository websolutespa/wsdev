import { FormAbstractCollection } from './form-abstract-collection';

/**
 * Class representing a FormArray.
 */
export class FormArray extends FormAbstractCollection {

  /**
   * Create a FormArray.
   * @example
   * const form = new FormArray([null, null, null]);
   *
   * form.changes$.subscribe(changes => {
   * 	console.log(changes);
   * });
   * @param controls an array containing controls.
   * @param validators a list of validators.
   */
  constructor(controls = [], validators = null) {
    super(controls, validators);
  }

  forEach_(callback) {
    this.controls.forEach((control, key) => callback(control, key));
  }

  get value() {
    return this.reduce_((result, control, key) => {
      result[key] = control.value;
      return result;
    }, []); // init as array
  }

  get length() {
    return this.controls.length;
  }

  init(control, key) {
    this.controls.length = Math.max(this.controls.length, key);
    this.controls[key] = this.initControl_(control, key);
  }

  set(control, key) {
    // this.controls.length = Math.max(this.controls.length, key);
    // this.controls[key] = this.initControl_(control);
    this.controls.splice(key, 1, this.initControl_(control, key));
    this.switchSubjects_();
  }

  add(control, key) {
    this.controls.length = Math.max(this.controls.length, key);
    this.controls[key] = this.initControl_(control, key);
    this.switchSubjects_();
  }

  push(control) {
    // this.controls.length = Math.max(this.controls.length, key);
    // this.controls[key] = this.initControl_(control);
    this.controls.push(this.initControl_(control, this.controls.length));
    this.switchSubjects_();
  }

  insert(control, key) {
    this.controls.splice(key, 0, this.initControl_(control, key));
    this.switchSubjects_();
  }

  remove(control) {
    const key = this.controls.indexOf(control);
    if (key !== -1) {
      this.removeKey(key);
    }
  }

  removeKey(key) {
    if (this.controls.length > key) {
      this.controls.splice(key, 1);
      this.switchSubjects_();
    }
  }

  at(key) {
    return this.controls[key];
  }

}

/**
 * Shortcut for new FormArray
 */
export function formArray(controls = [], validators = null) {
  return new FormArray(controls, validators);
}
