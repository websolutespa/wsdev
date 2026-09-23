import { renderTwig } from '~sb/twig';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './alert.twig.json';

const mocks = data.mocks['alert'];
const TWIG_ID = '@components/base/alert/alert.twig';

export default {
  title: 'Base/Alert',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Schema colore dell\'alert.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    icon: {
      control: 'text',
      description: 'Nome icona sprite renderizzata prima di titolo/descrizione.',
      table: { category: 'Content' },
    },
    title: {
      control: 'text',
      description: 'Testo del titolo dell\'alert.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Testo del corpo dell\'alert (plain text; usare il block per contenuto ricco).',
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

/* ── Catalog — variants × content layouts ────────────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const VARIANTS = [
      { key: 'default', label: 'DEFAULT' },
      { key: 'destructive', label: 'DESTRUCTIVE' },
    ];

    const COPY = {
      default: {
        title: 'Aggiornamento disponibile',
        description: 'È disponibile una nuova versione dell\'app. Ricarica la pagina per applicarla.',
        icon: 'info',
      },
      destructive: {
        title: 'Impossibile salvare le modifiche',
        description: 'Controlla la connessione e riprova. Se il problema persiste contatta l\'assistenza.',
        icon: 'octagon-x',
      },
    };

    const alertsCard = matrixCard({
      title: 'Alerts',
      intro:
        'Ogni variante × tre configurazioni di contenuto. ' +
        '<strong>SOLO TITOLO</strong>: solo l\'intestazione, senza descrizione o icona. ' +
        '<strong>+ DESCRIZIONE</strong>: intestazione + testo. ' +
        '<strong>+ ICONA</strong>: intestazione + descrizione + icona SVG iniziale ' +
        '(attiva la griglia a due colonne tramite il selettore <code>has-[&gt;svg]</code>).',
      rowAxisLabel: 'Variant',
      columns: ['SOLO TITOLO', '+ DESCRIZIONE', '+ ICONA'],
      rows: VARIANTS,
      center: false,
      renderCell: (col, row) => {
        const copy = COPY[row.key];
        const args = { variant: row.key, title: copy.title };
        if (col !== 'SOLO TITOLO') args.description = copy.description;
        if (col === '+ ICONA') args.icon = copy.icon;
        return `<div class="w-full max-w-md mx-auto">${renderTwig(TWIG_ID, args)}</div>`;
      },
    });

    return storyStack(alertsCard);
  },
};
