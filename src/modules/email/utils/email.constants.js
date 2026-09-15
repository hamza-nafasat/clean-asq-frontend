export const EMAIL_TYPE_VALUES = {
  OTP: "otp_email_template",
  OLD_BENEFICIAL_OWNERS: "old_beneficial_owners_email_template",
  NEW_BENEFICIAL_OWNERS: "new_beneficial_owners_email_template",
  FORM_FORWARDED: "form_forwarded_email_template",
  WELCOME: "welcome_email_template",
  RULE_TRIGGERED: "rule_triggered_email_template",
};

export const EMAIL_TYPES = [
  { label: "Otp Email Template", value: EMAIL_TYPE_VALUES.OTP },
  { label: "Old Beneficial Owners Email Template", value: EMAIL_TYPE_VALUES.OLD_BENEFICIAL_OWNERS },
  { label: "New Beneficial Owners Email Template", value: EMAIL_TYPE_VALUES.NEW_BENEFICIAL_OWNERS },
  { label: "Form Forwarded Email Template", value: EMAIL_TYPE_VALUES.FORM_FORWARDED },
  { label: "Welcome Email Template", value: EMAIL_TYPE_VALUES.WELCOME },
  { label: "Rule Triggered Email Template", value: EMAIL_TYPE_VALUES.RULE_TRIGGERED },
];

export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

export const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "script",
  "indent",
  "direction",
  "color",
  "background",
  "align",
  "link",
  "image",
  "data",
];

export const TEMPLATE_KEYWORDS = ["link", "otp", "email", "password", "frontEndUrl", "recipientName", "brandCompanyName"];

export const TEMPLATE_OPEN_MODES = {
  EDIT: "edit",
  VIEW: "view",
};

export const INITIAL_EDIT_DATA = {
  templateName: "",
  subject: "",
  emailType: "",
  body: "",
};
