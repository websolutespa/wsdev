import { renderTwig, renderTwigSource } from '~sb/twig';
import { demoCard, matrixCard, storyStack } from '~sb/story-helpers';
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

/* ── Catalog — variants × content layouts, edge cases, slots, custom colors ─ */

const alertColumn = (html) => `<div class="mx-auto flex w-full max-w-xl flex-col gap-4">${html}</div>`;
const renderMocks = (keys) => alertColumn(keys.map((key) => renderTwig(TWIG_ID, mocks[key])).join(''));

export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const VARIANTS = [
      { key: 'default', label: 'DEFAULT' },
      { key: 'destructive', label: 'DESTRUCTIVE' },
    ];

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
        const copy = mocks[row.key];
        const args = { variant: row.key, title: copy.title };
        if (col !== 'SOLO TITOLO') args.description = copy.description;
        if (col === '+ ICONA') args.icon = copy.icon;
        return `<div class="w-full max-w-md mx-auto">${renderTwig(TWIG_ID, args)}</div>`;
      },
    });

    const compositionsCard = demoCard({
      title: 'Content combinations',
      intro:
        'Titolo, descrizione e icona sono tutti opzionali: senza icona la prima colonna della griglia ' +
        'collassa a <code>0</code> e il testo resta allineato al bordo.',
      content: renderMocks(['default', 'icon-description', 'description-only', 'icon-title']),
    });

    const longContentCard = demoCard({
      title: 'Long content',
      intro:
        'Il titolo è limitato a una riga (<code>line-clamp-1</code>) e tronca con i puntini; ' +
        'la descrizione va a capo liberamente mantenendo l\'allineamento con l\'icona.',
      content: renderMocks(['long-title', 'long-description', 'long-content']),
    });

    const destructiveCard = demoCard({
      title: 'Destructive',
      intro:
        'La variante <code>destructive</code> colora titolo, icona e descrizione. Per contenuto ricco ' +
        '(paragrafi, liste) si sovrascrive il block <code>description</code> con il wrapper documentato nel twig.',
      content: alertColumn(
        renderTwig(TWIG_ID, mocks['destructive']) +
          renderTwigSource(`{% embed '@components/base/alert/alert.twig' with { variant: 'destructive', icon: 'circle-alert', title: title, intro: intro, items: items } only %}
  {% block description %}<div data-slot="alert-description" class="col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed"><p>{{ intro }}</p><ul class="list-disc pl-5">{% for item in items %}<li>{{ item }}</li>{% endfor %}</ul></div>{% endblock %}
{% endembed %}`, {
            title: 'Impossibile elaborare il pagamento.',
            intro: 'Verifica i dati di fatturazione e riprova.',
            items: ['Controlla i dati della carta', 'Assicurati che i fondi siano sufficienti', 'Verifica l\'indirizzo di fatturazione'],
          }),
      ),
    });

    const ACTION_SOURCE = `{% embed '@components/base/alert/alert.twig' with { icon: icon, title: title, description: description, actionLabel: actionLabel, actionVariant: actionVariant } only %}
  {% block action %}<div data-slot="alert-action" class="absolute top-2.5 right-4">{% include '@components/base/button/button.twig' with { label: actionLabel, variant: actionVariant, size: 'xs' } only %}</div>{% endblock %}
{% endembed %}`;

    const actionCard = demoCard({
      title: 'With action',
      intro:
        'Lo slot <code>alert-action</code> posiziona un\'azione in alto a destra; il root riserva lo spazio ' +
        'con <code>has-data-[slot=alert-action]:pr-18</code>. Richiede un override del block <code>action</code> ' +
        'con il wrapper documentato nel twig.',
      content: alertColumn(
        renderTwigSource(ACTION_SOURCE, {
          icon: 'circle-alert',
          title: 'Le email selezionate sono state segnate come spam.',
          actionLabel: 'Annulla',
          actionVariant: 'outline',
        }) +
          renderTwigSource(ACTION_SOURCE, {
            icon: 'circle-check',
            title: 'La modalità scura è disponibile',
            description: 'Attivala dalle impostazioni del profilo per iniziare.',
            actionLabel: 'Attiva',
            actionVariant: 'default',
          }),
      ),
    });

    const semanticCard = demoCard({
      title: 'Semantic icons & custom colors',
      intro:
        'L\'icona comunica il tono (<code>circle-check</code>, <code>info</code>, <code>triangle-alert</code>). ' +
        'Le varianti sono solo due: per un avviso colorato si passano utility via <code>class</code> ' +
        'con il modificatore <code>!</code>, perché devono vincere su <code>bg-card</code>/<code>text-card-foreground</code> della variante.',
      content: renderMocks(['success', 'info', 'custom-colors']),
    });

    return storyStack(alertsCard, compositionsCard, longContentCard, destructiveCard, actionCard, semanticCard);
  },
};
