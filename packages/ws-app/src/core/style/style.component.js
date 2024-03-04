import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function StyleComponent(props) {
  const { element, data, unsubscribe$, module } = props;
  const getValue = module.makeFunction(data.style);
  let previousStyle;
  state$(element).pipe(
    takeUntil(unsubscribe$)
  ).subscribe(state => {
    const style = getValue(state);
    if (previousStyle) {
      for (let key in previousStyle) {
        if (!style || !style[key]) {
          const splitted = key.split('.');
          const propertyName = splitted.shift();
          element.style.removeProperty(propertyName);
        }
      }
    }
    if (style) {
      for (let key in style) {
        if (!previousStyle || previousStyle[key] !== style[key]) {
          const splitted = key.split('.');
          const propertyName = splitted.shift();
          const value = style[key] + (splitted.length ? splitted[0] : '');
          element.style.setProperty(propertyName, value);
        }
      }
    }
    previousStyle = style;
  });
}

StyleComponent.meta = {
  selector: '[data-style]',
};
