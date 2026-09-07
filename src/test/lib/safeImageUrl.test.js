/**
 * Module:  lib
 * Unit:    src/lib/safeImageUrl.js
 * Covers:  QA item 5.5 - the logo did not render in the OTP email. Handlebars
 *          escaped the URL ("&" -> "&amp;"), so the template now interpolates
 *          it unescaped and this validator replaces the lost protection.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeImageUrl } from "../../lib/safeImageUrl.js";

describe("lib · safeImageUrl", () => {
  describe("[QA 5.5] passes the URLs that were being mangled", () => {
    it("keeps a Cloudinary transformation URL intact", () => {
      const url = "https://res.cloudinary.com/x/image/upload/w_300&h_100/logo.png";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps a signed URL with several query params intact", () => {
      const url = "https://cdn.example.com/logo.png?w=300&h=100&sig=abc";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps a plain https URL", () => {
      const url = "https://res.cloudinary.com/x/image/upload/v1/logo.png";
      assert.equal(safeImageUrl(url), url);
    });

    it("keeps an inline base64 image", () => {
      const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
      assert.equal(safeImageUrl(url), url);
    });
  });

  describe("rejects anything that could break out of the attribute", () => {
    it("rejects a quote that would close the src attribute", () => {
      assert.equal(safeImageUrl('https://x/a.png" onerror="alert(1)'), "");
    });

    it("rejects angle brackets and backticks", () => {
      for (const url of ["https://x/<script>.png", "https://x/`.png", "https://x/a>.png"]) {
        assert.equal(safeImageUrl(url), "", url);
      }
    });

    it("rejects whitespace inside the URL", () => {
      assert.equal(safeImageUrl("https://x/a b.png"), "");
    });

    it("rejects javascript: and other non-http protocols", () => {
      for (const url of ["javascript:alert(1)", "file:///etc/passwd", "ftp://x/a.png"]) {
        assert.equal(safeImageUrl(url), "", url);
      }
    });

    it("rejects a non-image data URI", () => {
      assert.equal(safeImageUrl("data:text/html;base64,PHNjcmlwdD4="), "");
    });

    it("rejects relative and malformed URLs", () => {
      for (const url of ["/logo.png", "logo.png", "://x"]) assert.equal(safeImageUrl(url), "", url);
    });
  });

  describe("malformed input", () => {
    it("returns an empty string for empty or non-string input", () => {
      for (const v of ["", "   ", null, undefined, 42, {}, []]) assert.equal(safeImageUrl(v), "");
    });
  });
});
