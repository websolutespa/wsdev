import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { matrixCard, storyStack } from '~sb/story-helpers';
import data from './input-otp.twig.json';

const mocks = data.mocks['input-otp'];
const TWIG_ID = '@components/base/input-otp/input-otp.twig';

export default {
  title: 'Base/InputOtp',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    name: {
      control: 'text',
      description: 'Name dell\'input nascosto che porta il valore combinato, OBBLIGATORIO.',
      table: { category: 'Content' },
    },
    maxLength: {
      control: 'number',
      description: 'Numero totale di slot.',
      table: { category: 'Content', defaultValue: { summary: '6' } },
    },
    groups: {
      control: 'object',
      description: 'Slot per gruppo, la somma deve essere uguale a maxLength (default [3, 3] se maxLength è 6).',
      table: { category: 'Content' },
    },
    pattern: {
      control: 'select',
      options: ['digits', 'alphanumeric'],
      description: 'Caratteri ammessi; determina inputmode="numeric"|"text".',
      table: { category: 'Behaviour', defaultValue: { summary: 'digits' } },
    },
    separator: {
      control: 'boolean',
      description: 'Mostra il separatore (trattino) tra i gruppi.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Emette aria-invalid="true" su ogni slot.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita ogni slot e l’input nascosto; il root si affievolisce.',
      table: { category: 'State' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Etichetta accessibile per il role="group".',
      table: { category: 'Accessibility', defaultValue: { summary: 'Codice di verifica' } },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Typed — play() interaction: typing a digit auto-advances focus ─────── */

/** Typing one digit fills slot 0 and the module auto-advances focus to slot 1. */
export const Typed = {
  args: mocks.default,
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const slot = canvasElement.querySelector('[data-slot="input-otp-slot"]');
    slot.focus();
    slot.value = '1';
    slot.dispatchEvent(new Event('input', { bubbles: true }));
  },
};

/* ── Catalog — mock scenarios + configuration × state matrix ─────────────── */

function otp(args) {
  return renderTwig(TWIG_ID, args);
}

const STATE_COLS = ['Default', 'Invalid', 'Disabled'];

const CONFIG_ROWS = [
  { key: 'default', label: '6 digits (2×3)', base: { name: 'codice-verifica' } },
  {
    key: 'four',
    label: '4 digits (1×4)',
    base: { name: 'otp-short', maxLength: 4, groups: [4], separator: false },
  },
  {
    key: 'alphanumeric',
    label: 'Alphanumeric',
    base: { name: 'otp-alnum', maxLength: 6, groups: [6], pattern: 'alphanumeric', separator: false, ariaLabel: 'Codice invito' },
  },
];

/**
 * OTP field configurations × validation states.
 * No static Hover/Focus/Active columns: the active-slot ring is driven by
 * `data-[active=true]`, set by the JS module on real focus — not expressible
 * with static classes.
 */
const configMatrix = matrixCard({
  title: 'OTP Configurations × States',
  rowAxisLabel: 'Configuration',
  intro:
    'Configurazioni del campo OTP × stati di validazione. <code>invalid</code> imposta ' +
    '<code>aria-invalid="true"</code> su ogni slot. <code>disabled</code> disabilita ogni slot ' +
    'e l\'input nascosto; <code>has-disabled:opacity-50</code> affievolisce l\'intero gruppo.',
  columns: STATE_COLS,
  rows: CONFIG_ROWS,
  renderCell: (col, row) => {
    if (col === 'Invalid') return otp({ ...row.base, invalid: true });
    if (col === 'Disabled') return otp({ ...row.base, disabled: true });
    return otp({ ...row.base });
  },
});

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => storyStack(configMatrix),
};
