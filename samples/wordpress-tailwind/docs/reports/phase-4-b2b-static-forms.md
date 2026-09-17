# Report — Fase 4 / B2b: componenti statici, parte 2 + form (2026-09-17)

Agent Sonnet; revisione e commit dell'orchestratore. Dopo il batch: 28 componenti in `base/`.

## Componenti

| Componente | Gruppo | Figma | Note |
|---|---|---|---|
| native-select | forms | upstream-only | `options[]`/`optgroups[]`, size default/sm |
| progress | feedback | upstream-only | unico inline style (`transform`), eccezione port esistente |
| spinner | feedback | kit, nessun override | default 16 px coincide; prop `size` additiva (12/16/20/24/32 = set del kit) |
| table | data-display | kit, 2 override | `h-10`→`h-12` (head 48), `px-2`→`px-3`; cella `p-2` → `h-11 py-2 px-3` esplicito (44 px) |
| breadcrumb | data-display | upstream-only | `items[]`, ellipsis, `aria-current` |
| pagination | data-display | upstream-only | prev/next via `button.twig`; etichetta sempre visibile (2 eccezioni port: `button.twig` non riproduce `hidden sm:block`); link pagina con classi ghost/outline inline |
| button-group | forms | kit, nessun override | il contenitore non ha misure proprie; proposte del diff giudicate rumore |
| input-group | forms | kit, 1 override | `rounded-md`→`rounded-4xl` (26 px, pill); `has-[>textarea]:rounded-2xl` aggiunto per il caso textarea |
| field | forms | kit, 1 override | FieldSet `gap-6`→`gap-3` (12 px); label inline (limite slot di `label.twig`) |
| scroll-area | data-display | upstream-only, port CSS | overflow nativo + `scroll-area.css` registrato in `components.css`; slot scrollbar/thumb decorativi |

## Form

- `src/js/common/formValidation.js`: `getMessage`, `findErrorSlot` (field-error → `.frm_error` → crea `<p data-slot="field-error">`), `setInvalid` (aria-invalid, `data-invalid`, `aria-describedby` via `uid`).
- `base/field/form.module.js` per qualunque `<form data-module="form.module">`: validazione nativa su blur e submit, focus al primo invalido, honeypot `[data-honeypot]`, submit `fetch` opzionale (`data-submit="fetch"`, `aria-busy`, `data-state="submitting"`). Eventi: `form:invalid {invalid[]}`, `form:submitted {native:true}|{ok,status,data}`, `form:error {error}` (documentati in `PORTING.md` §Integration API).
- `src/css/adapters/formidable.css`: `@apply` delle classi dei componenti su `.frm_form_field`, `.frm_primary_label`, `.frm_description`, `.frm_error`, input/textarea/select, `.frm_submit button`; import commentato in `globals.css`; verificato in build (regole presenti in `globals.min.css`). `.frm_checkbox`/`.frm_radio` placeholder finché checkbox/radio non sono portati (B6).
- `src/docs/forms.twig`: form demo con `field` (embed) + input/textarea/native-select + honeypot + submit; sezione con markup Formidable statico e istruzioni per abilitare l'adapter.

## Gate

`check:classes` 28/28 exit 0 · docs page e forms page 200 senza errori Twig · build exit 0 (`dist/docs/forms.html`, chunk `form.module.min.js`) · eslint solo i tolerati.

## Follow-up (B8)

- Parametro `slot?` (e resa dell'etichetta responsive) su `button.twig`/`separator.twig`/`label.twig`: il limite è emerso in pagination, button-group, field, oltre che in attachment e item.
- Completare `.frm_checkbox`/`.frm_radio` nell'adapter dopo B6.
