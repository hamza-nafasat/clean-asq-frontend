import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useScreenContext } from "@/hooks/useScreenContext";
import useBrandingEditorScreenContext from "@/modules/branding/hooks/useBrandingEditorScreenContext";
import { BRANDING_AI_PATHS } from "@/modules/branding/utils/branding.constants";
import getEnv from "@/utils/env";

vi.mock("@/hooks/useScreenContext", () => ({ useScreenContext: vi.fn() }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/redux/apis/branding.apis", () => ({ useFetchWebsiteBrandingMutation: () => [vi.fn()] }));

// screen context the branding editor registers
const registerBrandingEditor = () => {
  const values = { companyName: "Amazon", logos: [], colorPalette: [] };
  renderHook(() => useBrandingEditorScreenContext({ brandingId: "branding-1", values, setters: {} }));
  return useScreenContext.mock.lastCall[0];
};

describe("Branding editor AI — uses the branding chat that has the color tools", () => {
  it("sends the editor's messages to the branding chat", () => {
    expect(registerBrandingEditor().aiEndpoint).toBe(`${getEnv("SERVER_URL")}${BRANDING_AI_PATHS.EDITOR_CHAT}`);
  });
});
