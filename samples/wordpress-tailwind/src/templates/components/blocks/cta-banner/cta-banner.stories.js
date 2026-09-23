import { renderTwig } from '~sb/twig';
import data from './cta-banner.twig.json';

const mocks = data.mocks['cta-banner'];
const TWIG_ID = '@components/blocks/cta-banner/cta-banner.twig';

export default {
  title: 'Blocks/CtaBanner',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    title: { control: 'text', table: { category: 'Content' }, description: 'Titolo della banda (richiesto).' },
    abstract: { control: 'text', table: { category: 'Content' }, description: 'Paragrafo di supporto sotto il titolo.' },
    cta: { control: 'object', table: { category: 'Content' }, description: 'Cta { label, url, variant? }: azione primaria.' },
    secondaryCta: { control: 'object', table: { category: 'Content' }, description: 'Cta { label, url, variant? }: azione secondaria, opzionale.' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'muted'],
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
      description: 'Colore della banda a piena larghezza.',
    },
    id: { control: 'text', table: { category: 'Content' }, description: 'Id sulla section per gli anchor link.' },
    class: { table: { disable: true } },
  },
  parameters: { layout: 'fullscreen' },
};

/* ── Default — variant primary, due cta ────────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Muted — banda su sfondo muted invece di primary ───────────────────────── */

export const Muted = { args: { ...mocks.default, variant: 'muted' } };

/* ── SingleCta — solo azione primaria, nessuna secondaria ──────────────────── */

const { secondaryCta: _omitted, ...singleCtaArgs } = mocks.default;

export const SingleCta = { args: singleCtaArgs };
