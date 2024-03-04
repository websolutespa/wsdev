import { fromEventPattern } from 'rxjs';

// adding the Event Listeners to all the li tasks
// addCustomEventListener('li#task','click',taskClickHandler);

export function fromSelectorEvent(selector, event) {

  const handler = (event) => {
    let targetElement = event.target;
    while (targetElement != null) {
      if (targetElement.matches(selector)) {
        handler(event);
        return;
      }
      targetElement = targetElement.parentElement;
    }
  };

  const body = document.querySelector('body');

  const addHandler = () => {
    body.addEventListener(event, handler, true); // !! true?
  };

  const removeHandler = () => {
    body.removeEventListener(event, handler);
  };

  return fromEventPattern(addHandler, removeHandler);

}

export function merge(target, source) {
  if (typeof source === 'object') {
    Object.keys(source).forEach(key => {
      const value = source[key];
      if (typeof value === 'object' && !Array.isArray(value)) {
        target[key] = merge(target[key], value);
      } else {
        target[key] = value;
      }
    });
  }
  return target;
}


// mutation observer

/*

const observer = new MutationObserver(function(mutations_list) {
  mutations_list.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(added_element) {
      if(added_element.id == 'child') {
        // console.log('#child has been added');
        observer.disconnect();
      }
    });
  });
});

observer.observe(document.querySelector("#parent"), { subtree: false, childList: true });

*/

// polyfills

/*

if (!Element.prototype.matches) {
  Element.prototype.matches =
  Element.prototype.msMatchesSelector ||
  Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
  var el = this;

  do {
    if (Element.prototype.matches.call(el, s)) return el;
    el = el.parentElement || el.parentElement;
  } while (el !== null && el.nodeType === 1);
  return null;
  };
}

*/
