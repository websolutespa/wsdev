import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './attachment.twig.json';

const mocks = data.mocks['attachment'];
const TWIG_ID = '@components/base/attachment/attachment.twig';

export default {
  title: 'Base/Attachment',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: {
      control: 'text',
      description: 'Titolo dell\'allegato.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo secondario (es. dimensione file o stato).',
      table: { category: 'Content' },
    },
    media: {
      control: 'object',
      description: 'Media prima del contenuto: { variant: "icon"|"image", icon?, src?, alt? }.',
      table: { category: 'Content' },
    },
    state: {
      control: 'select',
      options: ['idle', 'uploading', 'processing', 'error', 'done'],
      description: 'Stato dell\'allegato: guida lo spinner in overlay, i colori e lo shimmer del titolo.',
      table: { category: 'State', defaultValue: { summary: 'done' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'xs'],
      description: 'Dimensione del riquadro allegato.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout media+contenuto in riga o in colonna.',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    actions: {
      control: 'object',
      description: 'Array di icon-button renderizzati dentro attachment-actions.',
      table: { category: 'Content' },
    },
    trigger: {
      control: 'object',
      description: 'Renderizza un link/bottone invisibile a piena card: { url?, ariaLabel }.',
      table: { category: 'Behaviour' },
    },
    items: {
      control: 'object',
      description: 'Array di allegati da renderizzare come AttachmentGroup (striscia scrollabile orizzontale), invece del singolo allegato.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Idle — dropzone trigger pattern ──────────────────────────────────────── */

/**
 * Con state="idle" e il prop `trigger` impostato, l'allegato diventa una
 * dropzone: attachment-trigger renderizza un <a> invisibile a piena card
 * (bordo tratteggiato via data-state=idle).
 */
export const Idle = { args: mocks['idle'] };

/* ── Catalog — states, media types, orientation and group ────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const SIZES = [
      { key: 'default', label: 'DEFAULT' },
      { key: 'sm', label: 'SM' },
      { key: 'xs', label: 'XS' },
    ];

    const STATES = [
      { key: 'done', label: 'DONE', title: 'contratto.pdf', description: '2,4 MB', icon: 'file-text' },
      { key: 'uploading', label: 'UPLOADING', title: 'presentazione.pptx', description: 'Caricamento in corso...', icon: undefined },
      { key: 'processing', label: 'PROCESSING', title: 'video-promo.mp4', description: 'Elaborazione...', icon: 'image' },
      { key: 'error', label: 'ERROR', title: 'documento.zip', description: 'Caricamento non riuscito', icon: 'octagon-x' },
    ];

    const statesCard = matrixCard({
      title: 'States × Sizes',
      intro:
        'Ogni <code>state</code> (<strong>DONE</strong>, <strong>UPLOADING</strong>, <strong>PROCESSING</strong>, <strong>ERROR</strong>) ' +
        'nelle tre dimensioni. Gli stati di caricamento mostrano uno spinner al posto dell\'icona media; ' +
        '<strong>ERROR</strong> tinge il riquadro e il testo di <code>destructive</code>.',
      rowAxisLabel: 'Size',
      columns: STATES.map((s) => s.label),
      rows: SIZES,
      renderCell: (col, row) => {
        const state = STATES.find((s) => s.label === col);
        return renderTwig(TWIG_ID, {
          title: state.title,
          description: state.description,
          state: state.key,
          size: row.key,
          media: { variant: 'icon', icon: state.icon },
        });
      },
    });

    const mediaCard = demoCard({
      title: 'Media variants',
      intro: 'Il prop <code>media.variant</code>: <code>icon</code> per un\'icona sprite, <code>image</code> per una thumbnail reale.',
      content: `<div class="flex flex-wrap items-start gap-4">
        ${renderTwig(TWIG_ID, mocks['default'])}
        ${renderTwig(TWIG_ID, mocks['image'])}
      </div>`,
    });

    const orientationCard = demoCard({
      title: 'Orientation',
      intro: 'orientation="vertical" impila media sopra contenuto in un riquadro stretto — utile in griglie di allegati.',
      content: `<div class="flex flex-wrap items-start gap-4">
        ${renderTwig(TWIG_ID, mocks['default'])}
        ${renderTwig(TWIG_ID, mocks['vertical'])}
      </div>`,
    });

    const groupCard = demoCard({
      title: 'Attachment group',
      intro: 'Il prop array <code>items</code> renderizza un AttachmentGroup: una striscia scrollabile orizzontalmente di allegati misti (icona/immagine).',
      content: renderTwig(TWIG_ID, mocks['group']),
    });

    return storyStack(statesCard, mediaCard, orientationCard, groupCard);
  },
};
