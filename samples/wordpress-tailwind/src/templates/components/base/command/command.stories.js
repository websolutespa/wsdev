import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './command.twig.json';

const mocks = data.mocks['command'];
const TWIG_ID = '@components/base/command/command.twig';

export default {
  title: 'Base/Command',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    groups: {
      control: 'object',
      description: 'Un command-group per elemento: { heading?, items: [{ label, value?, icon?, shortcut?, url?, disabled? }] }.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder del campo di ricerca.',
      table: { category: 'Content', defaultValue: { summary: 'Cerca un comando…' } },
    },
    emptyText: {
      control: 'text',
      description: 'Testo mostrato quando nessun risultato corrisponde al filtro.',
      table: { category: 'Content', defaultValue: { summary: 'Nessun risultato.' } },
    },
    asDialog: {
      control: 'boolean',
      description: 'Racchiude la palette in un dialog (upstream CommandDialog).',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    shortcut: {
      control: 'text',
      description: 'Tasto singolo che apre il dialog con Ctrl/Cmd (solo con asDialog).',
      table: { category: 'Behaviour' },
    },
    title: {
      control: 'text',
      description: 'Titolo del dialog, visualmente nascosto (solo con asDialog).',
      table: { category: 'Content', defaultValue: { summary: 'Palette comandi' } },
    },
    description: {
      control: 'text',
      description: 'Descrizione del dialog, visualmente nascosta (solo con asDialog).',
      table: { category: 'Content' },
    },
    triggerLabel: {
      control: 'text',
      description: 'Etichetta del bottone trigger del dialog (solo con asDialog).',
      table: { category: 'Content' },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Mostra il pulsante di chiusura del dialog (solo con asDialog).',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — Controls playground ───────────────────────────────────────── */

export const Default = { args: mocks['default'] };

/** Types a query to exercise the ranked substring filter (command.module.js scores matches). */
export const Filtered = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const input = canvasElement.querySelector('[data-slot="command-input"]');
    input.focus();
    input.value = 'Preferenze';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  },
};

/**
 * Command palette in dialog mode. The play() step fires Ctrl+K to open the
 * dialog, demonstrating the global hotkey path.
 */
export const AsDialog = {
  args: mocks['dialog'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/*
 * The Catalog shows the structural variants of the command palette in their
 * default (idle, not yet interacted) state. The full filter + open interactions
 * are demonstrated by the Filtered and AsDialog play() stories above.
 */

const inlineCard = demoCard({
  title: 'Inline Palette',
  intro:
    'Superficie della palette renderizzata direttamente nella pagina dentro un contenitore bordato. ' +
    'I gruppi sono separati da una linea orizzontale; intestazioni e icone provengono dalla prop <code>groups</code>.',
  content: renderTwig(TWIG_ID, {
    ...mocks['default'],
    id: 'cmd-inline-catalog',
    class: 'rounded-lg border shadow-md md:min-w-[450px]',
  }),
});

const linksCard = demoCard({
  title: 'With Links',
  intro: 'Voci con <code>url</code>: il modulo naviga invece di emettere solo <code>command:select</code>.',
  content: renderTwig(TWIG_ID, {
    ...mocks['with-links'],
    id: 'cmd-links-catalog',
    class: 'rounded-lg border shadow-md md:min-w-[450px]',
  }),
});

const disabledCard = demoCard({
  title: 'Disabled Item',
  intro: 'Una voce disabilitata riceve <code>data-disabled="true"</code> e <code>pointer-events-none opacity-50</code>.',
  content: renderTwig(TWIG_ID, {
    ...mocks['disabled-item'],
    id: 'cmd-disabled-catalog',
    class: 'rounded-lg border shadow-md md:min-w-[450px]',
  }),
});

const dialogCard = demoCard({
  title: 'As Dialog (closed)',
  intro:
    'Con <code>asDialog: true</code> la palette è racchiusa in un <code>&lt;dialog&gt;</code> gestito da ' +
    '<code>dialog.module</code>. Il bottone outline la apre; Ctrl/Cmd+<code>shortcut</code> la apre globalmente. ' +
    'Qui è mostrata chiusa — vedi la story <strong>AsDialog</strong> per lo stato aperto.',
  content: renderTwig(TWIG_ID, { ...mocks['dialog'], id: 'cmd-dialog-catalog' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(inlineCard, linksCard, disabledCard, dialogCard),
};
