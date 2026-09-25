import { renderTwig } from '~sb/twig';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './avatar.twig.json';

const mocks = data.mocks['avatar'];
const TWIG_ID = '@components/base/avatar/avatar.twig';

export default {
  title: 'Base/Avatar',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    src: {
      control: 'text',
      description: 'URL immagine; se impostato renderizza avatar-image prima del fallback.',
      table: { category: 'Content' },
    },
    alt: {
      control: 'text',
      description: 'Testo alternativo, obbligatorio quando src è impostato.',
      table: { category: 'Accessibility' },
    },
    fallback: {
      control: 'text',
      description: 'Iniziali/testo mostrato durante il caricamento immagine, in caso di errore, o senza src.',
      table: { category: 'Content' },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Dimensione dell\'avatar.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    badge: {
      control: 'text',
      description: 'Nome icona sprite per l\'overlay badge di stato; stringa vuota per un dot senza icona.',
      table: { category: 'Appearance' },
    },
    group: {
      control: 'object',
      description: 'Array di avatar da renderizzare come AvatarGroup sovrapposto, invece del singolo avatar.',
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

/* ── BrokenImage — fallback-on-error module behaviour ────────────────────── */

/**
 * avatar.module.js listens for the <img> load/error events and reveals the
 * fallback only once the image has actually failed, mirroring Radix's async
 * image status instead of flashing a broken-image icon.
 */
export const BrokenImage = { args: mocks['broken-image'] };

/* ── Catalog — content types, badges and groups ──────────────────────────── */

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const SIZE_ROWS = [
      { key: 'sm', label: 'SM' },
      { key: 'default', label: 'DEFAULT' },
      { key: 'lg', label: 'LG' },
    ];

    const avatarsCard = matrixCard({
      title: 'Avatars',
      intro:
        'Matrice tipo di contenuto × dimensione. <strong>IMAGE</strong>: src reale. ' +
        '<strong>INITIALS</strong>: solo fallback, senza src. ' +
        '<strong>BROKEN</strong>: URL src non valido — avatar.module.js rivela il fallback al fallire del load.',
      rowAxisLabel: 'Size',
      columns: ['IMAGE', 'INITIALS', 'BROKEN'],
      rows: SIZE_ROWS,
      renderCell: (col, row) => {
        switch (col) {
          case 'IMAGE':
            return renderTwig(TWIG_ID, {
              src: 'https://i.pravatar.cc/150?img=12',
              alt: 'Foto profilo di Giulia Romano',
              fallback: 'GR',
              size: row.key,
            });
          case 'INITIALS':
            return renderTwig(TWIG_ID, { fallback: 'MC', size: row.key });
          case 'BROKEN':
            return renderTwig(TWIG_ID, {
              src: 'https://example.invalid/non-esistente.jpg',
              alt: 'Immagine non disponibile',
              fallback: 'AB',
              size: row.key,
            });
        }
      },
    });

    const badgeCard = matrixCard({
      title: 'With status badge',
      intro:
        'Overlay badge di stato nell\'angolo in basso a destra. ' +
        '<strong>DOT</strong>: <code>badge=""</code> (stringa vuota → dot semplice, senza icona). ' +
        '<strong>WITH ICON</strong>: <code>badge="check"</code> → icona renderizzata dentro il badge.',
      rowAxisLabel: 'Size',
      columns: ['DOT', 'WITH ICON'],
      rows: SIZE_ROWS,
      renderCell: (col, row) =>
        renderTwig(TWIG_ID, {
          src: 'https://i.pravatar.cc/150?img=48',
          alt: 'Foto profilo di Marco Villa',
          fallback: 'MV',
          size: row.key,
          badge: col === 'WITH ICON' ? 'check' : '',
        }),
    });

    const groupCard = matrixCard({
      title: 'Avatar group',
      intro:
        'AvatarGroup: stack sovrapposto di avatar tramite il prop array <code>group</code>. ' +
        'Un elemento finale <code>{ count: "+N" }</code> renderizza una bolla AvatarGroupCount.',
      rowAxisLabel: 'Size',
      columns: ['2-UP', '3-UP', '4-UP', '+ COUNT'],
      rows: SIZE_ROWS,
      renderCell: (col, row) => {
        const base = [
          { src: 'https://i.pravatar.cc/150?img=12', alt: 'Giulia Romano', fallback: 'GR' },
          { src: 'https://i.pravatar.cc/150?img=5', alt: 'Luca Ferri', fallback: 'LF' },
          { src: 'https://i.pravatar.cc/150?img=32', alt: 'Sara Conti', fallback: 'SC' },
          { fallback: 'AK' },
        ];
        const members = {
          '2-UP': base.slice(0, 2),
          '3-UP': base.slice(0, 3),
          '4-UP': base.slice(0, 4),
          '+ COUNT': [...base.slice(0, 3), { count: '+2' }],
        };
        return renderTwig(TWIG_ID, { size: row.key, group: members[col] });
      },
    });

    return storyStack(avatarsCard, badgeCard, groupCard);
  },
};
