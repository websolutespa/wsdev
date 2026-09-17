import Chart from 'chart.js/auto';

/**
 * Chart: chart.js drawing into the upstream ChartContainer markup.
 *
 * Colors never reach the canvas as `var()` — a 2D context cannot resolve custom
 * properties — so every paint reads the --color-<key> properties the Twig
 * ChartStyle block wrote on the container. That keeps the upstream contract
 * intact: change a key's value (or cross into `.dark`) and the chart follows,
 * because recolor() re-reads the computed values and updates in place.
 *
 * The tooltip is a Chart.js external tooltip rendered as upstream's
 * ChartTooltipContent DOM; the legend is server-rendered from the same config,
 * so Chart.js' own legend stays off.
 *
 * Integration API:
 *   in    CustomEvent 'chart:update' ({ detail: { data?, options? } }) on the root
 *   out   CustomEvent 'chart:rendered' ({ detail: { type } }, bubbles: true)
 */

/** Upstream ChartTooltipContent class strings. */
const TOOLTIP_LABEL = 'font-medium';
const TOOLTIP_ITEMS = 'grid gap-1.5';
const TOOLTIP_ITEM = 'flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground';
const TOOLTIP_INDICATOR = 'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg) h-2.5 w-2.5';
const TOOLTIP_ROW = 'flex flex-1 items-center justify-between leading-none';
const TOOLTIP_NAME = 'text-muted-foreground';
const TOOLTIP_VALUE = 'font-mono font-medium text-foreground tabular-nums';

const AREA_ALPHA = 0.2;

/** chart.js type + the extras our own `type` names imply. */
function resolveType(type) {
  if (type === 'area') return { type: 'line', area: true };
  if (type === 'donut') return { type: 'doughnut', cutout: '60%' };
  return { type, area: false };
}

/** Same trick as upstream's indicator colors: a translucent copy of the series color. */
function withAlpha(color, alpha) {
  if (!color) return 'transparent';
  const value = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return `${value}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  }
  if (/^(rgb|hsl|oklch|lab|lch|color)\(/i.test(value)) {
    return value.replace(/\s*\/\s*[\d.%]+\s*\)$/, ')').replace(/\)$/, ` / ${alpha})`);
  }
  return value;
}

export default function ChartModule(node) {
  const canvas = node.querySelector('[data-slot="chart-canvas"]');
  const source = node.querySelector('[data-slot="chart-config"]');
  const tooltipHost = node.querySelector('[data-slot="chart-tooltip"]');
  const tooltipContent = node.querySelector('[data-slot="chart-tooltip-content"]');
  if (!canvas || !source) return () => {};

  let spec;
  try {
    spec = JSON.parse(source.textContent);
  } catch {
    return () => {};
  }
  const config = spec.config || {};
  const data = spec.data || {};
  const labels = data.labels || [];
  const series = data.series || [];
  const { type, area, cutout } = resolveType(spec.type || 'line');
  const isCircular = type === 'pie' || type === 'doughnut';
  const configKeys = Object.keys(config);
  const cleanups = [];
  const on = (target, type_, handler, options) => {
    target.addEventListener(type_, handler, options);
    cleanups.push(() => target.removeEventListener(type_, handler, options));
  };

  /** Reads one --color-<key> as the container currently computes it. */
  function colorOf(key) {
    return getComputedStyle(node).getPropertyValue(`--color-${key}`).trim();
  }

  function tokenColor(name) {
    return getComputedStyle(node).getPropertyValue(name).trim();
  }

  /** pie/donut paint one slice per config key; the other types one line/bar per series. */
  function sliceColors() {
    const keys = data.keys && data.keys.length ? data.keys : configKeys;
    return labels.map((_, i) => colorOf(keys[i % keys.length]));
  }

  function buildDatasets() {
    if (isCircular) {
      const values = series.length ? series[0].values : [];
      return [{
        label: series.length ? (config[series[0].key] || {}).label || series[0].key : '',
        data: values,
        backgroundColor: sliceColors(),
        borderColor: tokenColor('--background'),
        borderWidth: 2,
      }];
    }
    return series.map((entry) => {
      const color = colorOf(entry.key);
      const dataset = {
        label: (config[entry.key] || {}).label || entry.key,
        data: entry.values,
        borderColor: color,
        backgroundColor: area ? withAlpha(color, AREA_ALPHA) : color,
      };
      if (type === 'line') {
        dataset.tension = 0.3;
        dataset.pointRadius = 3;
        dataset.pointBackgroundColor = color;
        if (area) dataset.fill = true;
      }
      if (type === 'bar') {
        dataset.borderRadius = 4;
        dataset.borderSkipped = false;
      }
      return dataset;
    });
  }

  function renderTooltip(context) {
    if (!tooltipHost || !tooltipContent) return;
    const model = context.tooltip;
    if (!model.opacity) {
      tooltipHost.hidden = true;
      return;
    }
    tooltipContent.textContent = '';
    if (model.title && model.title.length) {
      const label = document.createElement('div');
      label.className = TOOLTIP_LABEL;
      label.textContent = model.title.join(' ');
      tooltipContent.appendChild(label);
    }
    const items = document.createElement('div');
    items.className = TOOLTIP_ITEMS;
    (model.dataPoints || []).forEach((point) => {
      const key = isCircular
        ? (data.keys && data.keys[point.dataIndex]) || configKeys[point.dataIndex]
        : (series[point.datasetIndex] || {}).key;
      const item = config[key] || {};
      const swatchColor = isCircular ? sliceColors()[point.dataIndex] : colorOf(key);

      const row = document.createElement('div');
      row.className = TOOLTIP_ITEM;
      if (item.icon) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('aria-hidden', 'true');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', `#icon-${item.icon}`);
        svg.appendChild(use);
        row.appendChild(svg);
      } else {
        const indicator = document.createElement('div');
        indicator.className = TOOLTIP_INDICATOR;
        indicator.style.setProperty('--color-bg', swatchColor);
        indicator.style.setProperty('--color-border', swatchColor);
        row.appendChild(indicator);
      }

      const inner = document.createElement('div');
      inner.className = TOOLTIP_ROW;
      const name = document.createElement('span');
      name.className = TOOLTIP_NAME;
      name.textContent = isCircular ? labels[point.dataIndex] : item.label || key;
      const value = document.createElement('span');
      value.className = TOOLTIP_VALUE;
      value.textContent = typeof point.raw === 'number' ? point.raw.toLocaleString() : String(point.raw);
      inner.append(name, value);
      row.appendChild(inner);
      items.appendChild(row);
    });
    tooltipContent.appendChild(items);

    tooltipHost.hidden = false;
    tooltipHost.style.transform = `translate(calc(${model.caretX}px - 50%), calc(${model.caretY}px - 100% - 8px))`;
  }

  function buildOptions() {
    const border = tokenColor('--border');
    const muted = tokenColor('--muted-foreground');
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: renderTooltip, mode: 'index', intersect: false },
      },
    };
    if (cutout) base.cutout = cutout;
    if (!isCircular) {
      const axis = {
        grid: { color: border },
        border: { display: false },
        ticks: { color: muted, font: { size: 12 } },
      };
      base.scales = { x: { ...axis, grid: { display: false } }, y: axis };
    }
    if (spec.options && typeof spec.options === 'object') {
      Object.entries(spec.options).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object') {
          base[key] = { ...base[key], ...value };
        } else {
          base[key] = value;
        }
      });
    }
    return base;
  }

  const chart = new Chart(canvas, { type, data: { labels, datasets: buildDatasets() }, options: buildOptions() });
  node.dispatchEvent(new CustomEvent('chart:rendered', { bubbles: true, detail: { type: spec.type } }));

  /** Re-reads every computed color; the container may now sit under `.dark`. */
  function recolor() {
    const next = buildDatasets();
    chart.data.datasets.forEach((dataset, i) => Object.assign(dataset, next[i]));
    const border = tokenColor('--border');
    const muted = tokenColor('--muted-foreground');
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach((scale) => {
        if (scale.grid && scale.grid.color) scale.grid.color = border;
        if (scale.ticks) scale.ticks.color = muted;
      });
    }
    chart.update('none');
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  on(media, 'change', recolor);
  // The class toggle is what actually flips this page (see common/colorScheme.js);
  // the media query only matters before a preference is stored.
  const themeObserver = new MutationObserver(recolor);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  on(node, 'chart:update', (event) => {
    const detail = event.detail || {};
    if (detail.data) {
      if (detail.data.labels) chart.data.labels = detail.data.labels;
      if (detail.data.series) {
        series.length = 0;
        series.push(...detail.data.series);
        chart.data.datasets = buildDatasets();
      }
    }
    if (detail.options) Object.assign(chart.options, detail.options);
    chart.update();
  });

  return () => {
    themeObserver.disconnect();
    cleanups.forEach((fn) => fn());
    chart.destroy();
  };
}
