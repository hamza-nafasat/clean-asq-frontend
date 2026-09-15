import { FIELD_TYPES } from "@/constants";

export const ID_ISSUE_STATES_AND_COUNTRIES = [
  // Countries
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  // US States
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
  "Puerto Rico",
  // Canadian Provinces & Territories
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
  // UK Countries
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  // Australian States & Territories
  "New South Wales",
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Australian Capital Territory",
  "Northern Territory",
];

export const MAJOR_CITIES = [
  // US Major Cities
  "New York City",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "Charlotte",
  "Indianapolis",
  "San Francisco",
  "Seattle",
  "Denver",
  "Nashville",
  "Oklahoma City",
  "El Paso",
  "Washington DC",
  "Boston",
  "Las Vegas",
  "Memphis",
  "Louisville",
  "Portland",
  "Baltimore",
  "Milwaukee",
  "Albuquerque",
  "Tucson",
  "Fresno",
  "Sacramento",
  "Mesa",
  "Kansas City",
  "Atlanta",
  "Omaha",
  "Colorado Springs",
  "Raleigh",
  "Long Beach",
  "Virginia Beach",
  "Minneapolis",
  "Tampa",
  "New Orleans",
  "Arlington",
  "Wichita",
  "Bakersfield",
  "Aurora",
  "Anaheim",
  "Santa Ana",
  "Corpus Christi",
  "Riverside",
  "St. Louis",
  "Lexington",
  "Pittsburgh",
  "Stockton",
  "Anchorage",
  "Cincinnati",
  "St. Paul",
  "Greensboro",
  "Toledo",
  "Newark",
  "Plano",
  "Henderson",
  "Orlando",
  "Lincoln",
  "Jersey City",
  "Chandler",
  "St. Petersburg",
  "Laredo",
  "Norfolk",
  "Madison",
  "Durham",
  "Lubbock",
  "Winston-Salem",
  "Garland",
  "Glendale",
  "Hialeah",
  "Reno",
  "Baton Rouge",
  "Irvine",
  "Chesapeake",
  "Irving",
  "Scottsdale",
  "North Las Vegas",
  "Fremont",
  "Gilbert",
  "San Bernardino",
  "Birmingham",
  "Rochester",
  "Richmond",
  "Spokane",
  "Des Moines",
  "Montgomery",
  "Modesto",
  "Fayetteville",
  "Tacoma",
  "Shreveport",
  "Akron",
  "Aurora",
  "Yonkers",
  "Oxnard",
  "Fontana",
  "Columbus",
  "Augusta",
  "Mobile",
  "Little Rock",
  "Moreno Valley",
  "Glendale",
  "Amarillo",
  "Huntington Beach",
  "Grand Rapids",
  "Salt Lake City",
  "Tallahassee",
  "Huntsville",
  "Worcester",
  "Knoxville",
  "Brownsville",
  "Santa Clarita",
  "Providence",
  "Garden Grove",
  "Oceanside",
  "Fort Lauderdale",
  "Chattanooga",
  "Tempe",
  "Cape Coral",
  "Eugene",
  "Peoria",
  "Cary",
  "Springfield",
  "Fort Wayne",
  "Sioux Falls",
  "Pembroke Pines",
  "Elk Grove",
  "Vancouver",
  "Corona",
  "Hollywood",
  "Hayward",
  "Clarksville",
  "Paterson",
  "Murfreesboro",
  "Macon",
  "Lakewood",
  "Killeen",
  "Syracuse",
  "Salinas",
  "Pomona",
  "Escondido",
  "Kansas City",
  "Sunnyvale",
  "Rockford",
  "Torrance",
  "Bridgeport",
  "Alexandria",
  "Savannah",
  "Roseville",
  "Surprise",
  "Pasadena",
  "Mesquite",
  "Gainesville",
  "Fullerton",
  "McAllen",
  "Thornton",
  "Olathe",
  "West Valley City",
  "Warren",
  "Hampton",
  "Dayton",
  "Columbia",
  "Sterling Heights",
  "Waco",
  "Cedar Rapids",
  "Elizabeth",
  "Denton",
  "Miramar",
  "Thousand Oaks",
  "Visalia",
  "Topleka",
  "Coral Springs",
  "Stamford",
  "Concord",
  "Hartford",
  "Roseville",
  "Simi Valley",
  "Columbia",
  "Surprise",
  "Lafayette",
  "Kent",
  "Santa Rosa",
  "El Monte",
  "Rancho Cucamonga",
  "Oceanside",
  "Ontario",
  "San Buenaventura",
  "Peoria",
  "Chattanooga",
  "Fort Collins",
  "Jackson",
  "Honolulu",
  "Anchorage",
  "Boise",
  "Billings",
  "Fargo",
  "Manchester",
  "San Juan",
  // Canadian Major Cities
  "Toronto",
  "Montreal",
  "Vancouver",
  "Calgary",
  "Edmonton",
  "Ottawa",
  "Winnipeg",
  "Quebec City",
  "Hamilton",
  "Kitchener",
  "London",
  "Victoria",
  "Halifax",
  "Oshawa",
  "Windsor",
  "Saskatoon",
  "Regina",
  "St. Catharines",
  "Barrie",
  "Kelowna",
  "Abbotsford",
  "Sudbury",
  "Kingston",
  "Saguenay",
  "Trois-Rivières",
  "Guelph",
  "Moncton",
  "Brantford",
  "Saint John",
  "Thunder Bay",
  "Sherbrooke",
  "Nanaimo",
  "Fredericton",
  "Charlottetown",
  "Lethbridge",
  "Red Deer",
  "Kamloops",
  "Chilliwack",
  "Prince George",
  // UK Major Cities
  "London",
  "Birmingham",
  "Manchester",
  "Glasgow",
  "Liverpool",
  "Leeds",
  "Sheffield",
  "Edinburgh",
  "Bristol",
  "Leicester",
  "Coventry",
  "Bradford",
  "Cardiff",
  "Belfast",
  "Nottingham",
  "Kingston upon Hull",
  "Newcastle upon Tyne",
  "Stoke-on-Trent",
  "Southampton",
  "Derby",
  "Portsmouth",
  "Brighton",
  "Plymouth",
  "Wolverhampton",
  "Oxford",
  "Cambridge",
  "Norwich",
  "Swansea",
  "Aberdeen",
  "Dundee",
  "Inverness",
  "Exeter",
  "Gloucester",
  "Bath",
  "York",
  "Chester",
  // Australian Major Cities
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Gold Coast",
  "Canberra",
  "Newcastle",
  "Wollongong",
  "Logan City",
  "Geelong",
  "Hobart",
  "Townsville",
  "Cairns",
  "Darwin",
  "Toowoomba",
  "Ballarat",
  "Bendigo",
  "Launceston",
  "Mackay",
  "Rockhampton",
  "Bunbury",
  "Bundaberg",
  "Hervey Bay",
];

export const SECTION_TITLES = {
  COMPANY_INFORMATION: "company_information_blk",
  BENEFICIAL: "beneficial_blk",
  BANK_ACCOUNT_INFO: "bank_account_info_blk",
  AVG_TRANSACTIONS: "avg_transactions_blk",
  INCORPORATION_ARTICLE: "incorporation_article_blk",
  CUSTOM_SECTION: "custom_section",
  AGREEMENT: "agreement_blk",
  ID_VERIFICATION: "id_verification_blk",
};

// section titles that map to a renderable stepper step
export const RENDERABLE_SECTION_TITLES = [
  SECTION_TITLES.COMPANY_INFORMATION,
  SECTION_TITLES.BENEFICIAL,
  SECTION_TITLES.BANK_ACCOUNT_INFO,
  SECTION_TITLES.AVG_TRANSACTIONS,
  SECTION_TITLES.INCORPORATION_ARTICLE,
  SECTION_TITLES.CUSTOM_SECTION,
  SECTION_TITLES.AGREEMENT,
];

export const SECTION_KEYS = {
  ID_MISSION: "idMission",
  METADATA: "metadata",
  COMPANY_INFORMATION: "company_information",
  COMPANY_HAS_NO_WEBSITE: "company_has_no_website",
  ARTICLE_OF_INCORPORATION: "article_of_incorporation",
};

export const FIELD_NAMES = {
  SIGNATURE: "signature",
  WEBSITE_URL: "website_url",
  COMPANY_DESCRIPTION: "companydescription",
  COMPANY_OWNERSHIP_TYPE: "company_ownership_type",
  STOCK_SYMBOL: "stocksymbol",
  INCORPORATION_PART: "incorp",
  DATE_PART: "date",
  MAIN_OWNER_25_PERCENT: "main_owner_own_25_percent_or_more",
  ADDITIONAL_OWNERS_25_PERCENT: "additional_owners_own_25_percent_or_more",
  ROLLING_OWNER_IS_ALSO_OWNER: "rolling_owner_is_also_owner",
  BANK_ROUTING_NUMBER: "bank_routing_number",
  BANK_ACCOUNT_NUMBER: "bank_account_number",
  CONFIRM_BANK_ACCOUNT_NUMBER: "confirm_bank_account_number",
  BANK_ACCOUNT_HOLDER_NAME: "bank_account_holder_name",
  BANK_NAME: "bank_name",
  ARTICLE_URLS_PART: "article_of_incorporation_urls",
};

export const FIELD_BLOCK_TYPE = "block";

export const YES_NO = {
  YES: "yes",
  NO: "no",
};

export const COMPANY_OWNERSHIP_TYPES = {
  PUBLIC: "public",
};

export const COMPANY_VERIFICATION_STATUSES = {
  UNVERIFIED: "unverified",
};

export const LOOKUP_SOURCE_KEY_PART = "source";
export const LOOKUP_NOT_FOUND = "Not found";
export const DEFAULT_OWNER_SUGGESTION_KEYS = ["founders"];

export const BANK_FIELD_KINDS = {
  ROUTING: "routing",
  ACCOUNT: "account",
};

export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  TAB: "Tab",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
};

export const ID_MISSION_SOCKET_EVENTS = {
  PROCESSING_STARTED: "idMission_processing_started",
  VERIFIED: "idMission_verified",
  FAILED: "idMission_failed",
  OTHER: "idMission_other",
};

export const ID_MISSION_VERIFICATION_RESULTS = {
  FAILED: "failed",
  REJECTED: "rejected",
};

export const DRAFT_NOT_FOUND_MESSAGE = "Form Not Saved in draft";
export const QR_FETCH_TIMEOUT_MS = 10000;

export const ROLE_FILLING_VALUES = {
  PRIMARY_OPERATOR_AND_CONTROLLER: "primaryOperatorAndController",
  PRIMARY_CONTACT: "primaryContact",
  BOTH: "both",
};

export const ROLE_FILLING_FIELD = {
  label: "What is the role you are filling for the company as you complete this application? ",
  options: [
    {
      label:
        "A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)",
      value: ROLE_FILLING_VALUES.PRIMARY_OPERATOR_AND_CONTROLLER,
    },
    {
      label: "The primary contact for the company for this product or service, but not a company operator/controller ",
      value: ROLE_FILLING_VALUES.PRIMARY_CONTACT,
    },
    {
      label: "Both a company operator and the primary contact",
      value: ROLE_FILLING_VALUES.BOTH,
    },
  ],
  name: "roleFillingForCompany",
  uniqueId: "roleFillingForCompany",
  required: true,
};

export const SINGLE_APPLICATION_STAGES = {
  EMAIL: "email",
  IDMISSION_QR: "idmission-qr",
  IDMISSION_LOADING: "idmission-loading",
  IDMISSION_DETAILS: "idmission-details",
};

export const SINGLE_APPLICATION_SCREENS = {
  [SINGLE_APPLICATION_STAGES.EMAIL]: {
    screenName: "Email Verification",
    description:
      "The applicant must verify their email address. They enter their email, receive a one-time passcode (OTP), and enter it to confirm.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_QR]: {
    screenName: "Identity Verification — QR Code",
    description:
      "The applicant scans a QR code (or uses a web link) with their phone to complete photo ID verification through IDMission. No form fields to fill at this step. If they cannot scan, they can click 'Enter ID Details Manually' to type their ID details instead.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_LOADING]: {
    screenName: "Identity Verification — Loading Details",
    description:
      "Identity verification data is loading. Wait until personal details appear before confirming pre-filled values.",
  },
  [SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS]: {
    screenName: "Identity Verification — Personal Details",
    description:
      'The applicant completes their personal details and adds their signature to proceed. Some fields may already be filled from identity verification — present those pre-filled values to the applicant for confirmation before moving on to empty fields. For the roleFillingForCompany field, valid values are: "both" (operator and primary contact), "primaryContact" (primary contact only), or "primaryOperatorAndController" (C-level executive or owner). Present these as readable choices to the applicant.',
  },
};

export const AI_FIELD_IDS = {
  EMAIL: "email-field",
  OTP: "otp-field",
};

export const ID_TYPE_SUGGESTIONS = ["Driver's License", "State ID", "Passport"];

export const ADDRESS_AUTOCOMPLETE_OPTIONS = {
  types: ["address"],
  fields: ["address_components", "geometry", "formatted_address", "place_id"],
};

export const OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS = { types: ["address"], fields: ["formatted_address"] };

// details form fields in render order; hasEmptyFallback keeps the original `|| ""` value
export const ID_MISSION_DETAIL_FIELDS = [
  {
    name: "name",
    label: "Name:*",
    required: true,
    placeholder: "First name, middle name (optional), last name",
  },
  { name: "email", label: "Email Address:*", required: true, placeholder: "e.g. john.doe@email.com" },
  { name: "dateOfBirth", type: "date", label: "Date of Birth:*", required: true },
  {
    name: "idType",
    type: "text",
    label: "ID Type:*",
    required: true,
    placeholder: 'e.g. "Driver\'s License", "State ID", "Passport"',
    suggestions: ID_TYPE_SUGGESTIONS,
  },
  {
    name: "idIssuer",
    type: "text",
    label: "ID Issuer:*",
    required: true,
    placeholder: "State/Province or Country",
    suggestions: ID_ISSUE_STATES_AND_COUNTRIES,
  },
  { name: "idExpiryDate", type: "date", label: "ID Expiry Date:*", required: true },
  { name: "issueDate", type: "date", label: "Issue Date:*", required: true },
  {
    name: "idNumber",
    label: "ID Number:*",
    required: true,
    placeholder: "As it appears on your ID",
    hasEmptyFallback: true,
  },
  {
    name: "streetAddress",
    type: "text",
    label: "Street Address:*",
    required: true,
    placeholder: "Start typing your address",
    hasEmptyFallback: true,
    isAddressLookup: true,
  },
  {
    name: "address2",
    type: "text",
    label: "Address 2 (Apt, Suite, Unit):",
    placeholder: "Apt, Suite, Unit, Floor, etc.",
    hasEmptyFallback: true,
  },
  {
    name: "city",
    type: "text",
    label: "City:*",
    required: true,
    placeholder: "e.g. New York City",
    suggestions: MAJOR_CITIES,
    hasEmptyFallback: true,
  },
  {
    name: "zipCode",
    type: "text",
    label: "Zip or Postal Code:*",
    required: true,
    placeholder: "e.g. 90210",
    hasEmptyFallback: true,
  },
  {
    name: "state",
    type: "text",
    label: "State/Province:*",
    required: true,
    placeholder: "e.g. California",
    hasEmptyFallback: true,
  },
  {
    name: "country",
    type: "text",
    label: "Country:*",
    required: true,
    placeholder: "e.g. United States",
    hasEmptyFallback: true,
  },
  {
    name: "companyTitle",
    label: "Company Title:*",
    required: true,
    placeholder: "e.g. CEO, Owner, Director",
    hasEmptyFallback: true,
  },
  {
    name: "phoneNumber",
    type: "text",
    label: "Phone Number:*",
    required: true,
    placeholder: "e.g. 555-867-5309",
    formatting: "3,3,4",
    hasEmptyFallback: true,
  },
];

// fields of the details form that must not block Continue
export const ID_MISSION_OPTIONAL_KEYS = {
  ADDRESS_2: "address2",
  DATA: "data",
};

export const OWNER_ROLES = {
  PRIMARY_OPERATOR: "primary_operator",
  BENEFICIAL_OWNER: "beneficial_owner",
  BOTH: "both",
};

export const OWNER_ROLE_FIELD = {
  label: "Role",
  name: "role",
  options: [
    { label: "Primary Operator", value: OWNER_ROLES.PRIMARY_OPERATOR },
    { label: "Beneficial Owner", value: OWNER_ROLES.BENEFICIAL_OWNER },
    { label: "Both", value: OWNER_ROLES.BOTH },
  ],
  required: true,
};

export const OWNER_HAVE_DETAIL_OPTIONS = [
  { label: "No", value: YES_NO.NO },
  { label: "Yes", value: YES_NO.YES },
];

export const ROLLING_OWNER_SSN_FIELD = {
  label: "What is your Social Security, Tax, or National ID Number?",
  name: "rolling_owner_ssn",
  uniqueId: "rolling_owner_ssn",
  required: true,
  aiHelp: false,
  formatting: "3,2,4",
  isMasked: true,
  type: "text",
};

export const ROLLING_OWNER_IS_OWNER_FIELD = {
  label: "Are you a company owner holding 25% or more of the company?",
  name: FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER,
  uniqueId: FIELD_NAMES.ROLLING_OWNER_IS_ALSO_OWNER,
  required: true,
  aiHelp: false,
  type: "radio",
  options: [
    { label: "Yes", value: YES_NO.YES },
    { label: "No", value: YES_NO.NO },
  ],
};

export const ROLLING_OWNER_PERCENTAGE_FIELD = {
  label: "What is you percentage of ownership?",
  name: "rolling_owner_percentage",
  uniqueId: "rolling_owner_percentage",
  required: true,
  aiHelp: false,
  type: "range",
};

export const NAICS_COLUMNS = {
  NAICS_CODE: "NAICS Code",
  NAICS_DESCRIPTION: "NAICS Description",
  MCC_CODE: "MCC Code",
  MCC_DESCRIPTION: "MCC Description",
};

export const NAICS_INPUT_ID = "naics-code";
export const NAICS_SUGGESTION_LIMIT = 20;
export const NAICS_SUGGESTIONS_FLIP_SPACE = 350;

export const BANK_LOOKUP_ERROR_MESSAGE =
  "we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.";

export const DEFAULT_HEADER_FOOTER = { headerText: "", footerText: "All rights reserved" };

export const APPLICANT_HOME_PATH = "/";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// field types rendered by ApplicantSectionField with their own input
export const SECTION_FIELD_INPUT_TYPES = [
  FIELD_TYPES.SELECT,
  FIELD_TYPES.MULTI_CHECKBOX,
  FIELD_TYPES.FILE,
  FIELD_TYPES.RADIO,
  FIELD_TYPES.RANGE,
  FIELD_TYPES.CHECKBOX,
];

export const SINGLE_APPLICATION_MODALS = {
  OTP_TEXT: "otpText",
  ID_MISSION_DATA_TEXT: "idMissionDataText",
  ID_MISSION_SECTION_TEXT: "idMissionSectionText",
  SIGNATURE: "signature",
  SIGNATURE_HELP: "signatureHelp",
  SIGN_AI_HELP: "signAiHelp",
};

// form document keys edited by the display text modals
export const DISPLAY_TEXT_FIELDS = {
  OTP: {
    text: "otpDisplayText",
    instructions: "otpDisplayFormatingInstructions",
    formatted: "otpDisplayFormatedText",
  },
  ID_MISSION_DATA: {
    text: "idMissionDataDisplayText",
    instructions: "idMissionDataDisplayFormatingInstructions",
    formatted: "idMissionDataDisplayFormatedText",
  },
  COMPANY_VERIFICATION: {
    text: "companyVerificationDisplayText",
    instructions: "companyVerificationDisplayFormatingInstructions",
    formatted: "companyVerificationDisplayFormatedText",
  },
};
