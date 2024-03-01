import { fromEvent, merge, takeUntil, tap } from 'rxjs';
// import { environment } from '../../environment';
import { getForm } from '../controls/control.component';

export function TestComponent(props) {
  const { node, data, unsubscribe$ } = props;
  /*
  if (environment.flags.production) {
    return;
  }
  */
  const form = getForm(node);
  if (!form) {
    return;
  }

  node.innerHTML = /*html*/`
		<code class="forms-test__code"[innerHTML]="form.value | json"></code>
		<button type="button" class="btn--submit"><span>Test</span></button>
		<button type="button" class="btn--reset"><span>Reset</span></button>
	`;
  const code = node.querySelector('.forms-test__code');
  listeners$().pipe(
    takeUntil(unsubscribe$)
  ).subscribe();

  function listeners$() {
    return merge(
      change$(),
      test$(),
      reset$()
    );
  }

  function change$() {
    return form.changes$.pipe(
      tap(value => {
        code.innerText = JSON.stringify(value);
      })
    );
  }

  function test$() {
    const button = node.querySelector('.btn--submit');
    return fromEvent(button, 'click').pipe(
      tap(event => {
        if (typeof form.test === 'function') {
          form.test();
        } else {
          const values = {};
          Object.keys(form.controls).forEach(key => {
            const control = form.controls[key];
            if (control.validators.length) {
              if (control.options) {
                values[key] = control.options.length > 1 ? control.options[1].id : null;
              } else {
                values[key] = key;
              }
            }
          });
          form.patch(values);
        }
      })
    );
  }

  function reset$() {
    const button = node.querySelector('.btn--reset');
    return fromEvent(button, 'click').pipe(
      tap(event => {
        form.reset();
      })
    );
  }
}

TestComponent.meta = {
  selector: '[data-test]',
};
