import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './combobox.twig.json';

const mocks = data.mocks['combobox'];
const TWIG_ID = '@components/base/combobox/combobox.twig';

export default {
  title: 'Base/Combobox',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name della <select> nativa nascosta che porta il valore al submit, OBBLIGATORIO.',
      table: { category: 'Content' },
    },
    items: {
      control: 'object',
      description:
        'Array di { value, label, group?, disabled? }, OBBLIGATORIO. Elementi consecutivi con lo ' +
        'stesso group sono raggruppati sotto un’etichetta combobox-label.',
      table: { category: 'Content' },
    },
    value: {
      control: 'text',
      description: 'Elemento preselezionato (modalità singola).',
      table: { category: 'Content' },
    },
    values: {
      control: 'object',
      description: 'Elementi preselezionati (modalità chips); ignorato fuori dalla modalità chips.',
      table: { category: 'Content' },
    },
    chips: {
      control: 'boolean',
      description: 'Selezione multipla: il controllo diventa combobox-chips con un chip rimovibile per valore.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder dell\'input testuale.',
      table: { category: 'Content' },
    },
    emptyText: {
      control: 'text',
      description: 'Testo di combobox-empty.',
      table: { category: 'Content', defaultValue: { summary: 'Nessun risultato' } },
    },
    showTrigger: {
      control: 'boolean',
      description: 'Bottone chevron che apre l\'elenco (solo modalità singola).',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    showClear: {
      control: 'boolean',
      description: 'Bottone per svuotare il campo (solo modalità singola).',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita il controllo.',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Sulla select nativa, così si applica la validazione del form.',
      table: { category: 'State' },
    },
    invalid: {
      control: 'boolean',
      description: 'aria-invalid="true" sul controllo.',
      table: { category: 'State' },
    },
    id: {
      control: 'text',
      description: 'Id dell\'input testuale, per un label[for] esterno; mai generato in Twig.',
      table: { category: 'Accessibility' },
    },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Open — play() interaction: focusing/clicking the input opens the listbox ─ */

/** Clicking the text input opens the option listbox via the JS module. */
export const Open = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-slot="combobox-input"]').click();
  },
};

/* ── Catalog — mock scenarios, each in a static closed configuration ─────── */

/*
 * Each card shows the combobox in a static closed configuration; play()
 * initialises all modules so the triggers stay wired and interactive when
 * browsing the Catalog. Open/type/select interactions are covered by the
 * Open story above.
 */

const defaultCard = demoCard({
  title: 'Default (empty)',
  intro: 'Nessun valore preselezionato; l\'input testuale mostra il placeholder.',
  content: renderTwig(TWIG_ID, { ...mocks.default, id: 'cmb-cat-default' }),
});

const withValueCard = demoCard({
  title: 'With Pre-selected Value',
  intro:
    'Quando <code>value</code> combacia con un elemento, la sua label è mostrata nell’input ' +
    'e un indicatore di spunta appare sulla voce corrispondente nell’elenco. <code>showClear</code> ' +
    'aggiunge il bottone per svuotare il campo.',
  content: renderTwig(TWIG_ID, { ...mocks['with-value'], id: 'cmb-cat-with-value' }),
});

const groupedCard = demoCard({
  title: 'Grouped items',
  intro:
    'Elementi consecutivi con lo stesso <code>group</code> sono raggruppati sotto un’etichetta ' +
    'combobox-label, con un separatore tra gruppi.',
  content: renderTwig(TWIG_ID, { ...mocks.grouped, id: 'cmb-cat-grouped' }),
});

const disabledItemCard = demoCard({
  title: 'Disabled item',
  intro: 'Un singolo elemento può essere disabilitato senza disabilitare l’intero controllo.',
  content: renderTwig(TWIG_ID, { ...mocks['disabled-item'], id: 'cmb-cat-disabled-item' }),
});

const chipsCard = demoCard({
  title: 'Chips (multiple selection)',
  intro:
    '<code>chips: true</code> trasforma il controllo in combobox-chips: ogni valore selezionato ' +
    'diventa un chip rimovibile e la select nascosta diventa <code>multiple</code>.',
  content: renderTwig(TWIG_ID, { ...mocks.chips, id: 'cmb-cat-chips' }),
});

const disabledCard = demoCard({
  title: 'Disabled',
  intro:
    'Impostare <code>disabled</code> applica <code>disabled:pointer-events-none disabled:opacity-50</code> ' +
    'all\'input testuale. L\'elenco non si apre mai.',
  content: renderTwig(TWIG_ID, { ...mocks.disabled, id: 'cmb-cat-disabled' }),
});

const invalidCard = demoCard({
  title: 'Invalid',
  intro:
    'Impostare <code>invalid</code> emette <code>aria-invalid="true"</code> sull’input testuale, ' +
    'attivando gli stili <code>aria-invalid:border-destructive</code> e ' +
    '<code>aria-invalid:ring-destructive/20</code>.',
  content: renderTwig(TWIG_ID, { ...mocks.invalid, id: 'cmb-cat-invalid' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(defaultCard, withValueCard, groupedCard, disabledItemCard, chipsCard, disabledCard, invalidCard),
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
