import { fromEvent, merge, ReplaySubject, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

export class DragPoint {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

export class DragEvent {
  constructor(options) {
    if (options) {
      Object.assign(this, options);
    }
  }
}

export class DragDownEvent extends DragEvent {
  constructor(options) {
    super(options);
    this.distance = new DragPoint();
    this.strength = new DragPoint();
    this.speed = new DragPoint();
  }
}

export class DragMoveEvent extends DragEvent {
  constructor(options) {
    super(options);
    this.distance = new DragPoint();
    this.strength = new DragPoint();
    this.speed = new DragPoint();
  }
}

export class DragUpEvent extends DragEvent {
  constructor(options) {
    super(options);
  }
}

export class DragService {

  static getPosition(event, point) {
    if ('MouseEvent' in window && event instanceof MouseEvent) {
      point ? (
        point.x = event.clientX,
        point.y = event.clientY
      ) : point = {
        x: event.clientX,
        y: event.clientY,
      };
    } else if ('TouchEvent' in window && event instanceof TouchEvent) {
      if (event.touches.length > 0) {
        point ? (
          point.x = event.touches[0].pageX,
          point.y = event.touches[0].pageY
        ) : point = {
          x: event.touches[0].pageX,
          y: event.touches[0].pageY,
        };
      }
    }
    return point;
  }

  static down$(target, events$) {
    let downEvent;
    return merge(
      fromEvent(target, 'mousedown'),
      fromEvent(target, 'touchstart')
    ).pipe(
      map((event) => {
        downEvent = downEvent || new DragDownEvent();
        downEvent.element = target;
        downEvent.target = event.target;
        downEvent.originalEvent = event;
        downEvent.down = this.getPosition(event, downEvent.down);
        if (downEvent.down) {
          downEvent.distance = new DragPoint();
          downEvent.strength = new DragPoint();
          downEvent.speed = new DragPoint();
          events$.next(downEvent);
          return downEvent;
        }
      }),
      filter(event => event !== undefined)
    );
  }

  static move$(target, events$, dismiss$, downEvent) {
    let moveEvent;
    return fromEvent(document, downEvent.originalEvent instanceof MouseEvent ? 'mousemove' : 'touchmove').pipe(
      startWith(downEvent),
      map((event) => {
        moveEvent = moveEvent || new DragMoveEvent();
        moveEvent.element = target;
        moveEvent.target = event.target;
        moveEvent.originalEvent = event;
        moveEvent.position = this.getPosition(event, moveEvent.position);
        const dragging = downEvent.down !== undefined && moveEvent.position !== undefined;
        if (dragging) {
          moveEvent.distance.x = moveEvent.position.x - downEvent.down.x;
          moveEvent.distance.y = moveEvent.position.y - downEvent.down.y;
          moveEvent.strength.x = moveEvent.distance.x / window.innerWidth * 2;
          moveEvent.strength.y = moveEvent.distance.y / window.innerHeight * 2;
          moveEvent.speed.x = downEvent.speed.x + (moveEvent.strength.x - downEvent.strength.x) * 0.1;
          moveEvent.speed.y = downEvent.speed.y + (moveEvent.strength.y - downEvent.strength.y) * 0.1;
          downEvent.distance.x = moveEvent.distance.x;
          downEvent.distance.y = moveEvent.distance.y;
          downEvent.speed.x = moveEvent.speed.x;
          downEvent.speed.y = moveEvent.speed.y;
          downEvent.strength.x = moveEvent.strength.x;
          downEvent.strength.y = moveEvent.strength.y;
          events$.next(moveEvent);
          return moveEvent;
        }
      })
    );
  }

  static up$(target, events$, dismiss$, downEvent) {
    let upEvent;
    return fromEvent(document, downEvent.originalEvent instanceof MouseEvent ? 'mouseup' : 'touchend').pipe(
      map(event => {
        upEvent = upEvent || new DragUpEvent();
        events$.next(upEvent);
        dismiss$.next();
        // console.log(downEvent.distance);
        if (Math.abs(downEvent.distance.x) > 10) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        return upEvent;
      })
    );
  }

  static events$(target) {
    target = target || document;
    const events$ = new ReplaySubject(1);
    const dismiss$ = new Subject();
    return this.down$(target, events$).pipe(
      switchMap((downEvent) => merge(
        this.move$(target, events$, dismiss$, downEvent),
        this.up$(target, events$, dismiss$, downEvent)
      ).pipe(
        takeUntil(dismiss$)
      )),
      switchMap(() => events$)
    );
  }

}
