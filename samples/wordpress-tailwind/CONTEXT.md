# CONTEXT — glossario del sample `wordpress-tailwind`

Vocabolario condiviso del progetto. Solo termini e significati: le decisioni stanno in `docs/DECISIONS.md` e `docs/adr/`, le convenzioni tecniche in `PORTING.md`.

- **Frontend workspace** — questo sample: progetto Vite + Twig che autora componenti e asset. Non è un tema WordPress e non contiene PHP.
- **Host theme** — il tema Timber esterno (cartelle sorelle `../views`, `../static`, `../templates`) in cui `build:wp`/`watch:wp` copiano twig e bundle.
- **Upstream** — il registry shadcn/ui nello stile `new-york-v4`, sorgente delle stringhe di classe.
- **Kit** — il file Figma "shadcn/ui kit for Figma – Boilerplate" aziendale, sorgente dei token e della verità visiva dei kit component.
- **Kit component** — componente presente come pagina nel kit e misurato in `tokens/figma-components/<name>.json`; per esso Figma prevale sull'upstream.
- **Upstream-only component** — componente assente dal kit; segue l'upstream byte-identical.
- **Figma override** — sostituzione di una singola utility upstream motivata dal kit, registrata in `scripts/upstream-exceptions.json` con `source: "figma"` e node id.
- **Port exception** — deviazione dall'upstream imposta dalla piattaforma (niente React/Radix), `source: "port"`.
- **Zona marker** — blocco di `globals.css` delimitato da `figma:<block> START/END`, scritto dall'importer dei token; tutto il resto è project-owned.
- **Token semantico** — custom property shadcn di ruolo (`--primary`, `--background`, …), light in `:root`, dark in `.dark`.
- **Primitiva** — colore letterale di palette (`--color-brand-blue-800`), emessa in `@theme` così genera utility.
- **Modulo** — file `<name>.module.js` che dà comportamento a un componente: `export default (node) => dispose`, caricato via `data-module`.
- **Integration API** — il contratto pubblico dei moduli verso il host theme: CustomEvent `<componente>:<verbo>` in ingresso, `<componente>:<participio>` in uscita, hook `data-*`.
- **Form adapter** — foglio CSS opzionale che veste il markup di un plugin WP (Formidable) con le classi dei componenti; non è un componente.
- **Docs page** — pagina di showcase in `src/docs/`, esiste solo nel frontend workspace e non è mai copiata nel host theme.
- **Gate** — controllo automatico che deve passare prima che un componente sia considerato fatto (`check:classes`, build, render, checklist tastiera, axe).
