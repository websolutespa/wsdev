import { FormAbstract } from './form-abstract';
import { FormStatus } from './types';

/**
 * Class representing a FormControl.
 */
export class FormControl extends FormAbstract {

  /**
   * Create a FormControl.
   * @example
   * const form = new FormControl(null);
   *
   * form.changes$.subscribe(changes => {
   * 	console.log(changes);
   * });
   * @param value The value of the control.
   * @param validators a list of validators.
   */
  constructor(value = null, validators = null, options = null) {
    super(validators);
    this.value_ = value;
    if (options?.disabled) {
      this.status = FormStatus.Disabled;
    } else if (options?.readonly) {
      this.status = FormStatus.Readonly;
    } else if (options?.hidden) {
      this.status = FormStatus.Hidden;
    } else {
      this.status = FormStatus.Pending;
    }
    this.errors = {};
    this.initSubjects_();
    this.initObservables_();
    this.statusSubject.next(null);
  }

}

/** Shortcut for new FormControl. */
export function formControl(value = null, validators = null) {
  return new FormControl(value, validators);
}
