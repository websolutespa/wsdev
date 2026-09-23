# Keyboard checklist (WAI-ARIA APG)

Per-component keyboard behaviour to verify on the component's Storybook stories (`npm run storybook`, `Base/<Name>`) before closing step 7 of the porting pipeline. One line per key behaviour; check every scenario story, not just "Default".

## dialog / alert-dialog / sheet / drawer

- Trigger opens the panel; focus moves inside it (to the first focusable element or an explicit `autofocus` target).
- `Tab` / `Shift+Tab` cycle only within the panel (focus trap); they never reach the page behind it.
- `Escape` closes the panel (alert-dialog: only when not `data-static`).
- Closing returns focus to the element that opened it.
- Clicking the backdrop closes the panel (dialog/sheet/drawer; alert-dialog and `data-static` panels do not close on backdrop click).

## dropdown-menu / context-menu / menubar

- `Enter` / `Space` / `ArrowDown` on the trigger opens the menu and focuses the first item.
- `ArrowUp` opens the menu focused on the last item (dropdown-menu/menubar).
- `ArrowDown` / `ArrowUp` move focus between items, wrapping at the ends.
- `ArrowRight` / `ArrowLeft` open/close a submenu and move focus accordingly.
- Typing a character jumps focus to the next matching item (typeahead).
- `Enter` / `Space` activates the focused item; `Escape` closes the menu and returns focus to the trigger.
- context-menu: right-click (or the keyboard menu key / `Shift+F10`) opens at the pointer/target position.
- menubar: `ArrowLeft` / `ArrowRight` move between top-level menus, keeping one open if any was open.

## select

- `Enter` / `Space` / `ArrowDown` / `ArrowUp` on the trigger opens the listbox.
- `ArrowDown` / `ArrowUp` move the highlighted option, wrapping at the ends.
- Typing a character jumps to the next option starting with it.
- `Enter` / `Space` selects the highlighted option and closes the listbox.
- `Escape` closes the listbox without changing the selection.
- The hidden native `<select>` stays in sync so form submission works without JS.

## combobox

- Typing in the input filters the option list and opens it.
- `ArrowDown` / `ArrowUp` move the highlighted option without leaving the input.
- `Enter` selects the highlighted option; `Escape` closes the list and keeps the previous value.
- `Tab` closes the list and commits the highlighted (or typed) value.

## command

- Typing filters the command list live; the first visible item is highlighted.
- `ArrowDown` / `ArrowUp` move the highlighted item across groups, wrapping at the ends.
- `Enter` runs the highlighted item; `Escape` closes the palette (if used inside a dialog).
- Grouped results announce their group heading to assistive tech (`role="group"` + `aria-label`).

## tabs

- Arrow keys (`ArrowLeft`/`ArrowRight`, or `ArrowUp`/`ArrowDown` if vertical) move focus AND selection between tabs, wrapping at the ends.
- `Home` / `End` jump to the first / last tab.
- Only the selected tab is in the `Tab` order (roving `tabindex`); panels are reachable by `Tab` from the active tab.

## accordion / collapsible

- `Enter` / `Space` on the trigger toggles the panel.
- `ArrowDown` / `ArrowUp` move focus between accordion triggers (single accordion pattern), wrapping at the ends.
- `Home` / `End` jump focus to the first / last trigger.
- Collapsed panels are removed from the `Tab` order (not just visually hidden).

## toggle / toggle-group

- `Enter` / `Space` toggles the pressed state and updates `aria-pressed`.
- toggle-group (single): arrow keys move focus and, if `roving`, selection between items.
- toggle-group (multiple): each item toggles independently; arrow keys still move focus (roving `tabindex`).

## checkbox / radio-group / switch / slider

- checkbox / switch: `Space` toggles the checked state.
- radio-group: arrow keys move focus AND selection between radios in the group, wrapping at the ends; `Tab` enters/leaves the group as a single stop.
- slider: `ArrowLeft`/`ArrowRight` (or `ArrowDown`/`ArrowUp`) change the value by one step; `Home`/`End` jump to min/max; `PageUp`/`PageDown` change by a larger step; range sliders move only the focused thumb.

## input-otp

- Typing a digit fills the focused cell and advances focus to the next one.
- `Backspace` clears the focused cell and, if already empty, moves focus back and clears the previous one.
- `ArrowLeft` / `ArrowRight` move focus between cells without altering their value.
- Pasting a full code fills every cell and focuses the last one.

## tooltip / hover-card

- Focusing the trigger (keyboard) shows the tooltip/card after its open delay; blurring hides it immediately.
- `Escape` dismisses it without moving focus off the trigger.
- Hovering with the mouse shows/hides it on the same delays; moving into a hover-card's own content keeps it open.

## popover

- `Enter` / `Space` on the trigger opens the popover and moves focus inside it.
- `Escape` closes it and returns focus to the trigger.
- Clicking (or tabbing) outside the popover closes it without trapping focus.

## navigation-menu

- `ArrowRight` / `ArrowLeft` move focus between top-level items.
- `ArrowDown` (or `Enter`/`Space`) opens the focused item's panel and moves focus to its first link.
- `Escape` closes the open panel and returns focus to its trigger.
- `Tab` from an open panel's last link closes the panel and moves to the next top-level item.

## sidebar

- The documented shortcut (`⌘/Ctrl+B`) toggles the sidebar without moving focus unexpectedly.
- When collapsed to icons, each trigger still has an accessible name (via tooltip or `aria-label`).
- On mobile (sheet variant), the same focus-trap and `Escape`-to-close rules as `dialog` apply.

## carousel

- The prev/next controls are reachable by `Tab` and activate with `Enter`/`Space`.
- `ArrowLeft` / `ArrowRight` move to the previous/next slide when the carousel region has focus.
- Slide indicators (if present) are keyboard-operable and reflect the current slide via `aria-current`.

## calendar / date-picker

- Arrow keys move the focused day by one day (`ArrowLeft`/`ArrowRight`) or one week (`ArrowUp`/`ArrowDown`).
- `PageUp` / `PageDown` move to the previous/next month; with `Shift`, the previous/next year.
- `Home` / `End` jump to the first/last day of the visible week.
- `Enter` / `Space` selects the focused day; date-picker also closes the popover and returns focus to its trigger.

## resizable

- The handle is reachable by `Tab` and shows a visible focus indicator.
- `ArrowLeft`/`ArrowRight` (horizontal) or `ArrowUp`/`ArrowDown` (vertical) resize the adjacent panes by a fixed step.
- The current split is announced or otherwise exposed to assistive tech (e.g. `aria-valuenow` if modeled as a slider).

## sonner

- Toasts do not steal focus when they appear.
- An action button inside a toast is reachable by `Tab` and activates with `Enter`/`Space`.
- Dismiss controls (if any) are keyboard-operable; auto-dismissed toasts don't leave focus stranded.

## message-scroller

- Arrow keys / `Page Up` / `Page Down` scroll the message list when it has focus.
- `Home` / `End` jump to the oldest/newest message.
- New messages arriving don't steal focus from an input the user is typing in.
