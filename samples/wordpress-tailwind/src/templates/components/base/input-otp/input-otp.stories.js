import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import data from './input-otp.twig.json';

const mocks = data.mocks['input-otp'];

export default {
  title: 'Base/InputOtp',
  render: (args) => renderTwig('@components/base/input-otp/input-otp.twig', args),
  parameters: { layout: 'centered' },
};

export const Default = { args: mocks['default'] };
export const Four = { args: mocks['four'] };
export const Alphanumeric = { args: mocks['alphanumeric'] };
export const Disabled = { args: mocks['disabled'] };
export const Invalid = { args: mocks['invalid'] };

/** Typing one digit fills slot 0 and the module auto-advances focus to slot 1. */
export const Typed = {
  args: mocks['default'],
  play: async ({ canvasElement }) => {
    await initModules(canvasElement);
    const slot = canvasElement.querySelector('[data-slot="input-otp-slot"]');
    slot.focus();
    slot.value = '1';
    slot.dispatchEvent(new Event('input', { bubbles: true }));
  },
};
