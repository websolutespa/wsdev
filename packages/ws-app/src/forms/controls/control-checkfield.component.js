


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { ControlText } from './control-text.component';
import { getControl, updateControl } from './control.component';

export function ControlCheckfield(props) {
  const { node, data, unsubscribe$ } = props;
  const control = getControl(node, data.field);
  const input = node.querySelector('input');

  if (control) {
    control.changes$.pipe(
      takeUntil(unsubscribe$)
    ).subscribe((value) => {
      updateControl(node, control);
      input.disabled = control.flags.disabled;
      input.readOnly = control.flags.readonly;
      if (control.flags.touched && control.errors.length) {
        console.log('ControlCheckfield.onChanged.error', control.errors.map(error => error.key));
      }
      if (input.value !== control.value) {
        input.value = control.value;
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
        control.patch(event.target.value);
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

ControlCheckfield.meta = {
  selector: '[data-control-checkfield]',
};

export class ControlCheckfield__ extends ControlText {

  static meta = {
    selector: '[data-control-checkfield]',
  };

}
