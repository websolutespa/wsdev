import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './skeleton.twig.json';

const mocks = data.mocks['skeleton'];
const TWIG_ID = '@components/base/skeleton/skeleton.twig';

export default {
  title: 'Base/Skeleton',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    class: {
      control: 'text',
      description: 'Utility Tailwind che definiscono forma e dimensione (es. "h-4 w-48" o "size-12 rounded-full").',
      table: { category: 'Appearance' },
    },
    id: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Catalog — shapes and composite patterns ─────────────────────────────── */

function sk(cls) {
  return renderTwig(TWIG_ID, { class: cls });
}

const shapesCard = demoCard({
  title: 'Shapes',
  intro: 'Skeleton è un componente a elemento singolo — forma e dimensione sono interamente guidate dal prop <code>class</code>. La base è <code>rounded-md</code>; sovrascrivere con <code>rounded-full</code> per i cerchi o <code>rounded-xl</code> per i placeholder a forma di card.',
  content: `
    <div class="flex items-end gap-6">
      <div class="flex flex-col items-center gap-2">
        ${sk('h-4 w-32')}
        <span class="text-xs text-muted-foreground">Line</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${sk('h-10 w-10 rounded-full')}
        <span class="text-xs text-muted-foreground">Avatar</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${sk('size-12 rounded-full')}
        <span class="text-xs text-muted-foreground">Avatar LG</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        ${sk('h-[125px] w-[250px] rounded-xl')}
        <span class="text-xs text-muted-foreground">Card image</span>
      </div>
    </div>
  `,
});

const cardPlaceholderCard = demoCard({
  title: 'Card placeholder',
  intro: 'Pattern documentazione upstream: placeholder immagine + due righe di testo. Componi più istanze di Skeleton per rispecchiare il layout reale della card.',
  content: `
    <div class="flex flex-col space-y-3">
      ${sk('h-[125px] w-[250px] rounded-xl')}
      <div class="space-y-2">
        ${sk('h-4 w-[250px]')}
        ${sk('h-4 w-[200px]')}
      </div>
    </div>
  `,
});

const listPlaceholderCard = demoCard({
  title: 'List placeholder',
  intro: 'Avatar + due righe di testo per riga — un pattern di caricamento comune per liste utenti, thread di commenti e feed attività.',
  content: `
    <div class="flex flex-col gap-4 w-72">
      ${[1, 2, 3].map(() => `
      <div class="flex items-center gap-3">
        ${sk('size-10 rounded-full shrink-0')}
        <div class="flex flex-col gap-2 flex-1">
          ${sk('h-4 w-3/4')}
          ${sk('h-3 w-1/2')}
        </div>
      </div>`).join('')}
    </div>
  `,
});

const formPlaceholderCard = demoCard({
  title: 'Form placeholder',
  intro: 'Righe label + campo input — da usare mentre lo schema del form o i valori di default sono in caricamento.',
  content: `
    <div class="flex flex-col gap-5 w-72">
      ${[1, 2, 3].map(() => `
      <div class="flex flex-col gap-2">
        ${sk('h-3 w-24')}
        ${sk('h-9 w-full rounded-md')}
      </div>`).join('')}
      ${sk('h-9 w-28 mt-2')}
    </div>
  `,
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(shapesCard, cardPlaceholderCard, listPlaceholderCard, formPlaceholderCard),
};
