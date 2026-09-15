import TextField from "@/components/shared/TextField";
import BrandingEmailLogoSelect from "./BrandingEmailLogoSelect";

const BrandingEmailSettings = ({ values = {}, setters = {}, defaultSelectedLogo = null }) => {
  const emailDomain = window.location.hostname;

  return (
    <>
      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Sending Settings</h3>
        <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <TextField
            label={"Sender Email Address"}
            labelCs="text-sm!"
            type="text"
            placeholder="e.g. noreply "
            value={values.senderEmail.includes("@") ? values.senderEmail.split("@")[0] : values.senderEmail}
            onChange={(e) => setters.senderEmail(e.target.value + (emailDomain ? `@${emailDomain}` : ""))}
          />
          <TextField
            label={"Reply-To Email Address"}
            labelCs="text-sm!"
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
        <div className="mt-2 grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
          <TextField
            label={"Logo Max Width (px)"}
            labelCs="text-sm!"
            type="number"
            min={20}
            max={600}
            value={values.emailLogoMaxWidth}
            onChange={(e) => setters.emailLogoMaxWidth(Number(e.target.value))}
          />
          <TextField
            label={"Logo Max Height (px)"}
            labelCs="text-sm!"
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
