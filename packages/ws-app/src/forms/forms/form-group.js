import { FormAbstractCollection } from './form-abstract-collection';

/**
 * Class representing a FormGroup.
 */
export class FormGroup extends FormAbstractCollection {

  /**
   * Create a FormControl.
   * @example
   * const form = new FormGroup({
   * 	firstName: null,
   *  lastName: null,
   * });
   *
   * form.changes$.subscribe(changes => {
   * 	console.log(changes);
   * });
   * @param controls an object containing controls.
   * @param validators a list of validators.
   */
  constructor(controls = {}, validators = null) {
    super(controls, validators);
  }

}

/**
 * Shortcut for new FormGroup
 */
export function formGroup(controls = {}, validators = null) {
  return new FormGroup(controls, validators);
}
