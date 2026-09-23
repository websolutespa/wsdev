/**
 * Runtime Twig rendering for Storybook stories.
 * Same engine as the production build: twig.js ^1.17 (deduped with
 * @vituum/vite-plugin-twig). See docs/adr/0004-storybook-twigjs.md.
 */
import Twig from 'twig';
import { twigFunctions } from './twig-functions';
import main from '../src/theme/main.json';

// Every template, raw, same tree the build sees.
const sources = import.meta.glob('../src/templates/**/*.twig', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// main.schema.json requires layout.labels as an array of {id, text}; derive
// the same keyed map vite.config.js builds so templates can do labels['id'].
const labels = Object.fromEntries(main.layout.labels.map((label) => [label.id, label.text]));

// Each components/**/*.twig.json mock file is shaped { "mocks": { "<name>": {...} } };
// merge them into one flat record so stories can do mocks['button'].default.
const mockFiles = import.meta.glob('../src/templates/components/**/*.twig.json', {
  eager: true,
  import: 'default',
}) as Record<string, { mocks?: Record<string, unknown> }>;
export const mocks: Record<string, unknown> = Object.assign(
  {},
  ...Object.values(mockFiles).map((file) => file.mocks ?? {})
);

for (const [name, fn] of Object.entries(twigFunctions)) {
  // @types/twig types the callback as string-returning; entries() returns an array.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Twig.extendFunction(name, fn as any);
}
Twig.cache(false);

function register() {
  // Reset the registry: this module re-executes on Vite HMR and twig.js
  // throws on duplicate ids otherwise.
  Twig.extend((T: any) => {
    T.Templates.registry = {};
  });
  for (const [path, raw] of Object.entries(sources)) {
    const rel = path.replace('../src/templates/', '');
    // Vite html-env placeholders only exist in the build pipeline.
    const data = raw.replace(/%(BASE_URL|DEV|MODE|PROD|VITE_ORIGIN|WS_VITE)%/g, '');
    const ids = [rel];
    if (rel.startsWith('components/')) {
      // The id every `{% include '@components/...' %}` resolves against.
      ids.push('@components/' + rel.slice('components/'.length));
    }
    for (const id of ids) {
      Twig.twig({ id, data, allowInlineIncludes: true } as any);
    }
  }
}
register();

/** Render a registered template (e.g. '@components/base/button/button.twig'). */
export function renderTwig(id: string, context: Record<string, unknown> = {}): string {
  const tpl = (Twig as any).twig({ ref: id });
  if (!tpl) {
    throw new Error(`[storybook/twig] template not registered: ${id}`);
  }
  // Inject layout globals like the build does (twig.globals = main.json + labels + mocks).
  return tpl.render({ ...main, labels, mocks, ...context });
}
