import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './field.twig.json';

const mocks = data.mocks['field'];
const TWIG_ID = '@components/base/field/field.twig';

export default {
  title: 'Base/Field',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Testo della FieldLabel.',
      table: { category: 'Content' },
    },
    for: {
      control: 'text',
      description: 'Id del controllo a cui la label è collegata; richiesto quando è impostato label.',
      table: { category: 'Accessibility' },
    },
    description: {
      control: 'text',
      description: 'Testo della FieldDescription.',
      table: { category: 'Content' },
    },
    error: {
      control: 'text',
      description: 'Testo della FieldError, mostrato quando invalid è true.',
      table: { category: 'Content' },
    },
    errors: {
      control: 'object',
      description:
        'Alternativa a error: array di { message? }, deduplicati e resi come lista quando più di ' +
        'un messaggio univoco resta.',
      table: { category: 'Content' },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'responsive'],
      description: 'Layout del campo.',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Imposta la semantica data-invalid/aria-invalid e il colore text-destructive.',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      description: 'Imposta data-disabled="true".',
      table: { category: 'State' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'centered' },
};

/* ── Default — interactive playground ─────────────────────────────────── */

export const Default = { args: mocks.default };

/* ── Catalog — layout and state demo cards ────────────────────────────────── */

/**
 * Field is a layout-wrapper component with embed-based slot composition.
 * demoCards are more readable than a matrix because each orientation has a
 * distinct visual structure and the control block requires an embed template,
 * not a plain prop — a matrix would collapse the layout differences.
 */
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    /* 1 — Vertical (default): label + input + description */
    const verticalSrc = `
{% embed '@components/base/field/field.twig' with {
  label: label, for: fieldFor, description: description
} only %}
  {% block control %}
    {% include '@components/base/input/input.twig' with {
      id: fieldFor, name: fieldFor, placeholder: 'es. Aurora Rebranding 2026'
    } only %}
  {% endblock %}
{% endembed %}`;

    const verticalCard = demoCard({
      title: 'Vertical (default)',
      intro: '<code>orientation="vertical"</code> (default): label sopra, controllo, descrizione sotto.',
      content: renderTwigSource(verticalSrc, {
        label: mocks.default.label,
        fieldFor: mocks.default.for,
        description: mocks.default.description,
      }),
    });

    /* 2 — Horizontal: label inline with control */
    const horizontalSrc = `
{% embed '@components/base/field/field.twig' with {
  orientation: 'horizontal', label: label, for: fieldFor, description: description
} only %}
  {% block control %}
    {% include '@components/base/switch/switch.twig' with {
      id: fieldFor, name: fieldFor, checked: true
    } only %}
  {% endblock %}
{% endembed %}`;

    const horizontalCard = demoCard({
      title: 'Horizontal',
      intro:
        '<code>orientation="horizontal"</code>: label e controllo sulla stessa riga — utile per righe di impostazioni compatte.',
      content: renderTwigSource(horizontalSrc, {
        label: mocks.horizontal.label,
        fieldFor: mocks.horizontal.for,
        description: mocks.horizontal.description,
      }),
    });

    /* 3 — With error: invalid field + error message */
    const errorSrc = `
{% embed '@components/base/field/field.twig' with {
  label: label, for: fieldFor, invalid: true, error: error
} only %}
  {% block control %}
    {% include '@components/base/input/input.twig' with {
      id: fieldFor, name: fieldFor,
      value: 'IT0000000000', invalid: true, required: true
    } only %}
  {% endblock %}
{% endembed %}`;

    const errorCard = demoCard({
      title: 'With error',
      intro:
        '<code>data-invalid="true"</code> sul root del field imposta ' +
        '<code>data-[invalid=true]:text-destructive</code>. Lo slot errore renderizza un messaggio ' +
        '<code>role="alert"</code>.',
      content: renderTwigSource(errorSrc, {
        label: mocks.invalid.label,
        fieldFor: mocks.invalid.for,
        error: mocks.invalid.error,
      }),
    });

    /* 4 — Disabled: entire field group dimmed */
    const disabledSrc = `
{% embed '@components/base/field/field.twig' with {
  label: label, for: fieldFor, description: description, disabled: true
} only %}
  {% block control %}
    {% include '@components/base/input/input.twig' with {
      id: fieldFor, name: fieldFor, value: 'Piano Premium', disabled: true
    } only %}
  {% endblock %}
{% endembed %}`;

    const disabledCard = demoCard({
      title: 'Disabled',
      intro:
        '<code>data-disabled="true"</code> attiva <code>group-data-[disabled=true]/field:opacity-50</code> ' +
        'sulla label. Anche l\'input deve portare esplicitamente disabled.',
      content: renderTwigSource(disabledSrc, {
        label: mocks.disabled.label,
        fieldFor: mocks.disabled.for,
        description: mocks.disabled.description,
      }),
    });

    return storyStack(verticalCard, horizontalCard, errorCard, disabledCard);
  },
};
