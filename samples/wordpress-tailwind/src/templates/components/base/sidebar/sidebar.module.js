import { setState } from '../../../../js/common/dataState';

const COOKIE_NAME = 'sidebar_state';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Sidebar: desktop collapse + mobile sheet, with the same state machine as
 * upstream's SidebarProvider.
 *
 * Desktop — data-state="expanded|collapsed" and data-collapsible on
 * [data-slot="sidebar"] drive every group-data-[...] utility in the template;
 * the choice is persisted in the `sidebar_state` cookie (7 days) and read back
 * at init, where it wins over the defaultOpen prop.
 * Mobile (matchMedia '(max-width: 767px)') — the sheet is filled once with a
 * clone of [data-slot="sidebar-inner"] (ids stripped so nothing is duplicated)
 * and opened through the sheet's own dialog.module with 'dialog:open'.
 *
 * Integration API:
 *   in    CustomEvent 'sidebar:toggle' / 'sidebar:open' / 'sidebar:close' on the root
 *   out   CustomEvent 'sidebar:changed' { open, mobile } (bubbles: true)
 *   hooks [data-slot="sidebar-trigger"] / [data-slot="sidebar-rail"] inside the wrapper,
 *         and Ctrl/Cmd+B anywhere in the page
 */
export default function SidebarModule(node) {
  const sidebar = node.querySelector('[data-slot="sidebar"]');
  const inner = node.querySelector('[data-slot="sidebar-inner"]');
  const sheet = node.querySelector('[data-slot="sheet"]');
  const sheetBody = node.querySelector('[data-slot="sidebar-mobile-body"]');
  // The wrapper keeps the configured mode; [data-slot="sidebar"] only carries it
  // while collapsed (upstream writes "" there when expanded).
  const collapsible = node.dataset.collapsible || 'offcanvas';

  const cleanups = [];
  const media = window.matchMedia(MOBILE_QUERY);
  let sheetFilled = false;

  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  const isMobile = () => media.matches && Boolean(sheet);
  const isCollapsible = () => Boolean(sidebar) && collapsible !== 'none';

  function readCookie() {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? match[1] : null;
  }

  function writeCookie(open) {
    document.cookie = `${COOKIE_NAME}=${open}; path=/; max-age=${COOKIE_MAX_AGE}`;
  }

  function isOpen() {
    return !isCollapsible() || sidebar.dataset.state !== 'collapsed';
  }

  function notify(open) {
    node.dispatchEvent(
      new CustomEvent('sidebar:changed', { bubbles: true, detail: { open, mobile: isMobile() } })
    );
  }

  /** Mirrors upstream: data-collapsible only carries a value while collapsed. */
  function setDesktop(open, { persist = true } = {}) {
    if (!isCollapsible()) return;
    setState(sidebar, open ? 'expanded' : 'collapsed');
    sidebar.dataset.collapsible = open ? '' : collapsible;
    if (persist) writeCookie(open);
    notify(open);
  }

  /** The sheet body is a clone of the desktop inner markup, built on first use. */
  function fillSheet() {
    if (sheetFilled || !sheetBody || !inner) return;
    const clone = inner.cloneNode(true);
    clone.removeAttribute('data-slot');
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.querySelectorAll('[data-slot="sidebar-rail"]').forEach((el) => el.remove());
    clone.className = 'flex h-full w-full flex-col bg-sidebar';
    sheetBody.replaceChildren(...clone.childNodes);
    sheetFilled = true;
  }

  function openMobile() {
    if (!sheet) return;
    fillSheet();
    sheet.dispatchEvent(new CustomEvent('dialog:open'));
    notify(true);
  }

  function closeMobile() {
    if (!sheet) return;
    sheet.dispatchEvent(new CustomEvent('dialog:close'));
    notify(false);
  }

  function isSheetOpen() {
    const dialog = sheet && sheet.querySelector('dialog');
    return Boolean(dialog && dialog.open);
  }

  function toggle() {
    if (isMobile()) {
      if (isSheetOpen()) closeMobile();
      else openMobile();
      return;
    }
    setDesktop(!isOpen());
  }

  function open() {
    if (isMobile()) openMobile();
    else setDesktop(true);
  }

  function close() {
    if (isMobile()) closeMobile();
    else setDesktop(false);
  }

  // Cookie wins over the rendered defaultOpen, without re-persisting it.
  const stored = readCookie();
  if (isCollapsible() && stored !== null) setDesktop(stored === 'true', { persist: false });

  on(node, 'click', (event) => {
    if (event.target.closest('[data-slot="sidebar-trigger"], [data-slot="sidebar-rail"]')) {
      event.preventDefault();
      toggle();
    }
  });
  on(document, 'keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      toggle();
    }
  });
  on(media, 'change', () => {
    if (!media.matches && isSheetOpen()) closeMobile();
  });

  on(node, 'sidebar:toggle', toggle);
  on(node, 'sidebar:open', open);
  on(node, 'sidebar:close', close);

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
