# shadcn/ui → Twig porting conventions

Canonical brief for porting shadcn/ui components to this boilerplate. Reference
implementations: `src/templates/components/base/button/` (static pattern) and
`src/templates/components/base/card/` (block/slot pattern). Read them first.

**STYLE = `new-york-v4`** (overridable via `SHADCN_STYLE`). This sample has no
Storybook, no lab/gates pipeline and no ACF/CMS contract header — see
[`.claude/skills/shadcn-port/SKILL.md`](.claude/skills/shadcn-port/SKILL.md) for
the step-by-step pipeline and script list.

## Figma wins

The sample ships alongside the **shadcn/ui kit for Figma – Boilerplate**. A
**kit component** is one with a file in `tokens/figma-components/<name>.json`
(exported from the kit). For those, Figma's measured geometry/colors/radius
win over the upstream class string: replace ONLY the disagreeing utility
(e.g. `rounded-md` → `rounded-4xl`), never rewrite the whole string. Every
override is recorded in `scripts/upstream-exceptions.json` with
`"source": "figma"` and the Figma node id backing it. A component with no
Figma file is an **upstream-only component**: it follows the registry
byte-identical.

## Port exceptions

Some components have no faithful React/Radix equivalent on this platform (no
React, no Radix, no headless UI library) and are re-implemented with a
different dependency; their class strings are not comparable 1:1 to upstream.
Use `"source": "port"` in `scripts/upstream-exceptions.json`, justified in
`note`. Current cases: `calendar` (react-day-picker → `vanilla-calendar-pro`),
`chart` (recharts → `chart.js`), `progress` (inline transform → CSS custom
property set by the module), `combobox` (Base UI → `input-group` + `floating.js`
+ its own module), `select` (one popper-only Viewport utility dropped, see the
Adaptation table).

**Compositions** are a second reason to skip the gate: a component the registry
ships only as an example, never as a registry item, has no upstream to diff
against (`/r/styles/new-york-v4/<name>.json` → 404). They carry `@composition`
on the first line of their `{# params #}` header, borrow every class from the
components they embed, and get a `"from": "*"` entry so
`check-upstream-classes.mjs` skips them instead of failing on the fetch. Current
case: `date-picker` (popover + button + calendar).

## Files per component — `src/templates/components/base/<name>/`

| File | When |
|---|---|
| `<name>.twig` | always — markup + Tailwind class strings + `{# params #}` header |
| `<name>.twig.json` | always — mocks as `{ "mocks": { "<name>": { "default": {…}, "<scenario>": {…} } } }` |
| `<name>.module.js` | only if the component is interactive/stateful (contract below) |
| `<name>.css` | component-LOCAL CSS (keyframes, scoped rules); aggregated via `src/css/components.css`. Plain `.css` only — never `.scss` |

## Source of truth for class strings

Fetch the upstream component source from the shadcn registry:
`https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` → `files[0].content`
(a `.tsx` file; `node .claude/skills/shadcn-port/scripts/fetch-upstream.mjs <name>`
does this and caches the result). Copy every class string **byte-identical**
into the Twig variant maps. The ONLY allowed deviations are the Adaptation
table below, a Figma override, or a port exception. Do not invent or
"improve" classes.

## Twig template rules

1. **Header comment** (mandatory, first thing in the file): every parameter
   with type, allowed values and default: `variant?: 'default'|'destructive'
   as string (default: 'default')`.
2. **Variant maps**: mirror the CVA config as Twig hashes + a `base` string
   (`{% set <name>_variants = { 'default': '...', ... } %}`); defaults applied
   with `|default('default')`. See `button.twig`.
3. **data attributes**: emit `data-slot="<part>"` on every part exactly as
   upstream; `data-variant`/`data-size` where upstream has them.
4. **`class` prop**: appended LAST. Additive-only (no tailwind-merge in
   Twig). **`attrs` prop**: raw extra attributes via `{{ attrs|default('')|raw }}`.
5. **Composition**: props-first with sensible defaults; named `{% block %}`s
   for slot-like parts (header/content/footer…) so consumers can `{% embed %}`
   and override. Children that are inherently lists (accordion items, menu
   items, slides) are data-driven via arrays of objects — never embeds inside
   loops. Recursive structures (menus) use a private `{% macro %}` + `{% import
   _self as ... %}` in the same file.
6. **Includes**: always `{% include '@components/...' with {...} only %}`.
   Base components may include other base components only where upstream
   shadcn composes them (e.g. dialog footer → button).
7. **Icons**: lucide via sprite — `<svg aria-hidden="true"><use href="#icon-<name>"></use></svg>`.
   Available icons are the files in `src/assets/icons/`; download missing
   ones first: `curl -sfL -o src/assets/icons/<n>.svg https://unpkg.com/lucide-static@latest/icons/<n>.svg`.
8. **IDs**: optional `id?` prop. NEVER generate ids in Twig (no `random()`).
   Modules generate missing ids at init via `uid()`. Form components that need
   SSR `label[for]` require explicit `id`/`name` props.
9. **No class concatenation**: the Tailwind scanner must see literal class
   names. Map enums to full literal strings (`{'16_9': 'aspect-video'}`),
   never build `'aspect-[' ~ x ~ ']'`.
10. **Allowed Twig features** (identical on twig.js and Twig PHP):
    `include/embed/block/macro/import _self/set/for/if/extends`; filters
    `default, merge, join, raw, date, json_encode, trim, lower, upper,
    replace, split, first, last, length`; tests `defined, empty, iterable`.
    Nothing else without checking both engines.
11. Text content in mocks: Italian, realistic. Code, comments and identifiers:
    English.

## Adaptation table (the ONLY permitted divergences from upstream classes, besides Figma/port exceptions)

| Upstream | Replacement | Provided by |
|---|---|---|
| `--radix-<x>-content-transform-origin` | `--transform-origin` | `common/floating.js` |
| `--radix-<x>-content-available-height` | `--available-height` | `common/floating.js` |
| `--radix-<x>-content-available-width` | `--available-width` | `common/floating.js` |
| `--radix-select-trigger-width` / `-height` | `--anchor-width` / `--anchor-height` | `common/floating.js` |
| `--radix-navigation-menu-viewport-width` / `-height` | `--viewport-width` / `--viewport-height` | `common/floating.js` for anchored panels; in navigation-menu's viewport mode the module measures the active panel and writes them on the viewport itself |
| select viewport `h-[var(--radix-select-trigger-height)]` | dropped | popper-only Radix sizing with no runtime here; see the `select` port exception |
| `--radix-accordion-content-height` | KEPT as-is | accordion module sets it; keyframes come from `src/css/shadcn.css` |
| `data-[state=checked]:` on native inputs | `checked:` (self) / `peer-checked:` (sibling) / `has-checked:` (ancestor wrapping the input, e.g. switch's `<label>` root) | CSS only |
| `focus-visible:`/`disabled:` on an upstream root that becomes a non-focusable wrapper (e.g. switch's `<label>`) | `focus-within:`/`has-disabled:` | CSS only |
| lucide `<XIcon />` JSX | sprite `<svg aria-hidden="true"><use href="#icon-x"></use></svg>` | icon sprite |
| Radix Portal wrappers | none needed (top layer / DOM position) | — |
| dialog overlay `<div>` | `backdrop:` utilities on `<dialog>` | see `dialog.twig` |
| `data-[vaul-drawer-direction=x]` / `group-data-[vaul-drawer-direction=x]/drawer-content` | `data-[direction=x]` / `group-data-[direction=x]/drawer-content` | `drawer.twig` sets the static `data-direction` attribute (no drag library on this platform, see ADR 0002) |

Everything else — `data-state="open|closed|active|on|off|checked"`, `data-side`,
`data-align`, `data-inset`, `data-disabled`, `group-*`, `peer-*` — stays
byte-identical; the JS modules set those attributes at runtime.

## JS module contract

`<name>.module.js` default-exports `function Module(node) { ...; return dispose }`.
Loaded via `data-module="<name>.module"` on the component root
(IntersectionObserver). Collect every listener and return a `dispose` that
removes them. Modules import shared utilities with relative paths
(`../../../../js/common/<util>`):

| Utility | API |
|---|---|
| `uid.js` | `uid(prefix) → 'prefix-n'` |
| `dataState.js` | `setState(node, state)`, `closeWithAnimation(node, done, {state, timeout})` — waits for exit animation |
| `scrollLock.js` | `lockScroll()` / `unlockScroll()` (ref-counted) |
| `focus.js` | `getFocusable(root)`, `focusFirst(root)`, `saveFocus() → restore()` |
| `dismiss.js` | `pushDismissLayer({onDismiss, outsideClick, escape, exclude}) → release()` — layered ESC/outside-click |
| `keynav.js` | `createRovingNav(container, {itemSelector, orientation, loop, mode: 'roving'\|'activedescendant', typeahead, bindKeys, onActivate, onFocusChange})` → `{setActive, focusFirst, focusLast, handleKey, getItems, getActive, clearActive, destroy}` |
| `menuTree.js` | `createMenuTree(root, {prefix, sideOffset, subOffset, onSelect, onOpen, onClose, onHorizontal}) → {open, close, isOpen, getAnchor, focusFirst, focusLast, destroy}` — the open-panel machinery of the Radix menu families (levels, roving nav, typeahead, submenus, checkbox/radio indicators, one dismiss layer); used by dropdown-menu, context-menu and menubar |
| `floating.js` | `createFloating(anchor, panel, {placement, offset, flip, shift, arrow, matchWidth, strategy}) → {update, destroy}` — writes `data-side`/`data-align`/`--transform-origin`/`--available-height`/`--available-width`/`--anchor-width`/`--anchor-height`/`--viewport-width`/`--viewport-height` |
| `toast.js` | `toast(msg, opts)`, `toast.success/error/...`, `toast.dismiss(id)`, `subscribe(fn)` |

Native APIs first: `<dialog>` + `showModal` for modal overlays, native inputs
for form controls. ARIA per WAI-ARIA APG. Set `data-state` etc. so upstream
animation classes work.

## Integration API

Public contract for how host pages/blocks talk to a component's module,
without a `window.*` global.

| Direction | Shape | Examples |
|---|---|---|
| Incoming command | `CustomEvent('<component>:<verb>')` dispatched on the component root | `dialog:open`, `dialog:close`, `sheet:open` |
| Outgoing notification | `CustomEvent('<component>:<past-participle>', { bubbles: true, detail })` | `dialog:opened`, `dialog:closed`, `menu:select`, `tabs:change`, `select:change`, `form:submitted` (`{ native: true }` or `{ ok, status, data }`), `form:invalid` (`{ invalid: string[] }`), `form:error` (`{ error }`, fetch submission network failure) |
| Declarative open/close hooks | attributes read by the module at init, no JS wiring needed | `[data-<comp>-open="<id>"]`, `[data-<comp>-close]` |
| Toasts | imperative function, not an event | `toast()` from `src/js/common/toast.js` |

Every module documents in its own header which events it emits/consumes. No
component reads or writes `window.*`.

## Reference implementation

`C:\Users\m.carletti\source\repos\area-broker\client` ported the full shadcn/ui
library to this same Twig + vanilla JS architecture first, for a single brand.
Rule: **copy and audit its `.module.js` files, never copy its class strings**
(they carry brand-specific overrides). When porting an interactive component,
start from the matching area-broker module (`src/js/common/*.js`,
`src/templates/components/base/<name>/<name>.module.js`), adapt it to this
sample's upstream `data-slot`s, and verify parity with the upstream React
component's states, keyboard behaviour and events.

## Where CSS goes

Design tokens (`--ws-*`, `@theme`) and reusable `@utility` rules stay in
`src/css/globals.css`. Component-local rules (keyframes, one-off scoped
selectors) go in the component's own `<name>.css`, aggregated into the bundle
via `src/css/components.css`. No `.scss` anywhere in this sample.

## Mock data rules

- One scenario per variant and per relevant state (disabled, invalid, open,
  checked…) in `<name>.twig.json`.
- Realistic Italian copy; no lorem ipsum.
- Visual configuration (variants, sizes) stays a Twig param — never a mock
  field pretending to be CMS content.

## Definition of done per component

1. `npm run check:classes -- <name>` exits 0 (MISSING = 0; review EXTRA).
2. `{# params #}` header complete and typed; every documented `default:` has
   the matching `|default(...)` in the body.
3. All upstream `data-slot` parts present; `class` appended last; `attrs` raw;
   no class concatenation.
4. Mock for every variant/state; renders in light and dark with zero
   Twig/console errors.
5. Module (if any) returns a working `dispose`; ARIA per APG; full keyboard
   support.
6. Entry present in `src/docs/components.twig.json`.
