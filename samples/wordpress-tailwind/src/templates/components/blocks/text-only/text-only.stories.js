import { renderTwig } from '~sb/twig';
import data from './text-only.twig.json';

const mocks = data.mocks['text-only'];
const TWIG_ID = '@components/blocks/text-only/text-only.twig';

export default {
  title: 'Blocks/TextOnly',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: { control: 'text', table: { category: 'Content' }, description: 'Titolo di sezione, opzionale.' },
    heading: {
      control: { type: 'select' },
      options: ['h2', 'h3'],
      table: { category: 'Appearance', defaultValue: { summary: 'h2' } },
      description: 'Tag semantico del titolo.',
    },
    content: {
      control: 'text',
      table: { category: 'Content' },
      description: 'HTML ricco (CMS-authored, trusted), renderizzato raw con la utility prose-ws.',
    },
    cta: { control: 'object', table: { category: 'Content' }, description: 'Cta { label, url, variant? }, opzionale.' },
    id: { control: 'text', table: { category: 'Content' }, description: 'Id sulla section per gli anchor link.' },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — titolo h2, contenuto ricco e cta ────────────────────────────── */

export const Default = { args: mocks.default };

/* ── HeadingH3 — stesso contenuto, titolo come h3 (riuso più in basso in pagina) */

export const HeadingH3 = { args: { ...mocks.default, heading: 'h3' } };

/* ── WithoutCta — solo testo, nessuna azione ───────────────────────────────── */

const { cta: _omitted, ...withoutCtaArgs } = mocks.default;

export const WithoutCta = { args: withoutCtaArgs };
