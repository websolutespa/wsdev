// import { FormControl, FormGroup, Validators, useState } from '@websolutespa/ws-app';
import { fromEvent, takeUntil, tap } from 'rxjs';

export function MenuComponent(props) {
  const { element, data, unsubscribe$, module } = props;
  const items = Array.from(element.querySelectorAll('a'));
  fromEvent(items, 'click').pipe(
    tap(event => {
      event.preventDefault();
      const href = event.currentTarget.getAttribute('href');
      const hash = href.split('#')[1];
      const target = document.querySelector(`#${hash}`);
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -100 });
      }
    }),
    takeUntil(unsubscribe$)
  ).subscribe();
  const onScroll = (event) => {
    // console.log('MenuComponent.onScroll');
  };
  if (window.lenis) {
    window.lenis.on('scroll', onScroll);
  }
}

MenuComponent.meta = {
  selector: '[data-menu]',
};
