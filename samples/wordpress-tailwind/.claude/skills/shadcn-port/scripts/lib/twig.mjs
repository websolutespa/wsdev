/**
 * twig.mjs — Twig-side token extraction for the upstream-classes gate.
 *
 * Pulls whitespace-split tokens out of `class="..."` attributes and every
 * quoted string literal inside `{% ... %}` tags and `{{ ... }}` prints,
 * skipping embedded Twig expressions so they don't glue literal text
 * together. Regex-based on purpose: no Twig parser dependency.
 */

/** Replaces `{{ ... }}` and `{% ... %}` spans with a single space. */
function stripTwigExpressions(text) {
  return text.replace(/\{\{[\s\S]*?\}\}/g, ' ').replace(/\{%[\s\S]*?%\}/g, ' ');
}

/** @param {string} text @returns {string[]} every quoted ('...' or "...") string's inner text */
function extractQuotedStrings(text) {
  const out = [];
  const re = /(["'])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let m;
  while ((m = re.exec(text))) out.push(m[2]);
  return out;
}

/** @param {string} str @returns {string[]} whitespace-split, empty-filtered tokens */
function tokensFrom(str) {
  return str.trim().split(/\s+/).filter(Boolean);
}

/**
 * Extracts the full set of whitespace-split tokens present in a Twig
 * component source: every `class="…"`/`class='…'` attribute (literal
 * portions only — embedded `{{ }}`/`{% %}` is stripped first), every quoted
 * string inside a `{% ... %}` tag (covers `{% set x = "..." %}` and hash
 * literals like `{% set x = { key: "a b c" } %}`), and every quoted string
 * inside a `{{ ... }}` print.
 * @param {string} source - the `<name>.twig` file content
 * @returns {Set<string>} the token set
 */
export function extractTwigClassTokens(source) {
  const tokens = new Set();

  const classAttrRe = /class\s*=\s*(["'])((?:(?!\1)[\s\S])*)\1/g;
  let m;
  while ((m = classAttrRe.exec(source))) {
    for (const t of tokensFrom(stripTwigExpressions(m[2]))) tokens.add(t);
  }

  const tagRe = /\{%([\s\S]*?)%\}/g;
  while ((m = tagRe.exec(source))) {
    for (const lit of extractQuotedStrings(m[1])) {
      for (const t of tokensFrom(lit)) tokens.add(t);
    }
  }

  const printRe = /\{\{([\s\S]*?)\}\}/g;
  while ((m = printRe.exec(source))) {
    for (const lit of extractQuotedStrings(m[1])) {
      for (const t of tokensFrom(lit)) tokens.add(t);
    }
  }

  return tokens;
}

/**
 * Extracts the full set of `data-slot` values a Twig component source
 * accounts for: literal `data-slot="..."` attributes, PLUS the two ways
 * `slot?` params (button.twig/separator.twig/label.twig, PORTING.md §slot
 * override) resolve to one at render time — a `slot: '<value>'` key passed
 * into an `{% include %}`/`{% embed %}` hash, and the `slot|default('<value>')`
 * fallback literal inside the anchor component's own `data-slot="{{ ... }}"`.
 * @param {string} source @returns {string[]} distinct values, sorted
 */
export function extractTwigDataSlots(source) {
  const slots = new Set();
  const literalRe = /data-slot=["']([^"']+)["']/g;
  let m;
  while ((m = literalRe.exec(source))) slots.add(m[1]);

  const slotParamRe = /\bslot\s*:\s*(["'])([^"']+)\1/g;
  while ((m = slotParamRe.exec(source))) slots.add(m[2]);

  const slotDefaultRe = /slot\s*\|\s*default\(\s*(["'])([^"']+)\1\s*\)/g;
  while ((m = slotDefaultRe.exec(source))) slots.add(m[2]);

  return [...slots].sort();
}
