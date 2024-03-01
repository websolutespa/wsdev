import { fromEvent, merge } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';

export class KeyboardService {

  static keys = {};

  static keydown$() {
    if (!this.keydown$_) {
      this.keydown$_ = fromEvent(window, 'keydown').pipe(
        shareReplay(1)
      );
    }
    return this.keydown$_;
  }

  static keyup$() {
    if (!this.keyup$_) {
      this.keyup$_ = fromEvent(window, 'keyup').pipe(
        shareReplay(1)
      );
    }
    return this.keyup$_;
  }

  static keys$() {
    if (!this.keys$_) {
      this.keys$_ = merge(this.keydown$(), this.keyup$()).pipe(
        map(event => {
          const keys = this.keys;
          if (event.type === 'keydown') {
            keys[event.key] = true;
          } else {
            delete keys[event.key];
          }
          return this.keys;
        }),
        startWith(this.keys),
        shareReplay(1)
      );
    }
    return this.keys$_;
  }

  static key$() {
    if (!this.key$_) {
      const regexp = /\w/;
      this.key$_ = this.keydown$().pipe(
        filter(event => event.key && event.key.match(regexp)),
        map(event => event.key),
        shareReplay(1)
      );
    }
    return this.key$_;
  }

  static typing$() {
    if (!this.typing$_) {
      let typing = '',
        to;
      this.typing$_ = this.key$().pipe(
        map(key => {
          if (to) {
            clearTimeout(to);
          }
          typing += key;
          to = setTimeout(() => {
            typing = '';
          }, 1500);
          return typing;
        }),
        shareReplay(1)
      );
    }
    return this.typing$_;
  }

}
