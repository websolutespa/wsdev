import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getControl, updateControl } from './control.component';

export function ControlPrivacy(props) {
  const { element, data, unsubscribe$ } = props;
  const control = getControl(element, data.field);
  const inputs = Array.prototype.slice.call(element.querySelectorAll('input'));
  inputs.forEach((input, i) => {
    (control.value === true && i === 0) || (control.value === false && i === 1) ? input.setAttribute('checked', '') : input.removeAttribute('checked');
  });

  if (control) {
    control.changes$.pipe(
      takeUntil(unsubscribe$)
    ).subscribe((value) => {
      updateControl(element, control);
      inputs.forEach((input, i) => {
        input.disabled = control.flags.disabled;
        input.readOnly = control.flags.readonly;
        (control.value === true && i === 0) || (control.value === false && i === 1) ? input.setAttribute('checked', '') : input.removeAttribute('checked');
      });
      if (control.flags.touched && control.errors.length) {
        console.log('ControlText.onChanged.error', control.errors.map(error => error.key));
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
      fromEvent(inputs, 'input'),
      fromEvent(inputs, 'change')
    ).pipe(
      tap(event => {
        control.patch(event.target.value);
      })
    );
  }

  function blur$() {
    return fromEvent(inputs, 'blur').pipe(
      tap(event => {
        control.touched = true;
      })
    );
  }
}

ControlPrivacy.meta = {
  selector: '[data-control-privacy]',
};
