import { FormValidator } from './form-validator';

/**
 * a null validator
 */
export function NullValidator() {
  return new FormValidator(function(value, params = null) {
    return null;
  });
}

/**
 * a required validator
 */
export function RequiredValidator() {
  return new FormValidator(function(value, params = null) {
    // console.log('RequiredValidator', value, (value == null || value.length === 0) ? { required: true } : null);
    return (value == null || value.length === 0) ? { required: true } : null;
  });
  // return (value == null || value.length === 0) ? 'required' : null;
}

/**
 * a required and true validator
 */
export function RequiredTrueValidator() {
  return new FormValidator(function(value, params = null) {
    // console.log('RequiredTrueValidator', value, value === true ? null : { required: true });
    return value === true ? null : { required: true };
  });
}

/**
 * a required dependant on another field
 */
export function RequiredIfValidator(fieldName, formGroup, shouldBe) {
  return new FormValidator(function(value) {
    let field = null;
    if (typeof formGroup === 'function') {
      field = formGroup().get(fieldName);
    } else if (formGroup) {
      field = formGroup.get(fieldName);
    }
    return (!value && field && (shouldBe != null ? field.value === shouldBe : field.value != null)) ? { required: { value: value, requiredIf: fieldName } } : null;
  });
}

/**
 * a min number value validator
 */
export function MinValidator(min) {
  return new FormValidator(function(value, params = null) {
    const min = params.min;
    if (!value || !min) {
      return null;
    }
    value = parseFloat(value);
    return !isNaN(value) && value < min ? { min: { min: min, actual: value } } : null;
  }, { min });
}

/**
 * a max number value validator
 */
export function MaxValidator(max) {
  return new FormValidator(function(value, params = null) {
    const max = params.max;
    if (!value || !max) {
      return null;
    }
    value = parseFloat(value);
    return !isNaN(value) && value > max ? { max: { max: max, actual: value } } : null;
  }, { max });
}

/**
 * a min string length validator
 */
export function MinLengthValidator(minlength) {
  return new FormValidator(function(value, params = null) {
    const minlength = params.minlength;
    if (!value || !minlength) {
      return null;
    }
    const length = value ? value.length : 0;
    return length < minlength ? { minlength: { requiredLength: minlength, actualLength: length } } : null;
  }, { minlength });
}

/**
 * a max string length validator
 */
export function MaxLengthValidator(maxlength) {
  return new FormValidator(function(value, params = null) {
    const maxlength = params.maxlength;
    if (!value || !maxlength) {
      return null;
    }
    const length = value ? value.length : 0;
    return length > maxlength ? { minlength: { requiredLength: maxlength, actualLength: length } } : null;
  }, { maxlength });
}

/**
 * a regex pattern validator
 */
export function PatternValidator(pattern) {
  return new FormValidator(function(value, params = null) {
    const pattern = params.pattern;
    if (!value || !pattern) {
      return null;
    }
    const regex = patternToRegEx(pattern);
    return regex.test(value) ? null : { pattern: { requiredPattern: regex.toString(), actualValue: value } };
  }, { pattern });
}

/**
 * an email pattern validator
 */
export function EmailValidator() {
  const regex = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return new FormValidator(function(value, params = null) {
    if (!value) {
      return null;
    }
    return regex.test(value) ? null : { email: true };
  });
}

function patternToRegEx(pattern) {
  let regex;
  if (pattern instanceof RegExp) {
    regex = pattern;
  } else if (typeof pattern === 'string') {
    pattern = pattern.charAt(0) === '^' ? pattern : `^${pattern}`;
    pattern = pattern.charAt(pattern.length - 1) === '$' ? pattern : `${pattern}$`;
    regex = new RegExp(pattern);
  }
  return regex || new RegExp('');
}

export const Validators = {
  NullValidator,
  RequiredValidator,
  RequiredTrueValidator,
  RequiredIfValidator,
  MinValidator,
  MaxValidator,
  MinLengthValidator,
  MaxLengthValidator,
  PatternValidator,
  EmailValidator,
};
