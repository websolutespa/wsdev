import { renderTwig } from '~sb/twig';
import { matrixCard, demoCard, storyStack } from '~sb/story-helpers';
import data from './item.twig.json';

const mocks = data.mocks['item'];
const TWIG_ID = '@components/base/item/item.twig';

export default {
  title: 'Base/Item',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'muted'],
      description: 'Schema colore/bordo dell\'item.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Padding e gap dell\'item.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    title: {
      control: 'text',
      description: 'Titolo dell\'item.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Descrizione dell\'item.',
      table: { category: 'Content' },
    },
    media: {
      control: 'object',
      description: 'Media prima del contenuto: { variant, icon, src, alt }.',
      table: { category: 'Content' },
    },
    actions: {
      control: 'object',
      description: 'Array di azioni renderizzate come Button component dentro item-actions.',
      table: { category: 'Content' },
    },
    url: {
      control: 'text',
      description: 'Se impostato renderizza <a> invece di <div> (pattern upstream asChild).',
      table: { category: 'Behaviour' },
    },
    group: {
      control: 'object',
      description: 'Array di item da renderizzare come ItemGroup, con un Separator tra le entry.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── AsLink — item rendered as <a> ───────────────────────────────────────── */

export const AsLink = { args: mocks['as-link'] };

/* ── Catalog — variant × size matrix + media/actions showcase ────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const VARIANTS = [
      { key: 'default', label: 'DEFAULT' },
      { key: 'outline', label: 'OUTLINE' },
      { key: 'muted', label: 'MUTED' },
    ];

    const SIZES = [
      { key: 'default', label: 'DEFAULT' },
      { key: 'sm', label: 'SM' },
    ];

    const variantSizeCard = matrixCard({
      title: 'Variants × Sizes',
      intro:
        'Tutte e tre le varianti (<code>default</code>, <code>outline</code>, <code>muted</code>) ' +
        'nelle due dimensioni (<code>default</code>, <code>sm</code>). Item solo testo: nessuno slot media.',
      rowAxisLabel: 'Variant',
      columns: SIZES.map((s) => s.label),
      rows: VARIANTS,
      center: false,
      renderCell: (col, row) => {
        const size = SIZES.find((s) => s.label === col)?.key ?? 'default';
        return renderTwig(TWIG_ID, {
          variant: row.key,
          size,
          title: 'Notifiche progetto',
          description: 'Ricevi un aggiornamento quando un task viene completato o commentato.',
        });
      },
    });

    const withIconCard = demoCard({
      title: 'With icon media',
      intro:
        'Il prop <code>media</code> con <code>variant: "icon"</code> renderizza uno slot item-media ' +
        'come tile arrotondato contenente l\'icona sprite SVG.',
      content: renderTwig(TWIG_ID, mocks['muted']),
    });

    const withImageCard = demoCard({
      title: 'With image media',
      intro:
        'Il prop <code>media</code> con <code>variant: "image"</code> renderizza uno slot item-media ' +
        'leggermente più grande con clipping <code>object-cover</code>, e un\'azione a icona singola.',
      content: renderTwig(TWIG_ID, mocks['with-image']),
    });

    const withActionsCard = demoCard({
      title: 'With actions',
      intro: 'Array <code>actions</code> renderizzato come bottoni ghost <code>icon-sm</code> dentro item-actions.',
      content: renderTwig(TWIG_ID, mocks['with-actions']),
    });

    const groupCard = demoCard({
      title: 'Item group',
      intro:
        'ItemGroup: elenco verticale di item tramite il prop array <code>group</code>, con un Separator ' +
        'orizzontale inserito automaticamente tra le entry consecutive.',
      content: renderTwig(TWIG_ID, { ...mocks['group'], class: 'w-96' }),
    });

    return storyStack(variantSizeCard, withIconCard, withImageCard, withActionsCard, groupCard);
  },
};
