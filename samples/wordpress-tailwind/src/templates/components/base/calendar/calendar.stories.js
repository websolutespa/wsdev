import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './calendar.twig.json';

const mocks = data.mocks['calendar'];
const TWIG_ID = '@components/base/calendar/calendar.twig';

export default {
  title: 'Base/Calendar',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
      description: 'Modalità di selezione.',
      table: { category: 'Behaviour', defaultValue: { summary: 'single' } },
    },
    selected: {
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
    weekStart: {
      control: 'number',
      description: 'Primo giorno della settimana, 0..6.',
      table: { category: 'Behaviour', defaultValue: { summary: '1' } },
    },
    disabled: {
      control: 'object',
      description: 'Date ISO non selezionabili.',
      table: { category: 'State' },
    },
    numberOfMonths: {
      control: 'number',
      description: 'Numero di mesi mostrati, 1..12.',
      table: { category: 'Appearance', defaultValue: { summary: '1' } },
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown'],
      description: 'Layout dell’intestazione mese/anno.',
      table: { category: 'Appearance', defaultValue: { summary: 'label' } },
    },
    name: {
      control: 'text',
      description: 'Quando impostato, un input nascosto rispecchia la selezione (date ISO separate da virgola).',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Mounted — play() interaction: module initialisation ─────────────────── */

export const Mounted = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};

/* ── Catalog — demoCards per mock scenario ────────────────────────────────── */

/*
 * Each calendar lives in its own DOM sub-tree. vanilla-calendar-pro initialises
 * per [data-module="calendar.module"] node — there is no shared global state,
 * so all instances co-exist safely in a single story.
 */

const singleCard = demoCard({
  title: 'Single',
  intro:
    'Default <code>mode="single"</code>: una data selezionabile alla volta. L’input nascosto ' +
    '<code>data-slot="calendar-input"</code> si aggiorna alla selezione.',
  content: renderTwig(TWIG_ID, { ...mocks.default, id: 'cal-cat-single' }),
});

const rangeCard = demoCard({
  title: 'Range',
  intro: '<code>mode="range"</code>: clic su una data di inizio poi una di fine per evidenziare un intervallo.',
  content: renderTwig(TWIG_ID, { ...mocks.range, id: 'cal-cat-range' }),
});

const multipleCard = demoCard({
  title: 'Multiple',
  intro:
    '<code>mode="multiple"</code>: un numero qualsiasi di date singole può essere attivato/disattivato. ' +
    'I valori sono salvati separati da virgola nell\'unico input nascosto.',
  content: renderTwig(TWIG_ID, { ...mocks.multiple, id: 'cal-cat-multiple' }),
});

const multipleMonthsCard = demoCard({
  title: 'Multiple months',
  intro: '<code>numberOfMonths: 2</code> combinato con <code>mode="range"</code> per un intervallo su più mesi.',
  content: renderTwig(TWIG_ID, { ...mocks['multiple-months'], id: 'cal-cat-multiple-months' }),
});

const dropdownCaptionCard = demoCard({
  title: 'Dropdown caption',
  intro: '<code>captionLayout="dropdown"</code>: intestazione mese/anno come menù a tendina, utile per date lontane (es. date di nascita).',
  content: renderTwig(TWIG_ID, { ...mocks['dropdown-caption'], id: 'cal-cat-dropdown-caption' }),
});

const minMaxCard = demoCard({
  title: 'Min / Max',
  intro:
    'Vincolato a una finestra di date via <code>min</code> e <code>max</code>. Le date fuori dalla ' +
    'finestra sono renderizzate disabilitate da vanilla-calendar-pro.',
  content: renderTwig(TWIG_ID, { ...mocks['min-max'], id: 'cal-cat-min-max' }),
});

const disabledDaysCard = demoCard({
  title: 'Disabled days',
  intro: '<code>disabled</code> elenca singole date ISO non selezionabili, indipendentemente da min/max.',
  content: renderTwig(TWIG_ID, { ...mocks['disabled-days'], id: 'cal-cat-disabled-days' }),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () =>
    storyStack(singleCard, rangeCard, multipleCard, multipleMonthsCard, dropdownCaptionCard, minMaxCard, disabledDaysCard),
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
