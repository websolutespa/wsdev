import { BehaviorSubject } from 'rxjs';

/**
 * FormValidator class representing a form validator.
 * @example
 * export function EqualValidator(equal) {
 * 	return new FormValidator(function(value) {
 * 		const equal = this.params.equal;
 * 		if (!value || !equal) {
 * 			return null;
 * 		}
 * 		return value !== equal ? { equal: { equal: equal, actual: value } } : null;
 * 	}, { equal });
 * }
 */
export class FormValidator {

  validator;
  params$;

  get params() {
    return this.params$.getValue();
  }

  set params(params) {
    if (params) {
      const current = this.params;
      const differs = Object.keys(params).reduce((flag, key) => {
        return flag || !current || current[key] !== params[key];
      }, false);
      if (differs) {
        // if (JSON.stringify(params) !== JSON.stringify(this.params)) {
        this.params$.next(params);
      }
    }
  }

  /**
   * Create a FormValidator.
   */
  constructor(validator, params = null) {
    this.validator = validator;
    this.params$ = new BehaviorSubject(params);
  }

  /**
   * validate a value
   * @param value the value to validate
   */
  validate(value) {
    return this.validator(value, this.params);
  }

}
