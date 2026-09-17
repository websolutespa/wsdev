/**
 * Keyboard navigation for composite widgets (WAI-ARIA APG):
 * - mode 'roving': roving tabindex, focus moves between items (menus, tabs, toolbars)
 * - mode 'activedescendant': focus stays on the controller (e.g. combobox input),
 *   aria-activedescendant + data-highlighted track the active option
 * Plus Home/End and label-prefix typeahead.
 */
export function createRovingNav(container, options = {}) {
  const {
    itemSelector,
    orientation = 'vertical',
    loop = true,
    mode = 'roving',
    typeahead = true,
    bindKeys = true,
    onActivate = () => {},
    onFocusChange = () => {},
  } = options;

  let activeItem = null;
  let typeBuffer = '';
  let typeTimer = null;

  const isDisabled = (node) =>
    node.hasAttribute('disabled') ||
    node.getAttribute('aria-disabled') === 'true' ||
    node.hasAttribute('data-disabled');

  const getItems = () => Array.from(container.querySelectorAll(itemSelector)).filter((node) => !isDisabled(node));

  function setActive(item, { focus = true } = {}) {
    if (!item) return;
    activeItem = item;
    if (mode === 'roving') {
      getItems().forEach((node) => {
        node.tabIndex = node === item ? 0 : -1;
      });
      if (focus) item.focus();
    } else {
      container.setAttribute('aria-activedescendant', item.id || '');
      getItems().forEach((node) => {
        if (node === item) {
          node.setAttribute('data-highlighted', '');
        } else {
          node.removeAttribute('data-highlighted');
        }
      });
      item.scrollIntoView({ block: 'nearest' });
    }
    onFocusChange(item);
  }

  function currentIndex(items) {
    if (activeItem && items.includes(activeItem)) return items.indexOf(activeItem);
    if (mode === 'roving' && items.includes(document.activeElement)) {
      return items.indexOf(document.activeElement);
    }
    return -1;
  }

  function move(delta) {
    const items = getItems();
    if (items.length === 0) return;
    const index = currentIndex(items);
    let next;
    if (index === -1) {
      next = delta > 0 ? 0 : items.length - 1;
    } else if (loop) {
      next = (index + delta + items.length) % items.length;
    } else {
      next = Math.min(items.length - 1, Math.max(0, index + delta));
    }
    setActive(items[next]);
  }

  const focusFirst = () => setActive(getItems()[0]);
  const focusLast = () => setActive(getItems().at(-1));

  function handleTypeahead(key) {
    clearTimeout(typeTimer);
    typeBuffer += key.toLowerCase();
    typeTimer = setTimeout(() => {
      typeBuffer = '';
    }, 1000);
    const items = getItems();
    const start = Math.max(0, currentIndex(items));
    const ordered = items.slice(start + (typeBuffer.length === 1 ? 1 : 0)).concat(items.slice(0, start));
    const match = ordered.find((node) => (node.textContent || '').trim().toLowerCase().startsWith(typeBuffer));
    if (match) setActive(match);
  }

  /** Returns true when the event was handled. */
  function handleKey(event) {
    const horizontal = orientation === 'horizontal';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        move(1);
        return true;
      case prevKey:
        event.preventDefault();
        move(-1);
        return true;
      case 'Home':
        event.preventDefault();
        focusFirst();
        return true;
      case 'End':
        event.preventDefault();
        focusLast();
        return true;
      case 'Enter':
      case ' ': {
        const target = mode === 'roving' ? (activeItem || document.activeElement) : activeItem;
        if (target && getItems().includes(target)) {
          event.preventDefault();
          onActivate(target);
          return true;
        }
        return false;
      }
      default:
        if (typeahead && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
          handleTypeahead(event.key);
          return true;
        }
        return false;
    }
  }

  const onContainerKeydown = (event) => handleKey(event);
  if (bindKeys) container.addEventListener('keydown', onContainerKeydown);

  return {
    setActive,
    focusFirst,
    focusLast,
    handleKey,
    getItems,
    getActive: () => activeItem,
    clearActive: () => {
      activeItem = null;
      if (mode === 'activedescendant') {
        container.removeAttribute('aria-activedescendant');
        getItems().forEach((node) => node.removeAttribute('data-highlighted'));
      }
    },
    destroy: () => {
      if (bindKeys) container.removeEventListener('keydown', onContainerKeydown);
      clearTimeout(typeTimer);
    },
  };
}
