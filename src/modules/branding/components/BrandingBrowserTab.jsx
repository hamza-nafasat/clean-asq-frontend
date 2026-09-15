import TextField from "@/components/shared/TextField";
import BrandingFavIconPicker from "./BrandingFavIconPicker";

const BrandingBrowserTab = ({ values = {}, setters = {} }) => (
  <section className="my-6 flex w-full flex-col gap-5">
    <div className="space-y-1">
      <h3 className="border-b-2 pb-2 text-lg font-semibold text-gray-800">Browser Tab</h3>
      <p className="max-w-2xl text-xs leading-relaxed text-gray-400">
        Set the text and icon that appear in the browser tab when an applicant opens a form using this branding.
      </p>
    </div>

    <div className="grid max-w-2xl grid-cols-1 gap-5 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <TextField
          label={"Tab Title"}
          labelCs="text-sm!"
          type="text"
          value={values.tabTitle}
          onChange={(e) => setters.tabTitle(e.target.value)}
          placeholder="e.g. Apply Now — Acme Financial"
        />

        <span className="text-[11px] text-gray-400">This title will appear in the browser tab.</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Browser Icon</label>

        <div className="rounded-lg border border-gray-200 bg-[#FAFBFF] p-3">
          <BrandingFavIconPicker logos={values.logos} value={values.favicon} onChange={setters.favicon} />
        </div>

        <span className="text-[11px] text-gray-400">Choose the icon shown beside the tab title.</span>
      </div>
    </div>
  </section>
);

export default BrandingBrowserTab;
