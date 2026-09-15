import DisplayText from "./ApplicantDisplayText";

const ApplicantRequiredDocsNotice = ({ isLoading = false, aiResponse = "", onHide }) => (
  <div className="mb-6 rounded-lg bg-blue-50 p-4">
    <div className="flex items-center justify-between gap-2">
      <div>
        <h3 className="text-lg font-medium text-blue-800">How to Find Your Articles of Incorporation/Organization</h3>
      </div>
      <button
        type="button"
        onClick={onHide}
        className="h-fit text-blue-600 hover:text-blue-800"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Hide"}
      </button>
    </div>
    {isLoading ? (
      <div className="mt-4 flex justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    ) : aiResponse ? (
      <DisplayText className="prose mt-2 max-w-none text-sm text-gray-700" html={aiResponse} />
    ) : (
      <p className="mt-2 text-sm text-gray-600">Unable to load document requirements at this time.</p>
    )}
  </div>
);

export default ApplicantRequiredDocsNotice;
