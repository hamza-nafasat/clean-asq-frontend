import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationPdfViewCommonProps } from "@/components/global/ApplicationPdfView";
import usePermission from "@/hooks/usePermission";
import UnderwritingAppViewer from "@/modules/underwriting/components/UnderwritingAppViewer";

vi.mock("@/components/global/ApplicationPdfView", () => ({ ApplicationPdfViewCommonProps: vi.fn(() => null) }));
vi.mock("@/hooks/usePermission", () => ({ default: vi.fn() }));

// the submission opened from the underwriting url
const OPENED_SUBMISSION = {
  _id: "submission-2",
  user: { _id: "applicant-1" },
  form: { _id: "form-1" },
  submitData: { companyName: "Acme Ltd" },
};

// props the application viewer received
const renderAppViewer = () => {
  render(<UnderwritingAppViewer submission={OPENED_SUBMISSION} />);
  return ApplicationPdfViewCommonProps.mock.lastCall[0];
};

describe("Underwriting App Viewer — edits save as versions of the opened application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePermission.mockReturnValue(true);
  });

  it("saves edits to the opened submission, not another one by the same applicant", () => {
    expect(renderAppViewer().submittedFormId).toBe(OPENED_SUBMISSION._id);
  });

  it("shows the opened submission's own data", () => {
    expect(renderAppViewer().initialSubmitData).toBe(OPENED_SUBMISSION.submitData);
  });
});
