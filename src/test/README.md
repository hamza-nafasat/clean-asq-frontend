# Frontend tests

Mirrors the layout of `src/`, so a test lives at the same path as the code it covers.

```
src/test/
  lib/sectionCompletion.test.js           -> src/lib/sectionCompletion.js
  lib/executeBrandingAssignment.test.js   -> src/lib/executeBrandingAssignment.js
```

## Running

```bash
npm test    # every *.test.js under src/test
```

## Conventions

### Naming

Every file opens with a header block naming the module, the unit under test, and
what it guards:

```js
/**
 * Module:  lib
 * Unit:    src/lib/sectionCompletion.js
 * Covers:  QA script item 3.45 - PDF rendered blank hidden sections.
 */
```

Suites are nested so the runner output states module ownership on its own:

```
<module path> · <unit>          top-level describe
  <function>()                  inner describe
    <expected behaviour>        it
```

which prints as:

```
▶ lib · sectionCompletion
  ▶ sectionsForPdf()
    ✔ [QA 3.45] excludes a hidden section the applicant never completed
```

- Prefix an `it` with `[QA x.y]` **only** when it guards a numbered item from the
  QA testing script.
- Name an `it` after the behaviour, not the implementation.
- Group edge cases under a `malformed input` describe.

### Style

- Runner is the Node built-in (`node:test` + `node:assert/strict`) - no dependencies,
  so these cover pure logic (helpers, reducers, selectors) rather than rendered
  components. Extracting logic out of a component to make it testable is preferred
  over pulling in a DOM test runner.
- Use `describe`/`it`, never bare `test()`.
- Imports are relative (`../../lib/...`), not the `@/` alias, because `node --test`
  resolves without Vite.
