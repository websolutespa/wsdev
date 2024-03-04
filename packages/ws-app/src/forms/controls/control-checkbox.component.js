


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getControl, updateControl } from './control.component';

export function ControlCheckbox(props) {
  const { element, data, unsubscribe$ } = props;
  const control = getControl(element, data.field);
  const input = element.querySelector('input');

  if (control) {
    control.changes$.pipe(
      takeUntil(unsubscribe$)
    ).subscribe((value) => {
      updateControl(element, control);
      input.disabled = control.flags.disabled;
      input.readOnly = control.flags.readonly;
      if (control.flags.touched && control.errors.length) {
        console.log('ControlCheckbox.onChanged.error', control.errors.map(error => error.key));
      }
      const checked = control.value === true;
      if (input.checked !== checked) {
        input.checked = checked;
      }
    });

    listeners$().pipe(
      takeUntil(unsubscribe$)
    ).subscribe();
  }

  function listeners$() {
    return merge(
      change$(),
      blur$()
    );
  }

  function change$() {
    return merge(
      fromEvent(input, 'input'),
      fromEvent(input, 'change')
    ).pipe(
      tap(event => {
        control.patch(event.target.checked);
      })
    );
  }

  function blur$() {
    return fromEvent(input, 'blur').pipe(
      tap(event => {
        control.touched = true;
      })
    );
  }
}

ControlCheckbox.meta = {
  selector: '[data-control-checkbox]',
};

export class ControlCheckbox__ extends ControlCheckbox {

  static meta = {
    selector: '[data-control-checkbox]',
  };

  onChanged() {
    const input = this.input;
    const control = this.control;
    // console.log('ControlCheckbox.onChanged');
    input.disabled = control.flags.disabled;
    input.readOnly = control.flags.readonly;
    if (control.flags.touched && control.errors.length) {
      console.log('ControlCheckbox.onChanged.error', control.errors.map(error => error.key));
    }
    const checked = control.value === true;
    if (input.checked !== checked) {
      input.checked = checked;
    }
  }

  change$() {
    return fromEvent(this.input, 'change').pipe(
      tap(event => {
        this.control.patch(event.target.checked);
      })
    );
  }

}
