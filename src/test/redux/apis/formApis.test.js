/**
 * Module:  redux/apis
 * Unit:    src/redux/apis/formApis.js
 * Covers:  QA item 1.25 - saving display text closed the modal but the text
 *          never appeared. The mutation invalidated the "Form" tag while the
 *          query feeding the page provided no tags at all, so the invalidation
 *          was a no-op and the screen kept stale data until a hard refresh.
 *
 * The module cannot be imported here (it resolves the Vite "@/" alias), so the
 * cache-tag contract is asserted against source text.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const source = readFileSync(path.join(root, "src/redux/apis/formApis.js"), "utf8");

/** The body of one `name: builder.query({...})` / `builder.mutation({...})` block. */
const endpointBlock = (name) => {
  const start = source.indexOf(`${name}: builder.`);
  assert.notEqual(start, -1, `endpoint ${name} not found`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`could not delimit ${name}`);
};

const tagTypes = (() => {
  const m = source.match(/tagTypes:\s*\[([^\]]*)\]/);
  return m ? m[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean) : [];
})();

describe("redux/apis · formApis · cache tags", () => {
  it("registers the Form tag type", () => {
    assert.ok(tagTypes.includes("Form"), `tagTypes: ${tagTypes.join(", ")}`);
  });

  describe("[QA 1.25] queries that must refetch after a section update", () => {
    // Both feed a page that renders section display text.
    for (const query of ["getSpecialAccessOfSection", "getSingleFormQuery"]) {
      it(`${query} provides the Form tag`, () => {
        assert.match(
          endpointBlock(query),
          /providesTags:\s*\[[^\]]*"Form"/,
          `${query} must provide "Form", or updateFormSection's invalidation is a no-op`,
        );
      });
    }

    it("updateFormSection invalidates the Form tag", () => {
      assert.match(endpointBlock("updateFormSection"), /invalidatesTags:\s*\[[^\]]*"Form"/);
    });
  });

  describe("[QA 4.24] reorder endpoint contract", () => {
    it("calls the path the backend now serves", () => {
      const block = endpointBlock("reorderFormSections");
      assert.match(block, /url:\s*"\/reorder-form-sections"/);
      assert.match(block, /method:\s*"PUT"/);
    });

    it("invalidates the Form tag so the reordered form refetches", () => {
      assert.match(endpointBlock("reorderFormSections"), /invalidatesTags:\s*\[[^\]]*"Form"/);
    });
  });
});
