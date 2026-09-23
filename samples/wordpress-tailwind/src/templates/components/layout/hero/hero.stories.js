import { renderTwig } from '~sb/twig';

const TWIG_ID = '@components/layout/hero/hero.twig';

/* No mock file for layout/hero (layout components only ship .twig): the mock
   mirrors the real hero_options built in src/index.twig, kept local since it
   is page copy, not global site data (main.json only holds a placeholder
   page.title/abstract for the generic sample page). */
const heroMock = {
  eyebrow: 'Novità',
  title: 'Costruisci la tua piattaforma più velocemente',
  heading: 'h1',
  abstract: 'Un boilerplate WordPress + Tailwind con tutta la libreria shadcn/ui portata in Twig, pronta da comporre in blocchi.',
  cta: { label: 'Inizia ora', url: '#cta-banner' },
  navs: [{ label: 'Scopri i componenti', url: '/storybook/' }],
  media: { src: '/media/images/mountains.jpg', alt: 'Panorama di montagna al tramonto' },
};

export default {
  title: 'Layout/Hero',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    eyebrow: { control: 'text', table: { category: 'Content' }, description: 'Badge testuale sopra il titolo.' },
    title: { control: 'text', table: { category: 'Content' }, description: 'Titolo (richiesto).' },
    heading: {
      control: { type: 'select' },
      options: ['h1', 'h2'],
      table: { category: 'Appearance', defaultValue: { summary: 'h1' } },
      description: 'h1 in homepage, h2 quando la hero è riusata più in basso in pagina.',
    },
    abstract: { control: 'text', table: { category: 'Content' }, description: 'Paragrafo di supporto sotto il titolo.' },
    cta: { control: 'object', table: { category: 'Content' }, description: 'Cta { label, url, variant? }: azione primaria.' },
    navs: { control: 'object', table: { category: 'Content' }, description: 'Array<{ label, url, variant? }>: azioni secondarie accanto a cta.' },
    media: { control: 'object', table: { category: 'Content' }, description: 'Media { src, alt? }: illustrazione opzionale, 2 colonne da lg in su.' },
    id: { control: 'text', table: { category: 'Content' }, description: 'Id sulla section per gli anchor link.' },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — h1, media a destra da lg in su ──────────────────────────────── */

export const Default = { args: heroMock };

/* ── WithoutMedia — colonna centrata, nessuna illustrazione ────────────────── */

const { media: _omitted, ...withoutMediaArgs } = heroMock;

export const WithoutMedia = { args: withoutMediaArgs };

/* ── HeadingH2 — stesso contenuto riusato più in basso in pagina ───────────── */

export const HeadingH2 = { args: { ...heroMock, heading: 'h2' } };
