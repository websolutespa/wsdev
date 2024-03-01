import { BehaviorSubject, combineLatest, isObservable, merge, of, ReplaySubject } from 'rxjs';
import { auditTime, distinctUntilChanged, map, shareReplay, skip, switchAll, switchMap, tap } from 'rxjs/operators';
import { FormStatus } from './types';

/**
 * Abstract class representing a form control.
 */
export class FormAbstract {

  errors_;
  get errors() {
    return this.errors_;
  }
  set errors(errors) {
    this.errors_ = errors;
  }

  name;
  value_ = null;
  submitted_ = false;
  touched_ = false;
  dirty_ = false;
  status;

  validators;

  valueSubject = new BehaviorSubject(null);
  statusSubject = new BehaviorSubject(null);
  validatorsSubject = new ReplaySubject(1).pipe(
    switchAll()
  );
  value$ = this.valueSubject.pipe(
    distinctUntilChanged(),
    skip(1),
    tap(() => {
      this.submitted_ = false;
      this.dirty_ = true;
      this.statusSubject.next(null);
    }),
    shareReplay(1)
  );
  status$ = merge(this.statusSubject, this.validatorsSubject).pipe(
    // auditTime(1),
    switchMap(() => this.validate$(this.value)),
    shareReplay(1)
  );
  changes$ = merge(this.value$, this.status$).pipe(
    map(() => this.value),
    auditTime(1),
    shareReplay(1)
  );

  /**
   * Create a FormAbstract.
   * @param validators a list of validators.
   */
  constructor(validators = null) {
    this.validators = validators ? (Array.isArray(validators) ? validators : [validators]) : [];
  }

  /**
   * initialize subjects
   */
  initSubjects_() {
    this.switchValidators_();
  }

  switchValidators_() {
    const validatorParams = this.validators.map(x => x.params$);
    let validatorParams$ = validatorParams.length ? combineLatest(validatorParams) : of(validatorParams);
    this.validatorsSubject.next(validatorParams$);
  }

  /**
   * initialize observables
   */
  initObservables_() { }

  /**
   * @param value the inner control value
   * @return an object with key, value errors
   */
  validate$(value) {
    if (this.status === FormStatus.Disabled || this.status === FormStatus.Readonly || this.status === FormStatus.Hidden || this.submitted_ || !this.validators.length) {
      this.errors_ = {};
      if (this.status === FormStatus.Invalid) {
        this.status = FormStatus.Valid;
      }
      return of(this.errors_);
    } else {
      return combineLatest(this.validators.map(x => {
        let result$ = x.validate(value);
        return isObservable(result$) ? result$ : of(result$);
      })).pipe(
        map(results => {
          this.errors_ = Object.assign({}, ...results);
          this.status = Object.keys(this.errors_).length === 0 ? FormStatus.Valid : FormStatus.Invalid;
          return this.errors_;
        })
      );
    }
  }

  /**
   * @return the pending status
   */
  get pending() { return this.status === FormStatus.Pending; }

  /**
   * @return the valid status
   */
  get valid() { return this.status !== FormStatus.Invalid; }

  /**
   * @return the invalid status
   */
  get invalid() { return this.status === FormStatus.Invalid; }

  /**
   * @return the disabled status
   */
  get disabled() { return this.status === FormStatus.Disabled; }

  /**
   * @return the enabled status
   */
  get enabled() { return this.status !== FormStatus.Disabled; }

  /**
   * @return the readonly status
   */
  get readonly() { return this.status === FormStatus.Readonly; }

  /**
   * @return the enabled status
   */
  get writeable() { return this.status !== FormStatus.Disabled && this.status !== FormStatus.Readonly; }

  /**
   * @return the hidden status
   */
  get hidden() { return this.status === FormStatus.Hidden; }

  /**
   * @return the visible status
   */
  get visible() { return this.status !== FormStatus.Hidden; }

  /**
   * @return the submitted status
   */
  get submitted() { return this.submitted_; }

  /**
   * @return the dirty status
   */
  get dirty() { return this.dirty_; }

  /**
   * @return the pristine status
   */
  get pristine() { return !this.dirty_; }

  /**
   * @return the touched status
   */
  get touched() { return this.touched_; }

  /**
   * @return the untouched status
   */
  get untouched() { return !this.touched_; }

  /**
   * @param disabled the disabled state
   */
  set disabled(disabled) {
    if (disabled) {
      if (this.status !== FormStatus.Disabled) {
        this.status = FormStatus.Disabled;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    } else {
      if (this.status === FormStatus.Disabled) {
        this.status = FormStatus.Pending;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    }
  }

  /**
   * @param disabled the disabled state
   */
  set readonly(readonly) {
    if (readonly) {
      if (this.status !== FormStatus.Readonly) {
        this.status = FormStatus.Readonly;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    } else {
      if (this.status === FormStatus.Readonly) {
        this.status = FormStatus.Pending;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    }
  }

  get flags() {
    return {
      untouched: this.untouched,
      touched: this.touched,
      pristine: this.pristine,
      dirty: this.dirty,
      pending: this.pending,
      enabled: this.enabled,
      disabled: this.disabled,
      readonly: this.readonly,
      writeable: this.writeable,
      hidden: this.hidden,
      visible: this.visible,
      valid: this.valid,
      invalid: this.invalid,
      submitted: this.submitted,
    };
  }

  /**
   * @param hidden the hidden state
   */
  set hidden(hidden) {
    if (hidden) {
      if (this.status !== FormStatus.Hidden) {
        this.status = FormStatus.Hidden;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    } else {
      if (this.status === FormStatus.Hidden) {
        this.status = FormStatus.Pending;
        // this.value_ = null;
        this.dirty_ = false;
        this.touched_ = false;
        this.submitted_ = false;
        this.statusSubject.next(null);
      }
    }
  }

  /**
   * @param submitted the submitted state
   */
  set submitted(submitted) {
    this.submitted_ = submitted;
    this.statusSubject.next(null);
  }

  /**
   * @param touched the touched state
   */
  set touched(touched) {
    this.touched_ = touched;
    this.statusSubject.next(null);
  }

  /**
   * @return inner value of the control
   */
  get value() { return this.value_; }

  /**
   * @param value a value
   */
  set value(value) {
    this.value_ = value;
    this.valueSubject.next(value);
  }

  /**
   * @param status optional FormStatus
   */
  reset(status = null) {
    this.status = status || FormStatus.Pending;
    this.value_ = null;
    this.dirty_ = false;
    this.touched_ = false;
    this.submitted_ = false;
    this.statusSubject.next(null);
  }

  /**
   * @param value a value
   */
  patch(value) {
    this.value_ = value;
    this.dirty_ = true;
    this.submitted_ = false;
    this.statusSubject.next(null);
  }

  /**
   * adds one or more FormValidator.
   * @param validators a list of validators.
   */
  addValidators(...validators) {
    this.validators.push(...validators);
    this.switchValidators_();
  }

  /**
   * replace one or more FormValidator.
   * @param validators a list of validators.
   */
  replaceValidators(...validators) {
    this.validators = validators;
    this.switchValidators_();
  }

  /**
   * remove all FormValidator.
   */
  clearValidators() {
    this.validators = [];
    this.switchValidators_();
  }

}
