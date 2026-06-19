import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { executeBrandingAssignment } from "./executeBrandingAssignment.js";

describe("executeBrandingAssignment", () => {
  it("unwraps RTK mutation trigger once (not pre-unwrapped)", async () => {
    let called = false;
    const addBrandingMutation = (args) => {
      called = true;
      return {
        unwrap: async () => ({ success: true, message: "ok", args }),
      };
    };

    const res = await executeBrandingAssignment({
      addBrandingMutation,
      assignment: { brandingId: "b1", applyToHome: true },
    });

    assert.equal(called, true);
    assert.equal(res.success, true);
    assert.equal(res.args.onHome, "yes");
  });

  it("refreshes profile when applyToHome is true", async () => {
    const profile = { success: true, data: { branding: { colors: { primary: "#111" } } } };
    const res = await executeBrandingAssignment({
      addBrandingMutation: () => ({ unwrap: async () => ({ success: true }) }),
      getUserProfile: () => ({ unwrap: async () => profile }),
      brandingSetters: { setPrimaryColor: () => {} },
      dispatchUserRefresh: async (p) => {
        assert.equal(p, profile);
      },
      assignment: { brandingId: "b1", applyToHome: true },
    });
    assert.equal(res.success, true);
  });
});
