import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './date-picker.twig.json';

const mocks = data.mocks['date-picker'];
const TWIG_ID = '@components/base/date-picker/date-picker.twig';

export default {
  title: 'Base/DatePicker',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Quando impostato, un input nascosto rispecchia la selezione (date ISO separate da virgola).',
      table: { category: 'Content' },
    },
    label: {
      control: 'text',
      description: 'Label visibile sopra il trigger.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Testo del trigger quando vuoto.',
      table: { category: 'Content', defaultValue: { summary: 'Seleziona una data' } },
    },
    mode: {
      control: 'select',
      options: ['single', 'range'],
      description: 'Modalità di selezione.',
      table: { category: 'Behaviour', defaultValue: { summary: 'single' } },
    },
    value: {
      control: 'object',
      description: 'Data/e ISO preselezionate; in range è [start, end].',
      table: { category: 'Content' },
    },
    min: {
      control: 'text',
      description: 'Data ISO, primo giorno selezionabile.',
      table: { category: 'Behaviour' },
    },
    max: {
      control: 'text',
      description: 'Data ISO, ultimo giorno selezionabile.',
      table: { category: 'Behaviour' },
    },
    locale: {
      control: 'text',
      description: 'Tag BCP 47.',
      table: { category: 'Behaviour', defaultValue: { summary: 'it-IT' } },
    },
    numberOfMonths: {
      control: 'number',
      description: 'Numero di mesi mostrati nel calendario, 1..12.',
      table: { category: 'Appearance', defaultValue: { summary: '1' } },
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown'],
      description: 'Layout dell\'intestazione mese/anno del calendario incorporato.',
      table: { category: 'Appearance', defaultValue: { summary: 'label' } },
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Lato di apertura del popover rispetto al trigger.',
      table: { category: 'Appearance', defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Allineamento del popover rispetto al trigger.',
      table: { category: 'Appearance', defaultValue: { summary: 'start' } },
    },
    triggerClass: {
      control: 'text',
      description: 'Classi extra sul bottone trigger (qui vive la larghezza di default).',
      table: { category: 'Appearance', defaultValue: { summary: 'w-56 justify-between font-normal' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Open — play() interaction: trigger click opens the calendar popover ─── */

/** Opens the nested popover+calendar via the trigger both modules share. */
export const Open = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-date-picker-trigger]').click();
  },
};

/* ── Catalog — closed-trigger configurations, one per mock scenario ──────── */

/*
 * Each card shows the date-picker trigger in a meaningful configuration.
 * The popover/calendar remains closed — the Open story above covers the open
 * state. play() initialises all modules so the triggers stay wired.
 */

const defaultCard = demoCard({
  title: 'Default (no value)',
  intro:
    'Il trigger mostra il placeholder quando nessuna data è preselezionata. ' +
    '<code>data-empty="true"</code> rende il testo muted-foreground.',
  content: renderTwig(TWIG_ID, { ...mocks.default, id: 'dp-cat-default' }),
});

const withValueCard = demoCard({
  title: 'With Pre-selected Value',
  intro: 'Una data ISO preselezionata è formattata e mostrata nel trigger. <code>data-empty="false"</code> passa il testo al colore foreground pieno.',
  content: renderTwig(TWIG_ID, { ...mocks['with-value'], id: 'dp-cat-with-value' }),
});

const rangeCard = demoCard({
  title: 'Range Mode',
  intro: '<code>mode="range"</code> passa il calendario incorporato a selezione a intervallo.',
  content: renderTwig(TWIG_ID, { ...mocks.range, id: 'dp-cat-range' }),
});

const rangeWithValueCard = demoCard({
  title: 'Range with Pre-selected Value',
  intro: '<code>mode="range"</code> con <code>value: [start, end]</code> preselezionato: il trigger mostra "gg/mm/aaaa – gg/mm/aaaa".',
  content: renderTwig(TWIG_ID, { ...mocks['range-with-value'], id: 'dp-cat-range-with-value' }),
});

const minMaxCard = demoCard({
  title: 'Min / Max Constraint',
  intro:
    'Le prop <code>min</code> e <code>max</code> sono inoltrate al calendario; le date fuori dalla ' +
    'finestra non sono selezionabili. L\'aspetto del trigger è identico al Default — il vincolo è ' +
    'visibile solo quando il popover si apre.',
  content: renderTwig(TWIG_ID, { ...mocks['min-max'], id: 'dp-cat-min-max' }),
});

const dropdownCaptionCard = demoCard({
  title: 'Dropdown caption',
  intro: '<code>captionLayout="dropdown"</code>: intestazione mese/anno come menù a tendina, utile per date lontane (es. date di nascita).',
  content: renderTwig(TWIG_ID, { ...mocks['dropdown-caption'], id: 'dp-cat-dropdown-caption' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(defaultCard, withValueCard, rangeCard, rangeWithValueCard, minMaxCard, dropdownCaptionCard),
};
