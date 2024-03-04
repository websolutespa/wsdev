import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function HtmlComponent(props) {
  const { element, data, unsubscribe$, module } = props;
  const getValue = module.makeFunction(data.html);
  let innerHTML_;
  state$(element).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const innerHTML = getValue(state);
    if (innerHTML_ !== innerHTML) {
      innerHTML_ = innerHTML;
      element.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
    }
  });
}

HtmlComponent.meta = {
  selector: '[data-html]',
};
