import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, shareReplay, switchAll } from 'rxjs/operators';
import { FormAbstract } from './form-abstract';
import { FormControl } from './form-control';
import { FormStatus } from './types';

/**
 * Abstract class representing a form collection.
 */
export class FormAbstractCollection extends FormAbstract {

  controls;
  changesChildren = new BehaviorSubject(undefined);

  /**
   * Create a FormAbstract.
   * @param controls an object containing controls.
   * @param validators a list of validators.
   */
  constructor(controls = null, validators = null) {
    super(validators);
    this.controls = controls;
    this.initControls_();
    this.initSubjects_();
    this.initObservables_();
  }

  initControl_(controlOrValue, key) {
    const control = controlOrValue instanceof FormAbstract ? controlOrValue : new FormControl(controlOrValue);
    control.addValidators(...this.validators);
    control.name = key;
    return control;
  }

  initControls_() {
    this.forEach_((control, key) => {
      this.init(control, key);
    });
    return this.controls;
  }

  initSubjects_() {
    this.changesChildren = this.changesChildren.pipe(
      switchAll()
    );
    this.switchSubjects_();
  }

  switchSubjects_() {
    const changesChildren = this.reduce_((result, control) => {
      result.push(control.changes$);
      return result;
    }, []);
    let changesChildren$ = changesChildren.length ? combineLatest(changesChildren) : of(changesChildren);
    this.changesChildren.next(changesChildren$);
  }

  initObservables_() {
    this.changes$ = this.changesChildren.pipe(
      map(() => this.value),
      shareReplay(1)
    );
  }

  validate(value) {
    let errors;
    if (this.status === FormStatus.Disabled || this.status === FormStatus.Readonly || this.status === FormStatus.Hidden) {
      // this.errors = {};
      errors = [];
    } else {
      // this.errors = Object.assign({}, ...this.validators.map(x => x(value)));
      // this.status = Object.keys(this.errors).length === 0 ? FormStatus.Valid : FormStatus.Invalid;
      let errors_ = this.validators.map(x => x.validate(value)).filter(x => x !== null);
      errors = this.reduce_((result, control) => {
        return result.concat(control.errors);
      }, errors_);
      this.status = errors.length === 0 ? FormStatus.Valid : FormStatus.Invalid;
    }
    return errors;
  }

  forEach_(callback) {
    Object.keys(this.controls).forEach(key => callback(this.controls[key], key));
  }

  reduce_(callback, result) {
    this.forEach_((control, key) => {
      result = callback(result, control, key);
    });
    return result;
  }

  all_(key, value) {
    return this.reduce_((result, control) => {
      return result && control[key] === value;
    }, true);
  }

  any_(key, value) {
    return this.reduce_((result, control) => {
      return result || control[key] === value;
    }, false);
  }

  get valid() { return this.all_('valid', true); }
  get invalid() { return this.any_('invalid', true); }
  get pending() { return this.any_('pending', true); }
  get disabled() { return this.all_('disabled', true); }
  get enabled() { return this.any_('enabled', true); }
  get readonly() { return this.any_('readonly', true); }
  get writeable() { return this.any_('writeable', true); }
  get hidden() { return this.all_('hidden', true); }
  get visible() { return this.any_('visible', true); }
  get submitted() { return this.all_('submitted', true); }
  get dirty() { return this.any_('dirty', true); }
  get pristine() { return this.all_('pristine', true); }
  get touched() { return this.all_('touched', true); }
  get untouched() { return this.any_('untouched', true); }

  set disabled(disabled) {
    this.forEach_((control) => {
      control.disabled = disabled;
    });
  }

  set readonly(readonly) {
    this.forEach_((control) => {
      control.readonly = readonly;
    });
  }

  set hidden(hidden) {
    this.forEach_((control) => {
      control.hidden = hidden;
    });
  }

  set submitted(submitted) {
    this.forEach_((control) => {
      control.submitted = submitted;
    });
  }

  set touched(touched) {
    this.forEach_((control) => {
      control.touched = touched;
    });
  }

  get value() {
    return this.reduce_((result, control, key) => {
      result[key] = control.value;
      return result;
    }, {});
  }

  set value(value) {
    this.forEach_((control, key) => {
      control.value = value[key];
    });
  }

  get errors() {
    return this.reduce_((result, control) => {
      return Object.assign(result, control.errors);
    }, {});
  }
  set errors(errors) { }

  reset() {
    this.forEach_((control) => control.reset());
  }

  patch(value) {
    if (value) {
      this.forEach_((control, key) => {
        if (value[key] != undefined) { // !!! keep != loose inequality
          control.patch(value[key]);
        }
      });
    }
  }

  init(control, key) {
    this.controls[key] = this.initControl_(control, key);
  }

  get(key) {
    return this.controls[key];
  }

  set(control, key) {
    delete (this.controls[key]);
    this.controls[key] = this.initControl_(control, key);
    this.switchSubjects_();
  }

  // !!! needed?
  add(control, key) {
    this.controls[key] = this.initControl_(control, key);
    this.switchSubjects_();
  }

  remove(control) {
    const key = Object.keys(this.controls).find((key) => this.controls[key] === control ? key : null);
    if (key) {
      this.removeKey(key);
    }
  }

  removeKey(key) {
    const exhist = this.controls[key] !== undefined;
    delete (this.controls[key]);
    if (exhist) {
      this.switchSubjects_();
    }
  }

  /**
   * adds one or more FormValidator.
   * @param validators a list of validators.
   */
  addValidators(...validators) {
    this.forEach_((control) => control.addValidators(...validators));
  }

  /**
   * replace one or more FormValidator.
   * @param validators a list of validators.
   */
  replaceValidators(...validators) {
    this.forEach_((control) => control.replaceValidators(...validators));
  }

  /**
   * remove all FormValidator.
   */
  clearValidators() {
    this.forEach_((control) => control.clearValidators());
  }

}
