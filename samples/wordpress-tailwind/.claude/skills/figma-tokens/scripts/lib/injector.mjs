/**
 * injector.mjs — Module 4 of 4: marker injector + coverage/collision gate.
 *
 * Writes ONLY between `/* >>> figma:<block> START >>> *​/ … /* <<< figma:<block> END <<< *​/`
 * markers in the target stylesheet (so hand-authored tokens OUTSIDE the markers
 * are never touched), and enforces the safety gate:
 *   - throws if a marker is missing (refuse to write a half-applied file);
 *   - throws if a generated token name collides with a hand-authored declaration
 *     outside the markers;
 *   - throws if any source leaf was left unclassified (losslessness).
 *
 * All functions are pure string/array operations — trivially unit-testable.
 */

const startMarker = (name) => `/* >>> figma:${name} START >>> */`;
const endMarker = (name) => `/* <<< figma:${name} END <<< */`;

/** Replace the content between one block's START/END markers. Throws if absent. */
export function injectMarkers(css, name, content) {
  const start = startMarker(name);
  const end = endMarker(name);
  const si = css.indexOf(start);
  const ei = css.indexOf(end);
  if (si === -1 || ei === -1) {
    throw new Error(`marker missing for "${name}" in target CSS (expected ${start} … ${end})`);
  }
  return css.slice(0, si + start.length) + '\n' + content + '\n  ' + css.slice(ei);
}

/**
 * Inject every block. `blocks` is `{ <markerName>: <joined CSS lines> }`.
 *
 * A block whose marker is ABSENT is handled by content:
 *   - empty content  → skipped with a warning (a subset kit legitimately produces
 *     no shadow/alpha/responsive tokens; not having those markers is fine);
 *   - non-empty content → injectMarkers throws, preserving the "never write a
 *     half-applied file" guarantee (a real token with nowhere to land must abort).
 */
export function injectAll(css, blocks) {
  let out = css;
  const skipped = [];
  for (const [name, content] of Object.entries(blocks)) {
    const hasMarker = css.includes(startMarker(name)) && css.includes(endMarker(name));
    if (!hasMarker && content.trim() === '') { skipped.push(name); continue; }
    out = injectMarkers(out, name, content);
  }
  if (skipped.length) console.warn(`[inject] skipped ${skipped.length} empty block(s) with no marker: ${skipped.join(', ')}`);
  return out;
}

/** Collect every `--token` name declared inside the generated block strings. */
export function extractGeneratedNames(blocks) {
  const names = new Set();
  for (const content of Object.values(blocks)) {
    for (const m of content.matchAll(/(--[a-z0-9-]+):/gi)) names.add(m[1]);
  }
  return names;
}

/**
 * Names that the importer would generate AND that already exist as a
 * hand-authored declaration OUTSIDE the markers — a re-import would silently
 * fight them, so they must abort the run.
 *
 * Two regions are stripped before the search (their re-declarations are legitimate,
 * not accidental clashes):
 *   - the `figma:<block>` marker regions themselves (the importer owns them);
 *   - explicit `figma-tokens:overrides START … END` regions — the intentional-override
 *     pattern where a semantic token is re-declared to a brand value AFTER its
 *     marker (e.g. `--primary: var(--color-brand-blue-800)`), so the override wins the
 *     CSS cascade over the imported default ON PURPOSE. Wrapping them in this region
 *     is the author's signed statement "yes, shadowing the marker is intended".
 */
export function findCollisions(css, generatedNames) {
  const stripped = css
    .replace(/\/\* >>> figma:[\s\S]*?<<< figma:[a-z-]+ END <<< \*\//g, '')
    .replace(/\/\* figma-tokens:overrides START \*\/[\s\S]*?\/\* figma-tokens:overrides END \*\//g, '');
  const collisions = [];
  for (const n of generatedNames) {
    if (new RegExp(`(^|[^a-z0-9-])${n}\\s*:`, 'm').test(stripped)) collisions.push(n);
  }
  return collisions;
}

/** Gate: throw if any leaf is unclassified. */
export function assertCoverage(unclassified) {
  if (unclassified.length) {
    const err = new Error(`coverage gate failed: ${unclassified.length} unclassified leaf token(s)`);
    err.unclassified = unclassified;
    throw err;
  }
}

/** Gate: throw if a generated name collides with a hand-authored one. */
export function assertNoCollisions(collisions) {
  if (collisions.length) {
    const err = new Error(
      `name collisions (generated token also hand-declared outside markers): ${collisions.join(', ')}`,
    );
    err.collisions = collisions;
    throw err;
  }
}
