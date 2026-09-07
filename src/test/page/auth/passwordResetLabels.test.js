/**
 * Module:  page/auth
 * Covers:  QA 5.36 - the link read "Forget password"; and QA 5.37 - the reset
 *          button read "Forget Password" where it should read "Submit".
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const read = (f) => readFileSync(path.join(root, "src/page/auth", f), "utf8");

/** Text a user can actually read: JSX labels, titles and bare text nodes. */
const visibleStrings = (src) => [
  ...[...src.matchAll(/label="([^"]*)"/g)].map((m) => m[1]),
  ...[...src.matchAll(/label=\{"([^"]*)"\}/g)].map((m) => m[1]),
  ...[...src.matchAll(/^\s{6,}([A-Z][A-Za-z ']{3,40})\s*$/gm)].map((m) => m[1].trim()),
];

describe("page/auth · password reset wording", () => {
  it('[QA 5.36] no user-visible text says "Forget"', () => {
    for (const file of ["Login.jsx", "ForgetPassword.jsx", "ResetMailSent.jsx"]) {
      const bad = visibleStrings(read(file)).filter((s) => /\bforget\b/i.test(s));
      assert.deepEqual(bad, [], `${file} still shows: ${bad.join(", ")}`);
    }
  });

  it('[QA 5.36] the login link reads "Forgot Password"', () => {
    assert.match(read("Login.jsx"), /Forgot Password/);
  });

  it('[QA 5.37] the reset button reads "Submit"', () => {
    const src = read("ForgetPassword.jsx");
    assert.match(src, /label="Submit"/);
    assert.ok(!/label="Forget Password"/.test(src), "old button label must not return");
  });
});
