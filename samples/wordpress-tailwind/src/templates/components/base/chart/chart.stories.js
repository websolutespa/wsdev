import { renderTwig } from '~sb/twig';
import { initModules } from '~sb/modules';
import { demoCard, storyStack } from '~sb/story-helpers';
import data from './chart.twig.json';

const mocks = data.mocks['chart'];
const TWIG_ID = '@components/base/chart/chart.twig';

export default {
  title: 'Base/Chart',
  render: (args) => renderTwig(TWIG_ID, args),
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'bar', 'area', 'pie', 'donut'],
      description: 'Tipo di grafico Chart.js disegnato nel canvas.',
      table: { category: 'Appearance', defaultValue: { summary: 'line' } },
    },
    config: {
      control: 'object',
      description: 'ChartConfig: per ogni chiave, label/color/theme/icon; diventa una custom property --color-<key>.',
      table: { category: 'Content' },
    },
    data: {
      control: 'object',
      description: 'Dataset: { labels, series: [{ key, values }], keys? }.',
      table: { category: 'Content' },
    },
    options: {
      control: 'object',
      description: 'Merge nell\'oggetto options di Chart.js (passthrough JSON).',
      table: { category: 'Advanced' },
    },
    legend: {
      control: 'boolean',
      description: 'Renderizza la legenda HTML a partire da config.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Posizione della legenda.',
      table: { category: 'Appearance', defaultValue: { summary: 'bottom' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Nome accessibile dell\'immagine del grafico.',
      table: { category: 'Accessibility' },
    },
    id: { table: { disable: true } },
    class: { table: { disable: true } },
    attrs: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
};

const play = async ({ canvasElement }) => {
  await initModules(canvasElement);
};

/* ── Default — interactive playground ───────────────────────────────────── */

export const Default = { args: mocks['default'] };

/* ── Mounted — verifies chart.module.js draws into the canvas ────────────── */

export const Mounted = { args: mocks['default'], play };

/* ── Bar — distinct data shape (multi-category grouped series) ──────────── */

export const Bar = { args: mocks['bar'], play };

/* ── Catalog — all chart types + themed variant ──────────────────────────── */

/**
 * chart.module.js calls `new Chart(canvas, ...)` per [data-module="chart.module"]
 * node and returns a `chart.destroy()` cleanup; initModules discovers every
 * chart node in the rendered HTML, so multiple charts on one page are supported.
 */
export const Catalog = {
  parameters: { layout: 'padded' },
  render: () => {
    const CHART_TYPES = [
      {
        key: 'line',
        mock: mocks['default'],
        intro: 'Linea con due serie (desktop/mobile) su sei mesi. Usare per andamenti nel tempo.',
      },
      {
        key: 'area',
        mock: mocks['area'],
        intro: 'Internamente un chart <code>line</code> con <code>fill: true</code>. Ricavi cumulati per semestre.',
      },
      {
        key: 'pie',
        mock: mocks['pie'],
        intro: 'Serie singola. I colori delle fette seguono la sequenza dei token <code>chart-N</code>. Ripartizione traffico per browser.',
      },
      {
        key: 'donut',
        mock: mocks['donut'],
        intro: 'Tipo Chart.js <code>doughnut</code>. Serie singola: stato delle pratiche aperte.',
      },
      {
        key: 'themed',
        mock: mocks['themed'],
        intro:
          'Bar chart con colori <code>theme: { light, dark }</code> invece di <code>color</code> — ' +
          'ogni chiave genera valori diversi per light/dark tramite <code>.dark</code>.',
      },
    ];

    const cards = CHART_TYPES.map(({ key, mock, intro }) =>
      demoCard({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        intro,
        content: renderTwig(TWIG_ID, mock),
      })
    );

    return storyStack(...cards);
  },
  play,
};
