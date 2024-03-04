import { fromEvent, merge, takeUntil, tap } from 'rxjs';
// import { environment } from '../../environment';
import { getForm } from '../controls/control.component';

export function TestComponent(props) {
  const { element, data, unsubscribe$ } = props;
  /*
  if (environment.flags.production) {
    return;
  }
  */
  const form = getForm(element);
  if (!form) {
    return;
  }

  element.innerHTML = /*html*/`
		<code class="form__code" data-html="form.value | json"></code>
    <div class="form__cta">
		  <button type="button" class="btn--reset"><span>Reset</span></button>
		  <button type="button" class="btn--submit"><span>Test</span></button>
    </div>
	`;
  const code = element.querySelector('.form__code');
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
        code.innerText = JSON.stringify(value, null, 2);
      })
    );
  }

  function test$() {
    const button = element.querySelector('.btn--submit');
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
    const button = element.querySelector('.btn--reset');
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
