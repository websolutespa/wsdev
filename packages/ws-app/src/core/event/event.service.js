import { filter, Subject, takeUntil } from 'rxjs';

export class EventService {

  static event$ = new Subject();

  static send(type, data, element, event) {
    EventService.event$.next({ type, data, element, event });
  }

  static bubble$(element) {
    return this.event$.pipe(
      // tap(event => console.log(event.element, element, element.contains(event.element))),
      filter(event => event.element && element.contains(event.element))
    );
  }

  static filter$(element, events) {
    events = Array.isArray(events) ? events : [events];
    return this.event$.pipe(
      // tap(event => console.log(event.element, element, element.contains(event.element))),
      filter(event => events.indexOf(event.type) !== -1 && event.element && element.contains(event.element))
    );
  }

}

export function useEvent(props, callback) {
  console.log('useEvent', props);
  EventService.bubble$(props.element).pipe(
    takeUntil(props.unsubscribe$)
  ).subscribe(event => {
    if (typeof callback === 'function') {
      callback(event);
    }
  });
}
