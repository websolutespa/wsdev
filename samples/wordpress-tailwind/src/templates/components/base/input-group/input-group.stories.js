import { renderTwig } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
import data from './input-group.twig.json';

const mocks = data.mocks['input-group'];
const TWIG_ID = '@components/base/input-group/input-group.twig';

export default {
  title: 'Base/InputGroup',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    input: {
      control: 'object',
      description:
        'Props del controllo <input>: { type?, name?, id?, value?, placeholder?, disabled?, ' +
        'required?, invalid?, ariaLabel?, attrs? }. Ignorato se è impostato textarea.',
      table: { category: 'Content' },
    },
    textarea: {
      control: 'object',
      description:
        'Props del controllo <textarea>: { name?, id?, value?, placeholder?, rows?, disabled?, ' +
        'required?, invalid?, ariaLabel?, attrs? }.',
      table: { category: 'Content' },
    },
    addonStart: {
      control: 'object',
      description:
        'Addon iniziale: { text?, icon?, align?: \'inline-start\'|\'block-start\', button?: ' +
        '{ label?, icon?, ariaLabel?, disabled?, size? } }.',
      table: { category: 'Content' },
    },
    addonEnd: {
      control: 'object',
      description:
        'Addon finale: { text?, icon?, align?: \'inline-end\'|\'block-end\', button?: ' +
        '{ label?, icon?, ariaLabel?, disabled?, size? } }.',
      table: { category: 'Content' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — mock scenarios + configuration × state matrix ─────────────── */

function ig(args) {
  return renderTwig(TWIG_ID, args);
}

const mocksCard = demoCard({
  title: 'Mock scenarios',
  intro: 'Tutti gli scenari definiti in <code>input-group.twig.json</code>.',
  content: `<div class="flex flex-col gap-3 max-w-sm">
    ${ig(mocks['with-button'])}
    ${ig(mocks.textarea)}
    ${ig(mocks.invalid)}
  </div>`,
});

/**
 * Configurations (rows) × states (columns). No static Hover/Focus/Active
 * columns: focus-visible is driven by has-[[data-slot=input-group-control]:focus-visible]
 * on the group wrapper (native browser :focus-visible, not a class we can force statically).
 */
const STATE_COLS = ['Default', 'Invalid', 'Disabled'];

const CONFIG_ROWS = [
  {
    key: 'bare',
    label: 'Bare',
    base: { input: { type: 'email', placeholder: 'nome@azienda.it', ariaLabel: 'Email aziendale' } },
  },
  {
    key: 'startIcon',
    label: 'Start Icon',
    base: {
      addonStart: { icon: 'search' },
      input: { type: 'search', placeholder: 'Cerca nel sito', ariaLabel: 'Cerca' },
    },
  },
  {
    key: 'endButton',
    label: 'End Button',
    base: {
      addonEnd: { button: { icon: 'x', ariaLabel: 'Svuota campo' } },
      input: { placeholder: 'nome-progetto', ariaLabel: 'Nome dominio' },
    },
  },
  {
    key: 'startText',
    label: 'Start Text',
    base: {
      addonStart: { text: 'https://' },
      input: { placeholder: 'esempio.it', ariaLabel: 'URL sito' },
    },
  },
];

const configMatrix = matrixCard({
  title: 'Input Group States',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni × stati. Invalid attiva ' +
    '<code>has-[[data-slot][aria-invalid=true]]:border-destructive</code> sul wrapper del gruppo. ' +
    'Disabled attiva <code>data-disabled="true"</code> sul gruppo (opacità degli addon) più ' +
    'l\'attributo nativo <code>disabled</code> sull\'input.',
  columns: STATE_COLS,
  rows: CONFIG_ROWS,
  center: false,
  renderCell: (col, row) => {
    if (col === 'Invalid') {
      return ig({ ...row.base, input: { ...row.base.input, invalid: true } });
    }
    if (col === 'Disabled') {
      return ig({ ...row.base, input: { ...row.base.input, disabled: true } });
    }
    return ig({ ...row.base });
  },
});

const blockAlignCard = demoCard({
  title: 'Block-aligned addon',
  intro: 'L\'align <code>block-end</code> impila l\'addon sotto il controllo, usato tipicamente con textarea.',
  content: ig(mocks.textarea),
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(mocksCard, configMatrix, blockAlignCard),
};
