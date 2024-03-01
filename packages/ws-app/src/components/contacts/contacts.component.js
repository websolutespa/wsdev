


import { first, fromEvent, map, takeUntil } from 'rxjs';
import { useState } from '../../core';
import { FormControl, FormGroup, Validators } from '../../forms/forms';
// import { ContactsService } from './contacts.service';

export const FormStrategy = {
  InferData: 'infer',
  ApiData: 'api',
};

export function ContactsComponent(node, data, unsubscribe$, module) {
  const strategy = data.strategy || FormStrategy.InferData;
  const form = new FormGroup({
    firstName: new FormControl(null, [Validators.RequiredValidator()]),
    lastName: new FormControl(null, [Validators.RequiredValidator()]),
    email: new FormControl(null, [Validators.RequiredValidator(), Validators.EmailValidator()]),
    telephone: new FormControl(null),
    job: new FormControl(null),
    company: new FormControl(null),
    city: new FormControl(null, [Validators.RequiredValidator()]),
    country: new FormControl(null, [Validators.RequiredValidator()]),
    requestType: new FormControl(null, [Validators.RequiredValidator()]),
    message: new FormControl(null),
    privacy: new FormControl(null, [Validators.RequiredTrueValidator()]),
    newsletter: new FormControl(null, [Validators.RequiredValidator()]),
    commercial: new FormControl(null, [Validators.RequiredValidator()]),
    promotion: new FormControl(null, [Validators.RequiredValidator()]),
    checkRequest: window.antiforgery,
    checkField: '',
  });
  const controls = form.controls;
  node.form_ = form;
  const state = useState(node, { form, test, success: false });
  /*
  form.changes$.pipe(
    takeUntil(unsubscribe$)
  ).subscribe((value) => {
    const flags = form.flags;
    const errors = mapErrors_(form.errors);
    // console.log(value, flags, errors);
  });
  */
  if (strategy === FormStrategy.InferData) {
    inferData();
  } else {
    loadData$().pipe(
      first()
    ).subscribe();
  }

  fromEvent(node, 'submit').pipe(
    map(event => onSubmit(event)),
    takeUntil(unsubscribe$)
  ).subscribe();
  // !!! expose form
  form.test = () => {
    test();
  };

  function inferData() {
    const selects = Array.prototype.slice.call(node.querySelectorAll('select'));
    selects.forEach(select => {
      const key = select.getAttribute('name');
      const control = form.get(key);
      if (control) {
        const options = Array.prototype.slice.call(select.querySelectorAll('option')).map(option => {
          return { id: option.value || null, name: option.innerText };
        });
        control.options = options;
      }
    });
  }

  function loadData$() {
    /*
    return ContactsService.data$().pipe(
      tap(data => {
        const controls = this.controls;
        // console.log(data, controls);
        // controls.country.options = FormService.toSelectOptions(data.country.options);
      }),
    );
    */
  }

  function onSubmit(event) {
    // console.log('ContactsComponent.onSubmit', form.value);
    event.preventDefault();
    if (form.flags.valid) {
      // console.log('ContactsComponent.onSubmit.valid!');
      state.success = true;
    } else {
      form.touched = true;
      const invalids = Array.prototype.slice.call(node.querySelectorAll('.invalid'));
      if (invalids.length) {
        const target = invalids[0];
        const scrollToY = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo(0, scrollToY);
      }
    }
  }

  function test() {
    const country = controls.country.options.length > 1 ? controls.country.options[1].id : null;
    const requestType = controls.requestType.options.length > 1 ? controls.requestType.options[1].id : null;
    form.patch({
      firstName: 'Jhon',
      lastName: 'Appleseed',
      email: 'jhonappleseed@gmail.com',
      telephone: '0721 411112',
      job: 'Web Developer',
      company: 'Websolute',
      city: 'Pesaro',
      country: country,
      requestType: requestType,
      message: 'Hi!',
      privacy: true,
      newsletter: false,
      commercial: false,
      promotion: false,
      checkRequest: window.antiforgery,
      checkField: '',
    });
  }
}

ContactsComponent.meta = {
  selector: '[data-contacts]',
};
