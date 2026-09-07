/**
 * Module:  lib
 * Unit:    src/lib/apiError.js
 * Covers:  QA script item 4.24 - the save error rendered as
 *          "Save failed. Reorder: undefined", which named no cause.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiErrorMessage } from "../../lib/apiError.js";

describe("lib · apiError · apiErrorMessage()", () => {
  describe("[QA 4.24] never renders the string 'undefined'", () => {
    it("names the cause for a 404 on an unrouted path", () => {
      // The exact shape RTK Query rejects with when the endpoint does not exist.
      const msg = apiErrorMessage({ status: 404, data: undefined });
      assert.ok(!msg.includes("undefined"), `got: ${msg}`);
      assert.match(msg, /404/);
    });

    it("never returns 'undefined' for any empty-ish rejection", () => {
      const shapes = [
        undefined, null, {}, { status: 500 }, { data: {} }, { data: null },
        { status: "FETCH_ERROR" }, { message: "" }, { data: { message: "   " } },
      ];
      for (const err of shapes) {
        const msg = apiErrorMessage(err);
        assert.ok(msg && !msg.includes("undefined"), `${JSON.stringify(err)} -> ${msg}`);
      }
    });
  });

  describe("prefers the most specific message available", () => {
    it("uses the server's message first", () => {
      assert.equal(
        apiErrorMessage({ status: 400, data: { message: "Please Provide A Valid Form Id" } }),
        "Please Provide A Valid Form Id",
      );
    });

    it("uses a plain-string body when there is no message field", () => {
      assert.equal(apiErrorMessage({ status: 500, data: "Internal Server Error" }), "Internal Server Error");
    });

    it("falls back to a thrown Error's message", () => {
      assert.equal(apiErrorMessage(new Error("Network down")), "Network down");
    });

    it("accepts a bare string", () => {
      assert.equal(apiErrorMessage("boom"), "boom");
    });
  });

  describe("describes the transport when nothing else is available", () => {
    it("reports auth failures by status", () => {
      assert.match(apiErrorMessage({ status: 401 }), /401/);
      assert.match(apiErrorMessage({ status: 403 }), /403/);
    });

    it("reports a non-numeric RTK status such as FETCH_ERROR", () => {
      assert.match(apiErrorMessage({ status: "FETCH_ERROR" }), /FETCH_ERROR/);
    });

    it("prefers originalStatus when present", () => {
      assert.match(apiErrorMessage({ status: "PARSING_ERROR", originalStatus: 404 }), /404/);
    });
  });
});
