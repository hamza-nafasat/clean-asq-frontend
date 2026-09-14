# Frontend tests

Three files, one per area of the QA testing script (Parts 1-5):

```
src/test/
  ai.test.js        the AI assistant widget and AI-mode admin flows: screen awareness,
                    field errors, translation, document chat, tool handling
  stepper.test.js   the application flow, in order: header, OTP, company name/URL,
                    IDMission, company info, ownership, bank, display text, downloads,
                    agreement, submission, the application PDF, the hidden owner form
  other.test.js     branding, email templates, strategies, the Application Forms page,
                    sign-in and password reset, drafts and applications pages
```

## Running

```bash
npm test    # all three files
```

## Which file a test belongs in

- **ai** - the behaviour belongs to the AI assistant widget, or to a Part 4
  "ask AI to ..." flow.
- **stepper** - it happens while an applicant fills in the application.
- **other** - everything else.

Inside each file, runtime tests of pure logic come first, then source-text
contracts.

## Conventions

### Naming

Every file opens with a header block naming its category, the QA items it covers
and its sections.

Suites are nested so the runner output states module ownership on its own:

```
<module path> · <unit>          top-level describe
  <function>()                  inner describe
    <expected behaviour>        it
```

```
▶ lib · sectionCompletion
  ▶ sectionsForPdf()
    ✔ [QA 3.45] excludes a hidden section the applicant never completed
```

- Prefix an `it` with `[QA x.y]` **only** when it guards a numbered item from the
  QA testing script.
- Name an `it` after the behaviour, not the implementation.
- Group edge cases under a `malformed input` describe.

### Open items

A test for a QA item that is still broken is written as the passing behaviour and
marked `todo`:

```js
it("[QA 5.14] offers a \"Save owner\" button next to \"Remove\"", { todo: "open: each owner row only has Remove" }, () => {
  // ...
});
```

It runs and reports (`# TODO`) without failing `npm test`. When the fix lands the
runner prints it as `ok ... # TODO` - remove the `todo` option then.

### Style

- Runner is the Node built-in (`node:test` + `node:assert/strict`) with no DOM, so
  these cover pure logic (helpers, reducers, selectors). Extracting logic out of a
  component to make it testable is preferred over pulling in a DOM test runner.
- Behaviour that lives in JSX, or in a module that resolves the Vite `@/` alias or
  `import.meta.env`, is asserted against source text instead. Scope each assertion
  to the function or block it guards (see `blockOf` / `between`), so a match
  elsewhere in the file cannot make it pass.
- Use `describe`/`it`, never bare `test()`.
- Imports are relative (`../lib/...`), not the `@/` alias, because `node --test`
  resolves without Vite.
- Cross-repo contracts (backend tool names, navigation pages) read `../backend`
  and are skipped when that checkout is not present.
