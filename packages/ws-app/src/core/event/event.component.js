import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getParentState } from '../state/state';
import { EventService } from './event.service';

const EVENTS = ['event', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'mousemove', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export function EventComponent(props) {
  const { element, data, unsubscribe$, module } = props;

  event$().pipe(
    takeUntil(unsubscribe$)
  ).subscribe();

  function event$() {
    const events = EVENTS.filter(x => data[x]);
    return merge(...events.map(event => {
      const eventName = event === 'event' ? 'click' : event;
      return fromEvent(element, eventName).pipe(
        tap(originalEvent => {
          if (event === 'event') {
            const eventType = data[event] || 'event';
            const eventData = data.data ? JSON.parse(data.data) : null;
            EventService.send(eventType, eventData, element, originalEvent);
          } else {
            const expression = data[event];
            const getValue = module.makeFunction(expression);
            const parentState = getParentState(element);
            const value = getValue(parentState);
          }
        })
      );
    }));
  }
}

EventComponent.meta = {
  selector: `[data-${EVENTS.join('],[data-')}]`,
};
