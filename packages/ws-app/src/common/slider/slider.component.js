
import { BehaviorSubject, EMPTY, fromEvent, interval, merge, of, Subject } from 'rxjs';
import { filter, map, startWith, takeUntil, tap, throttleTime } from 'rxjs/operators';
/*
import img01 from '../../../assets/01.jpg?w=1600&h=800&webp';
import img02 from '../../../assets/02.jpg?w=1600&h=800&webp';
import img03 from '../../../assets/03.jpg?w=1600&h=800&webp';
import img04 from '../../../assets/04.jpg?w=1600&h=800&webp';
*/
import { Component } from '../../core/component/component';
import { DragDownEvent, DragMoveEvent, DragService, DragUpEvent } from '../drag/drag.service';
import { KeyboardService } from '../keyboard/keyboard.service';
import './slider.component.scss';

// console.log(img01, img02, img03, img04);

export class SliderComponent extends Component {

  get items() {
    return this.items_ || [];
  }
  set items(items) {
    if (this.items_ !== items) {
      this.items_ = items;
    }
  }

  get current() {
    return this.current_;
  }
  set current(current = 0) {
    if (this.current_ !== current) {
      this.current_ = current;
      this.items.forEach((item, i) => {
        i === current ? item.node.classList.add('active') : item.node.classList.remove('active');
      });
      current === 0 ? this.node.classList.add('first') : this.node.classList.remove('first');
      current >= this.items.length - 1 ? this.node.classList.add('last') : this.node.classList.remove('last');
      this.updatePosition();
      this.current$.next(current);
      // console.log('SliderComponent.current.set', current);
    }
  }

  get currentLabel() {
    return this.current + 1;
  }

  get totalLabel() {
    return this.items.length;
  }

  get wrapperStyle() {
    return { 'transform': 'translate3d(' + -100 * this.current_ + '%, 0, 0)' };
  }

  get innerStyle() {
    return { 'width': 100 * this.items.length + '%' };
  }

  get isInViewport() {
    return this.rect &&
      this.rect.top < window.innerHeight &&
      this.rect.bottom > 0;
  }

  setWrapperX(x) {
    this.wrapper.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  getTranslation(node, container) {
    let x = 0,
      y = 0,
      z = 0;
    const transform = node.style.transform;
    if (transform) {
      const coords = transform.split('(')[1].split(')')[0].split(',');
      x = parseFloat(coords[0]);
      y = parseFloat(coords[1]);
      z = parseFloat(coords[2]);
      x = coords[0].indexOf('%') !== -1 ? x *= container.offsetWidth * 0.01 : x;
      y = coords[1].indexOf('%') !== -1 ? y *= container.offsetHeight * 0.01 : y;
    }
    return { x, y, z };
  }

  onInit() {
    const node = this.node;
    const options = this.options = {
      autoplay: false,
      centered: false,
      wheel: false,
      keyboard: true,
      slidePerView: 1,
      gutter: 0,
    };
    if (node.hasAttribute('autoplay')) {
      options.autoplay = true;
    }
    if (node.hasAttribute('centered')) {
      options.centered = true;
    }
    if (node.hasAttribute('wheel')) {
      options.wheel = true;
    }
    this.container = node;
    this.wrapper = node.querySelector('.slider__wrapper');
    this.inner = node.querySelector('.slider__inner');
    this.items = Array.prototype.slice.call(node.querySelectorAll('.slider__slide')).map((node, i) => {
      return { node };
    });
    this.current$ = new BehaviorSubject(this.current_);
    this.userGesture$ = new Subject();
    setTimeout(() => {
      this.onInitSlider();
    }, 1);
    node.slider = this;
  }

  onInitSlider() {
    // console.log('SliderComponent.onInit', this.items);
    this.listeners$().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe();
    this.current = 0;
  }

  listeners$() {
    return merge(
      this.resize$(),
      this.scroll$(),
      this.keyboard$(),
      this.wheel$(),
      this.slider$(),
      this.autoplay$(),
      this.prev$(),
      this.next$()
    );
  }

  slider$() {
    let translation, dragDownEvent, dragMoveEvent;
    const container = this.node;
    const wrapper = this.wrapper;
    return DragService.events$(wrapper).pipe(
      tap((event) => {
        if (event instanceof DragDownEvent) {
          translation = this.getTranslation(wrapper, container);
          dragDownEvent = event;
        } else if (event instanceof DragMoveEvent) {
          dragMoveEvent = this.onDragMoveEvent(dragDownEvent, event, translation);
        } else if (event instanceof DragUpEvent) {
          if (dragMoveEvent) {
            this.onDragUpEvent(dragDownEvent, dragMoveEvent);
          }
        }
      })
    );
  }

  onDragMoveEvent(dragDownEvent, dragMoveEvent, translation) {
    this.container.classList.add('dragging');
    const transformX = translation.x + dragMoveEvent.distance.x;
    this.setWrapperX(transformX);
    return dragMoveEvent;
  }

  onDragUpEvent(dragDownEvent, dragMoveEvent) {
    this.container.classList.remove('dragging');
    this.wrapper.style.transform = null;
    const width = this.container.offsetWidth;
    if (dragMoveEvent.distance.x * -1 > width * 0.25 && this.hasNext()) {
      this.navTo(this.current + 1);
    } else if (dragMoveEvent.distance.x * -1 < width * -0.25 && this.hasPrev()) {
      this.navTo(this.current - 1);
    } else {
      this.setWrapperX(this.current * this.rect.width * -1);
    }
  }

  updateItems() {
    const container = this.node;
    const wrapper = this.wrapper;
    const rect = this.rect;
    const options = this.options;
    container.classList.add('dragging');
    wrapper.style.transform = null;
    if (this.to_) {
      clearTimeout(this.to_);
    }
    this.items.forEach((item, i) => {
      const itemNode = item.node;
      if (options.slidePerView !== 'auto') {
        const slidePerView = options.slidePerView;
        const gutter = options.gutter;
        const width = (rect.width - gutter * (Math.floor(slidePerView) - 1)) / slidePerView;
        itemNode.style.width = `${width}px`;
        const itemRect = itemNode.getBoundingClientRect();
        item.left = (width + gutter) * i;
        item.width = width;
        item.top = itemRect.top - rect.top;
        item.height = itemRect.height;
      } else {
        const itemRect = itemNode.getBoundingClientRect();
        item.left = itemRect.left - rect.left;
        item.width = itemRect.width;
        item.top = itemRect.top - rect.top;
        item.height = itemRect.height;
      }
      // console.log('SliderComponent.updateItems', position, rect, itemRect);
    });
    // console.log('SliderComponent.updateItems');
    this.updatePosition();
    this.to_ = setTimeout(() => {
      container.classList.remove('dragging');
    }, 150);
  }

  updatePosition() {
    const current = this.current_;
    const rect = this.rect;
    const item = this.items[current];
    const options = this.options;
    if (item) {
      const cx = (options.centered ? (item.width - rect.width) / 2 : 0);
      const x = (item.left + cx) * -1;
      this.setWrapperX(x);
      // console.log('SliderComponent.updatePosition', current, x, cx, item.left, rect.width, item.width);
    }
  }

  resize$() {
    const node = this.node;
    return fromEvent(window, 'resize').pipe(
      startWith(true),
      tap(_ => {
        const rect = node.getBoundingClientRect();
        this.rect = rect;
        this.updateItems();
      })
    );
  }

  scroll$() {
    const node = this.node;
    return fromEvent(window, 'scroll').pipe(
      tap(_ => {
        const rect = node.getBoundingClientRect();
        this.rect = rect;
      })
    );
  }

  keyboard$() {
    const options = this.options;
    return KeyboardService.keys$().pipe(
      filter(_ => options.keyboard && this.isInViewport),
      tap(keys => {
        // console.log('SliderComponent', keys);
        if (keys.ArrowRight && this.hasNext()) {
          this.navTo(this.current + 1);
        }
        if (keys.ArrowLeft && this.hasPrev()) {
          this.navTo(this.current - 1);
        }
      })
    );
  }

  wheel$() {
    const node = this.node;
    const options = this.options;
    return fromEvent(window, 'wheel', { passive: false }).pipe(
      filter(_ => options.wheel && this.isInViewport),
      map(event => {
        let delta = event.deltaY;
        const rect = node.getBoundingClientRect();
        const cy = (rect.top + rect.height / 2) - window.innerHeight / 2;
        // console.log('SliderComponent.wheel$', delta, this.hasNext(), this.hasPrev());
        if (delta > 0) {
          if (this.hasNext()) {
            event.preventDefault();
            if (cy > 10) {
              const dy = Math.abs(cy);
              const my = Math.min(dy, delta);
              window.scrollTo(0, window.pageYOffset + my);
              delta = 0;
            }
          }
        } else if (delta < 0) {
          if (this.hasPrev()) {
            event.preventDefault();
            if (cy < 10) {
              const dy = Math.abs(cy);
              const my = Math.min(dy, Math.abs(delta));
              window.scrollTo(0, window.pageYOffset - my);
              delta = 0;
            }
          }
        }
        return delta;
      }),
      throttleTime(500),
      tap(delta => {
        if (delta > 0 && this.hasNext()) {
          this.navTo(this.current + 1);
        }
        if (delta < 0 && this.hasPrev()) {
          this.navTo(this.current - 1);
        }
      })
    );
  }

  autoplay$() {
    const options = this.options;
    if (options.autoplay) {
      const autoplay = typeof options.autoplay === 'number' ? options.autoplay : 4000;
      return interval(autoplay).pipe(
        takeUntil(this.userGesture$),
        tap(() => {
          this.current = (this.current + 1) % this.items.length;
        })
      );
    } else {
      return of(null);
    }
  }

  prev$() {
    const node = this.node;
    const prev = node.querySelector('.btn--prev');
    if (prev) {
      return fromEvent(prev, 'click').pipe(
        tap(_ => {
          // console.log('prev');
          if (this.hasPrev()) {
            this.navTo(this.current - 1);
          }
        })
      );
    } else {
      return EMPTY;
    }
  }

  next$() {
    const node = this.node;
    const next = node.querySelector('.btn--next');
    if (next) {
      return fromEvent(next, 'click').pipe(
        tap(_ => {
          // console.log('next');
          if (this.hasNext()) {
            this.navTo(this.current + 1);
          }
        })
      );
    } else {
      return EMPTY;
    }
  }

  navTo(current) {
    this.current = current;
    this.userGesture$.next();
  }

  hasPrev() {
    return this.current - 1 >= 0;
  }

  hasNext() {
    return this.current + 1 < this.items.length;
  }

  setPercent(percent) {
    percent = Math.max(0, Math.min(1, percent + (1 / this.items.length * 0.5)));
    const current = Math.min(this.items.length - 1, Math.floor(this.items.length * percent));
    if (this.current_ !== current) {
      this.current = current;
      this.userGesture$.next();
    }
  }

  static meta = {
    selector: '[data-slider]',
  };
}
