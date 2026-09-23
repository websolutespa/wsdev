import React from 'react';
import { addons, types, useArgTypes } from 'storybook/manager-api';
import { AddonPanel } from 'storybook/internal/components';

// ── "Parametri" panel ──────────────────────────────────────────────────────
// Storybook 10's Controls panel shows only the control widget (no description
// or default columns) and this project deliberately disables autodocs pages
// (see .storybook/preview.ts `codePanel`). This local manager addon surfaces
// the per-argType `description`, `table.category` and `table.defaultValue`
// as a dedicated panel next to Controls, so component prop contracts and their
// dependencies stay visible in the UI without turning autodocs back on.
// It is generic: any story that defines rich `argTypes` gets documented here.

const ADDON_ID = 'wordpress-tailwind/params';
const PANEL_ID = `${ADDON_ID}/panel`;

type ArgType = {
  name?: string;
  description?: string;
  table?: { category?: string; defaultValue?: { summary?: string } };
};

// argTypes descriptions use light Markdown (**bold**, `code`) for the (unused
// here) Docs table; strip it so the panel renders clean plain text.
const stripMd = (s: string) => s.replace(/\*\*/g, '').replace(/`/g, '');

const UNCATEGORIZED = 'Altri';

const ParamsPanel: React.FC = () => {
  const raw = useArgTypes() as unknown;
  // useArgTypes may return the map directly or wrapped in { argTypes }.
  const argTypes = (raw && (raw as { argTypes?: Record<string, ArgType> }).argTypes
    ? (raw as { argTypes: Record<string, ArgType> }).argTypes
    : (raw as Record<string, ArgType>)) || {};

  const entries = Object.entries(argTypes);

  if (entries.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 13, opacity: 0.7 }}>
        Questa storia non definisce <code>argTypes</code> documentati.
      </div>
    );
  }

  const groups = new Map<string, [string, ArgType][]>();
  for (const [key, at] of entries) {
    const cat = at?.table?.category || UNCATEGORIZED;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push([key, at]);
  }

  return (
    <div style={{ padding: 12, fontSize: 13, lineHeight: 1.5 }}>
      {[...groups.entries()].map(([cat, rows]) => (
        <section key={cat} style={{ marginBottom: 18 }}>
          <h3
            style={{
              margin: '4px 0 8px',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              opacity: 0.55,
            }}
          >
            {cat}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {rows.map(([key, at]) => {
                const def = at?.table?.defaultValue?.summary;
                return (
                  <tr
                    key={key}
                    style={{ borderTop: '1px solid rgba(128,128,128,0.22)', verticalAlign: 'top' }}
                  >
                    <td
                      style={{
                        padding: '8px 14px 8px 0',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {at?.name || key}
                      {def != null && def !== '' && (
                        <div style={{ fontWeight: 400, opacity: 0.5, fontSize: 11 }}>
                          default: {def}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px 0' }}>
                      {at?.description ? stripMd(at.description) : <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Parametri',
    render: ({ active }) => (
      <AddonPanel active={!!active}>
        <ParamsPanel />
      </AddonPanel>
    ),
  });
});
