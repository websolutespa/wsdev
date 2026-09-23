import { renderTwig } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './label.twig.json';

const mocks = data.mocks['label'];
const TWIG_ID = '@components/base/label/label.twig';
const INPUT_TWIG_ID = '@components/base/input/input.twig';

export default {
  title: 'Base/Label',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    text: {
      control: 'text',
      description: 'Testo visibile della label, OBBLIGATORIO.',
      table: { category: 'Content' },
    },
    for: {
      control: 'text',
      description: 'Id del campo a cui la label è collegata, OBBLIGATORIO.',
      table: { category: 'Accessibility' },
    },
    slot: {
      control: 'text',
      description: 'Valore di data-slot (default \'label\'); usato quando l\'include riempie una parte di un altro componente (es. \'field-label\').',
      table: { category: 'Advanced', disable: true },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — standalone and paired with input ───────────────────────────── */

/**
 * Label è un componente piccolo e a bassa superficie — un demoCard è più
 * leggibile di una matrice. Due card:
 * 1. Label standalone (semplice, con indicatore di campo obbligatorio).
 * 2. Abbinata a un input (abilitato vs disabilitato) — mostra le classi
 *    peer-disabled:* che affievoliscono la label quando l'input associato è disabilitato.
 */
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const standaloneCard = demoCard({
      title: 'Label — standalone',
      intro: 'Label semplice, etichetta con indicatore di campo obbligatorio e mock scenario "disabled" (override della classe group-data-disabled).',
      content: `
        <div class="flex flex-col gap-4">
          <div>
            ${renderTwig(TWIG_ID, mocks.default)}
          </div>
          <div>
            ${renderTwig(TWIG_ID, { text: 'Nome del progetto *', for: 'demo-nome' })}
          </div>
          <div class="group" data-disabled="true">
            ${renderTwig(TWIG_ID, mocks.disabled)}
          </div>
        </div>`,
    });

    const withInputCard = demoCard({
      title: 'Label — with input',
      intro:
        'Ordine nel DOM: input poi label (flex-col-reverse mantiene la label visivamente sopra). ' +
        'L\'input porta <code>class="peer"</code> così le classi upstream ' +
        '<code>peer-disabled:opacity-50</code> affievoliscono la label del campo disabilitato.',
      content: `
        <div class="flex w-full max-w-2xl items-start gap-8">
          <div class="flex flex-1 flex-col-reverse gap-2">
            ${renderTwig(INPUT_TWIG_ID, {
    type: 'email',
    name: 'email-newsletter',
    id: 'email-newsletter',
    placeholder: 'nome@studiopilota.it',
    class: 'peer',
  })}
            ${renderTwig(TWIG_ID, { text: 'Indirizzo email', for: 'email-newsletter' })}
          </div>
          <div class="flex flex-1 flex-col-reverse gap-2">
            ${renderTwig(INPUT_TWIG_ID, {
    type: 'email',
    name: 'email-archivio',
    id: 'email-archivio',
    placeholder: 'progetto archiviato',
    disabled: true,
    class: 'peer',
  })}
            ${renderTwig(TWIG_ID, { text: 'Email referente (archiviata)', for: 'email-archivio' })}
          </div>
        </div>`,
    });

    return storyStack(standaloneCard, withInputCard);
  },
};
