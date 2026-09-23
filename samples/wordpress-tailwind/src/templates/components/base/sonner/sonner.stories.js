import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { toast } from '../../../../js/common/toast';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './sonner.twig.json';

const mocks = data.mocks['sonner'];
const TWIG_ID = '@components/base/sonner/sonner.twig';

export default {
  title: 'Base/Sonner',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
      description: 'Angolo del viewport in cui impilare i toast.',
      table: { category: 'Appearance', defaultValue: { summary: 'bottom-right' } },
    },
    richColors: {
      control: 'boolean',
      description: 'Colora ogni toast in base al tipo invece della superficie popover neutra.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    closeButton: {
      control: 'boolean',
      description: 'Mostra il pulsante di chiusura su ogni toast.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    expand: {
      control: 'boolean',
      description: 'Se true usa sempre la spaziatura completa invece di uno stack compatto che si apre in hover.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    duration: {
      control: 'number',
      description: 'Ritardo di auto-dismiss in ms, 0 per disabilitarlo.',
      table: { category: 'Behaviour', defaultValue: { summary: '4000' } },
    },
    label: {
      control: 'text',
      description: 'Nome accessibile della regione toaster.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Notifiche' } },
    },
    triggers: {
      control: 'object',
      description: 'Bottoni demo/host collegati a [data-sonner-show]: label, message, type?, description?, duration?.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — Controls playground (triggers rendered declaratively) ─────── */

export const Default = { args: mocks['default'] };

/** Clicks the first declarative [data-sonner-show] trigger to publish a toast. */
export const Toast = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    canvasElement.querySelector('[data-sonner-show]').click();
  },
};

/** Fires one toast of each type via the imperative toast() API from common/toast.js. */
export const Types = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    toast('Messaggio predefinito');
    toast.success('Operazione riuscita');
    toast.error('Si è verificato un errore');
    toast.warning('Controlla i dati inseriti');
    toast.info('Informazione disponibile');
    toast.loading('Elaborazione in corso…');
  },
};

/* ── Catalog ──────────────────────────────────────────────────────────────── */

/**
 * Each card is a distinct toaster configuration (position, richColors, expand,
 * closeButton, duration) with its own declarative trigger buttons (`triggers`
 * prop) — click a button to fire that toast. Our port's toast template has no
 * action-button slot (unlike upstream sonner), so no WithAction story here.
 */

const defaultCard = demoCard({
  title: 'Bottom right (default)',
  intro: 'Posizione di default. Clicca un bottone per generare un toast di quel tipo.',
  content: renderTwig(TWIG_ID, mocks['default']),
});

const richColorsCard = demoCard({
  title: 'Rich colors',
  intro: '<code>richColors: true</code> — ogni toast è colorato in base al tipo invece della superficie popover neutra.',
  content: renderTwig(TWIG_ID, mocks['rich-colors']),
});

const topCenterCard = demoCard({
  title: 'Top center',
  intro: '<code>position: "top-center"</code> — i toast appaiono centrati in alto nel viewport.',
  content: renderTwig(TWIG_ID, mocks['top-center']),
});

const loadingCard = demoCard({
  title: 'Loading',
  intro: 'Un toast <code>type: "loading"</code> non si chiude automaticamente finché non viene aggiornato o rimosso.',
  content: renderTwig(TWIG_ID, mocks['loading']),
});

const noCloseButtonCard = demoCard({
  title: 'No close button',
  intro: '<code>closeButton: false</code> con <code>duration: 10000</code> — si chiude da sola dopo 10 secondi.',
  content: renderTwig(TWIG_ID, mocks['no-close-button']),
});

const expandCard = demoCard({
  title: 'Expand',
  intro: '<code>expand: true</code> usa sempre la spaziatura completa invece di uno stack compatto in hover.',
  content: renderTwig(TWIG_ID, mocks['expand']),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(defaultCard, richColorsCard, topCenterCard, loadingCard, noCloseButtonCard, expandCard),
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
  },
};
