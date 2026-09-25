import TextField from "@/components/shared/TextField";
import BrandingEmailLogoSelect from "./BrandingEmailLogoSelect";
import { toSenderEmail } from "../utils/branding.utils";

const BrandingEmailSettings = ({ values = {}, setters = {}, defaultSelectedLogo = null }) => {
  const senderLocalPart = (values.senderEmail || "").split("@")[0];

  const handleSenderChange = (e) => setters.senderEmail(toSenderEmail(e.target.value));

  return (
    <>
      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Sending Settings</h3>
        <div className="grid grid-cols-[1fr_1fr] gap-x-6 gap-y-1">
          <TextField
            label="Sender Email Address"
            labelSize="sm"
            type="text"
            placeholder="e.g. noreply"
            value={senderLocalPart}
            onChange={handleSenderChange}
          />
          <TextField
            label="Reply-To Email Address"
            labelSize="sm"
            type="email"
            placeholder="e.g. support@jira-instance.atlassian.net"
            value={values.replyToEmail}
            onChange={(e) => setters.replyToEmail(e.target.value)}
          />
        </div>
      </section>

      <section className="my-6 flex w-full flex-col gap-2">
        <BrandingEmailLogoSelect
          logos={values.logos}
          setLogos={setters.logos}
          setSelectedLogo={setters.selectedEmailLogo}
          selectedLogo={values.selectedEmailLogo}
          defaultSelectedLogo={defaultSelectedLogo}
          headerBackground={values.headerBackground}
        />
        <div className="mt-2 grid grid-cols-[repeat(2,max-content)] gap-x-6 gap-y-1">
          <TextField
            label="Logo Max Width (px)"
            labelSize="sm"
            type="number"
            min={20}
            max={600}
            value={values.emailLogoMaxWidth}
            onChange={(e) => setters.emailLogoMaxWidth(Number(e.target.value))}
          />
          <TextField
            label="Logo Max Height (px)"
            labelSize="sm"
            type="number"
            min={20}
            max={300}
            value={values.emailLogoMaxHeight}
            onChange={(e) => setters.emailLogoMaxHeight(Number(e.target.value))}
          />
        </div>
      </section>
    </>
  );
};

export default BrandingEmailSettings;
