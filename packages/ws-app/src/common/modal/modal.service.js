import { EMPTY, from, map, of, Subject, switchMap, tap } from 'rxjs';

export const ModalType = {
  Popup: 'popup',
  Info: 'info',
  Alert: 'alert',
  Dialog: 'dialog',
  Sidebar: 'sidebar',
};

export const ModalPosition = {
  Centered: 'centered',
  TopLeft: 'top-left',
  Top: 'top',
  TopRight: 'top-right',
  Right: 'right',
  BottomRight: 'bottom-right',
  Bottom: 'bottom',
  BottomLeft: 'bottom-left',
  Left: 'left',
};

export class ModalEvent {

  constructor(data) {
    this.data = data;
  }

}

export class ModalResolveEvent extends ModalEvent { }
export class ModalRejectEvent extends ModalEvent { }

export class ModalService {

  static hasModal = false;

  static open$(modal) {
    modal.id = new Date().getTime();
    modal.type = modal.type || ModalType.Popup;
    modal.position = modal.position || ModalPosition.Centered;
    switch (modal.type) {
      case ModalType.Alert:
        modal.acceptMessage = modal.acceptMessage || 'Ok';
        break;
      case ModalType.Dialog:
        modal.acceptMessage = modal.acceptMessage || 'Accept';
        modal.rejectMessage = modal.rejectMessage || 'Reject';
        break;
    }
    this.busy$.next(true);
    return this.getTemplate$(modal).pipe(
      // startWith(new ModalLoadEvent(Object.assign({}, modal.data, { $src: modal.src }))),
      map(template => {
        return { element: this.getElement(template), data: modal.data, modal: modal };
      }),
      tap(x => {
        // console.log(x);
        this.modal$.next(x);
        if (modal.type === ModalType.Info) {
          setTimeout(() => {
            this.resolve(modal.data);
          }, modal.duration || 4000);
        }
        this.hasModal = true;
        this.busy$.next(false);
        // this.events$.next(new ModalLoadedEvent(Object.assign({}, modal.data, { $src: modal.src })));
      }),
      switchMap(x => this.events$),
      tap(_ => this.hasModal = false)
    );
  }

  static load$(modal) {

  }

  static getTemplate$(modal) {
    if (modal.src) {
      return from(fetch(modal.src).then(response => {
        return response.text();
      }));
    } else if (modal.template) {
      return of(modal.template);
    } else {
      // !! return default template by types
      return EMPTY;
    }
  }

  static getElement(template) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');
    return doc.body.firstElementChild;
    /*
    // console.log(doc.body);
    const div = document.createElement('div');
    div.innerHTML = template;
    const element = div.firstElementChild;
    return element;
    */
  }

  static reject(data) {
    this.modal$.next(null);
    this.events$.next(new ModalRejectEvent(data));
  }

  static resolve(data) {
    this.modal$.next(null);
    this.events$.next(new ModalResolveEvent(data));
  }

}

ModalService.modal$ = new Subject();
ModalService.events$ = new Subject();
ModalService.busy$ = new Subject();
