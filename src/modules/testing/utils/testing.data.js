export const HELP_SECTIONS = [
  {
    title: "Prerequisites",
    body: "Puppeteer must be installed on the backend server before tests can run. If it isn't installed yet, SSH into the server and run: npm install puppeteer inside the Onboarding-Back directory, then restart the process.",
  },
  {
    title: "1 · Configure tab",
    body: "Select which tests to run using the checklist on the left. Use All / None / Smoke only for quick selection. Smoke tests are a fast subset (~5 tests) that cover the most critical paths. On the right panel, enter the admin account email and password the browser will log in with, and optionally a Form URL if you're testing the applicant flow end-to-end.",
  },
  {
    title: "2 · Personas",
    body: "A persona is a pre-filled set of applicant data injected into form fields during tests. Clean Slate starts with blank fields (good for general flow checks). Pre-filled uses realistic business data. Edge Cases uses boundary values like very long names and max numbers. Invalid Inputs uses intentionally bad data to check validation. International uses non-US characters and formats.",
  },
  {
    title: "3 · Running tab",
    body: "After clicking Run, the page switches to the live log stream. Each test prints step-by-step pass/fail lines in real time. A progress bar tracks overall completion. If a step fails, the error message is shown inline. You can click Stop at any time to abort the run early.",
  },
  {
    title: "4 · Report tab",
    body: "When the run finishes the page switches to the Report tab automatically. It shows overall pass rate, a per-area breakdown table, and expandable failure cards with the exact error and a screenshot of what the browser saw. Use the Export JSON button to download the full report for sharing or logging.",
  },
  {
    title: "5 · Test Cases tab",
    body: "Create, edit, duplicate, and delete test cases. Each test case has a set of ordered steps that Puppeteer executes. Use the AI assistant (chat bubble) to have the Testing Assistant create or modify test cases for you by describing what you want in plain English.",
  },
  {
    title: "Tips",
    body: "Run Smoke only first after any deployment to get a quick health check in under a minute. Full suite runs can take several minutes depending on server speed. Tests that require a Form URL are marked with a badge in the checklist — they'll be skipped gracefully if no URL is provided.",
  },
];
