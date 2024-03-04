import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function TextComponent(props) {
  const { element, data, unsubscribe$, module } = props;
  const getValue = module.makeFunction(data.text);
  let innerText_;
  state$(element).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const innerText = getValue(state);
    if (innerText_ !== innerText) {
      innerText_ = innerText;
      element.innerText = innerText == undefined ? '' : innerText; // !!! keep == loose equality
    }
  });
}

TextComponent.meta = {
  selector: '[data-text]',
};
