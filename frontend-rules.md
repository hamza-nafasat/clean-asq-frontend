# Frontend Code Rules

Rules for the React + Tailwind app in `frontend/`. Repo-wide rules: [CLAUDE.md](../CLAUDE.md).

**Goal: a developer opening this repo for the first time can guess where a file lives, what it does,
and how it works — from its name alone.** Every rule below serves that.

**Reusing this file in another project:** replace §0, the home page in §7.3, and this project's
names in the examples. The rest applies unchanged.

| # | Section | |
|---|---|---|
| 0 | [This project](#0-this-project) | stack, modules, roles |
| 1 | [Naming](#1-naming) | folders, placement, filenames, identifiers, constants |
| 2 | [Markup](#2-markup--no-unnecessary-elements) | no wrapper without a job |
| 3 | [Semantic HTML](#3-semantic-html) | which tag, when |
| 4 | [Components](#4-components) | when to create, props |
| 5 | [File layout and size](#5-file-layout-and-size) | order, limits |
| 6 | [State and data flow](#6-state-and-data-flow) | who owns what |
| 7 | [Permissions](#7-permissions) | what an account sees |
| 8 | [Styling](#8-styling) | variants, tokens |
| 9 | [Modals](#9-modals) | one contract |
| 10 | [Accessibility](#10-accessibility) | the non-negotiables |
| 11 | [Comments and imports](#11-comments-and-imports) | |
| 12 | [Before you finish](#12-before-you-finish) | checklist |

---

# 0. This project

## Stack

| | |
|---|---|
| **Framework** | React 19 + Vite 7 · `.jsx`, no TypeScript · `prop-types` |
| **Styling** | Tailwind v4 (`@tailwindcss/vite`) · tokens in `src/index.css` · `tw-animate-css` |
| **Class merging** | `clsx` + `tailwind-merge`, through `cn()` in `lib/utils.js` |
| **State** | Redux Toolkit + RTK Query in `src/redux/` — **never** React Context |
| **Routing** | React Router v7 (`react-router-dom`) |
| **Realtime** | `socket.io-client` |
| **Tables** | `react-data-table-component` · **Drag and drop** `@dnd-kit` |
| **Form inputs** | `react-phone-number-input` · `react-colorful` · `react-range-slider-input` · `react-signature-canvas` · `react-quill-new` (rich text) |
| **Maps** | `@react-google-maps/api` |
| **Bot checks** | `react-google-recaptcha` · `react-google-recaptcha-v3` |
| **Identity checks** | `idmission-web-sdk` |
| **Content** | `react-markdown` + `remark-gfm` · `dompurify` (sanitise HTML) · `handlebars` (templates) |
| **PDF and images** | `pdfmake` · `html2canvas-pro` (page screenshots) |
| **Dates** | `date-fns` · **Toasts** `react-toastify` · **Icons** `react-icons` — the one icon library (§11) |
| **Other** | `jsonl-parse-stringify` · `tinyglobby` |
| **Tooling** | ESLint 9 (`react-hooks`, `react-refresh`) · Prettier + `prettier-plugin-tailwindcss` |
| **Tests** | Node's built-in runner (`node --test`) · files in `src/test/**/*.test.js` · custom reporter |
| **Commands** | `npm run dev` · `npm run build` · `npm run lint` · `npm run preview` · `npm test` |

## Modules

| Module | What it is | In the sidebar |
|---|---|---|
| `auth` | sign in, forgot and reset password | — |
| `applicationForms` | form cards — create, edit, delete forms, manage rules | yes |
| `roleManagement` | create roles and tick their permissions | yes |
| `userManagement` | create accounts and assign roles | yes |
| `applications` | every draft and submission | yes |
| `underwriting` | review one submission | — (opened from `applications`) |
| `branding` | brandings | yes |
| `lookupManagement` | lookup keys | yes |
| `strategies` | strategies | yes |
| `email` | email templates | yes |
| `applicant` | the application flow — email code, company lookup, ID check, stepper, success | — |
| `myApplications` | the account's own drafts, submissions, and owner invitations | — |
| `myProfile` | the account's own profile and password | — |
| `testing` · `demo` | internal tools | — |

## Roles

**Roles are records, not code.** The admin creates any number of roles in `roleManagement` and ticks
their permissions. Three **system roles** always exist:

| Role | What it sees | Admin may change it? |
|---|---|---|
| `admin` | every permission — the sidebar and every page | no |
| `guest` | no sidebar. Lands on `myApplications`: the application flow and every step of the stepper, their own drafts and submitted forms, `myProfile` | yes |
| `user` | every permission except `underwriting`, with the sidebar | yes |

The permission rules are in §7. The backend enforces the same permissions (backend-rules.md §7).

## What already exists — use it, don't rebuild it

Search `components/` before building anything. The one `Button` lives in `components/shared/`, the
AI assistant in `components/shared/aiChat/`, the stepper in `components/stepper/`.

---

# 1. Naming

The most important section. Names are the map of the codebase.

## 1.1 Folder structure

```
src/
  modules/
    <module>/                   one feature area: auth, branding, applications …
      <Page>.jsx                every page of this module sits directly in the module folder
      components/               components and modals used ONLY by this module
      hooks/                    hooks used ONLY by this module — use<Module><Name>.js
      utils/
        <module>.utils.js       helpers used ONLY by this module
        <module>.constants.js   constants + enums used ONLY by this module
        <module>.data.js        static data for this module

  components/
    shared/                     small primitives — Button, Input, Select, Badge, …
    global/                     larger components used by 2+ modules
    modals/                     modals used by 2+ modules
    layouts/                    app shell — the page frame, header, sidebar

  redux/
    store.js                    the main store
    store.utils.js              apiErrorToast · resetOnUserChange
    apis/                       one RTK Query API file per module — <module>.apis.js
    slices/                     one slice per module — <module>.slice.js

  lib/                          functions that wrap a third-party library — utils.js holds cn()
  hooks/                        hooks used by 2+ modules or the app shell — use<Name>.js
  constants.js                  every app-wide constant + enum
  utils/                        helpers used by 2+ modules that wrap no library
    permissions.js              every permission name + the system roles (§7)
  routes/                       the route guards — ProtectedRoute, RequirePermission, RoleRedirect
  assets/
  test/                         <name>.test.js
```

- **Every new page goes inside a route guard** (§7.3). A dashboard page sits under the signed-in
  `<ProtectedRoute>` and is wrapped in `<RequirePermission permission={…}>`; a signed-out page (sign
  in, reset password) sits under the signed-out `<ProtectedRoute>`. A route outside both is open to
  everyone — only public pages such as the application form link belong there.
- **There are no role folders.** Roles are data the admin creates; a module sits directly under
  `modules/`, whoever uses it.
- A **module** is one feature area with its own pages. Keep them shallow — a module is not a
  place for sub-modules.
- **Every folder name is camelCase and starts lowercase** — `applicationForms`, `roleManagement`,
  `aiChat`, `stepper`. No dashes, never a capital first letter. A file named after its module
  follows the folder: `roleManagement.constants.js`, `roleManagement.apis.js`.
- **There is no `pages/` folder.** Pages sit directly in `modules/<module>/`, next to its
  `components/`, `hooks/`, and `utils/` folders.
- The folders are **always plural** — `components/`, `hooks/`, never `component/` or `hook/`.

## 1.2 Where does this file go?

**One question decides everything: is it used by one module, or more than one?**

| What you are adding | Where it goes |
|---|---|
| Page | `modules/<module>/<Page>.jsx` |
| Component or modal used by **one** module | `modules/<module>/components/` |
| Small primitive — button, input, select, badge, avatar | `components/shared/` — extend the existing one with a variant before adding another |
| Larger component used by **2+** modules | `components/global/` |
| Modal used by **2+** modules | `components/modals/` |
| Helper used by **one** module | `modules/<module>/utils/<module>.utils.js` |
| Helper used by **2+** modules | `src/utils/` |
| Constant or enum used by **one** module | `modules/<module>/utils/<module>.constants.js` |
| Constant or enum used by **2+** modules | `src/constants.js` |
| Permission name or system role | `src/utils/permissions.js` |
| Static data | `modules/<module>/utils/<module>.data.js` — **never shared** |
| Function from a third-party library | `src/lib/` — whether one module uses it or many |
| Custom hook used by **one** module | `modules/<module>/hooks/use<Module><Name>.js` |
| Custom hook used by **2+** modules or the app shell | `src/hooks/use<Name>.js` |
| RTK Query endpoints | `src/redux/apis/<module>.apis.js` |
| Slice | `src/redux/slices/<module>.slice.js` |

These rules have no exceptions:

- **Static data is never shared between modules.** Each module keeps its own `<module>.data.js`, even
  when the contents look identical. Modules must be free to change their data independently — and
  they will, the moment real data replaces the mock.
- **Shared state lives in one place** — `src/redux/`, and only that. Do not mix a store with ad-hoc
  Context providers; two ways to hold app state means nobody knows which to read.
- **A third-party library is used through `src/lib/`.** Write the function you need once in a `lib/`
  file (`date-fns`, `pdfmake`, `socket.io-client`, `dompurify` …); modules and components import that
  function, never the package. Change the library, change one file. React, Redux, React Router, icons
  and component libraries (a table, a map, an editor) are imported where they are used.
- **A utils file is named for what is inside it** — `<module>.<topic>.utils.js`, e.g.
  `applicant.address.utils.js`; never a number. Split past 200 lines, by topic. Full rule:
  **[CLAUDE.md §9](../CLAUDE.md)**.

## 1.3 File names

**Module components carry the module name. No file carries a role name** — roles are data, and what a
page shows comes from permissions (§7).

The module name tells a reader which module a file belongs to once it is open in a tab.

| File | Formula | Example |
|---|---|---|
| Page | `modules/<module>/<Page>.jsx` | `auth/Login.jsx`, `branding/Brandings.jsx` |
| Module component | `components/<Module><Part>.jsx` | `auth/components/AuthHeading.jsx` |
| Heading | `<Module>Heading.jsx` | `BrandingHeading.jsx` |
| Filter | `<Module>Filter.jsx` | `BrandingFilter.jsx` |
| Table | `<Module>Table.jsx` | `BrandingTable.jsx` |
| Module modal | `components/<Module><Purpose>Modal.jsx` | `BrandingAddEditModal.jsx` |
| Module helpers | `utils/<module>.utils.js` · `utils/<module>.<topic>.utils.js` | `branding.utils.js`, `branding.color.utils.js` |
| Module constants | `utils/<module>.constants.js` | `branding.constants.js` |
| Static data | `utils/<module>.data.js` | `branding.data.js` |
| Library wrapper | `lib/<purpose>.js` | `lib/date.js`, `lib/socket.js` |
| Module hook | `modules/<module>/hooks/use<Module><Name>.js` | `branding/hooks/useBrandingEditorSave.js` |
| Global hook | `hooks/use<Name>.js` | `usePermission.js` |
| API file | `redux/apis/<module>.apis.js` | `branding.apis.js` |
| Slice | `redux/slices/<module>.slice.js` | `auth.slice.js` |
| Shared primitive | plain noun, no prefix | `components/shared/Button.jsx` |

```
✅ modules/branding/components/BrandingTable.jsx        module prefix
❌ modules/branding/components/AdminBrandingTable.jsx   role name — forbidden
❌ modules/branding/components/CompanyBrandingTable.jsx folder already says branding/
❌ modules/auth/components/BackLink.jsx                 no module prefix → AuthBackLink
```

- **The page file name matches its folder** when the module has one page:
  `myProfile/` → `MyProfile.jsx`.
- One component per file. The file name **is** the component name — including its default export.
- **Every component file is PascalCase; every folder is camelCase.** There is no `components/ui/` —
  one `Button` lives in `components/shared/`.
- **Renaming only the letter case?** On a case-insensitive filesystem (macOS, Windows) `git mv`
  silently does nothing. Rename via a temporary name in two steps, or Linux CI will fail to resolve
  the import while your machine works fine.

## 1.4 One name = one thing

**A component name is unique across the app.** Before creating a file, search for the name.

- Exists and does the same job → **reuse it**.
- Exists and does a *different* job → **one of the two is misnamed.** Rename it to say what it
  actually is (`DashboardStatsCard` vs `ReportStatsCard`), or merge them into one with props.
- Two components with the same name in the same folder → one is dead code. Delete it.

## 1.5 Identifiers inside files

| Kind | Convention | Example |
|---|---|---|
| Constants, enums, lookup maps, option lists | `SCREAMING_SNAKE_CASE` | `STATUS_STYLES`, `PERMISSIONS` |
| Seed / mock data, style objects | `camelCase` | `initialBrandings`, `initialFilters` |
| Handler inside a component | `handleX` | `handleSubmit`, `handleAddBranding` |
| Prop that receives a handler | `onX` | `onClose`, `onAddBranding` |
| Hook | `useX` | `usePermission`, `useDebounce` |
| Permission check result | `canX` | `canCreateForm`, `canSeeSidebar` |
| Boolean | reads as a question | `isOpen`, `hasMore`, `isDragging` |
| Narrowed list | `filteredX` / `visibleX` | `filteredForms`, `visibleMembers` |

## 1.6 No hard-coded strings — use a constant

The rule is in **[CLAUDE.md §8](../CLAUDE.md)**. On the frontend:

- **Files** — one module: `utils/<module>.constants.js`; more than one module: `src/constants.js`;
  permissions and system roles: `src/utils/permissions.js`.
- **Also covers** tab names, route paths, `localStorage` keys and API tag names —
  `navigate(ROUTES.MY_APPLICATIONS)`, never `navigate("/submission")`.
- **Not covered:** text shown to the user, Tailwind classes, and native attribute values such as
  `type="button"`.

---

# 2. Markup — no unnecessary elements

**Every element must earn its place.** Before adding a wrapper, ask: does it carry a layout class the
child could not take, or a real meaning? If not, delete it.

- **A component that always renders inside a container adds no wrapper of its own** — return a
  Fragment `<>...</>`. If the parent already supplies the card or the box, do not add another.
- **Never wrap a child just to give it a class** it could accept via `className`.
- **Never nest a single-child div inside a single-child div.** Collapse them.
- Never wrap a single element in a Fragment.

```jsx
// ✅ the parent supplies the box
const RecentActivity = ({ items }) => (
  <>
    <section className="mb-5 flex items-center justify-between">…</section>
    <section>…</section>
  </>
);

// ❌ a wrapper that does nothing
const RecentActivity = ({ items }) => (
  <div>
    <div className="mb-5 flex items-center justify-between">…</div>
  </div>
);
```

**Before deleting a wrapper, check all three:** no `className`, no `style`, and not a direct child of
a flex or grid container. Removing a flex child changes the layout even when the element is bare.

---

# 3. Semantic HTML

Use a semantic tag **when it describes what the content is**. Use `<div>` for pure layout — a flex
row, a grid cell, a positioning context. Do not rename every `div` to `section`.

| Tag | Use for |
|---|---|
| `<article>` | Self-contained, independently meaningful block — a page root, a card |
| `<section>` | A distinct region of a page or card — a filter row, a table wrapper, a form-control root |
| `<main>` | The one primary content area — exactly one per screen |
| `<header>` / `<footer>` | The heading block / action row of a page, card, or form |
| `<aside>` | Tangential or dismissible side content |
| `<form>` | Anything submitted — always with `onSubmit` |
| `<label>` | Every form control, always |
| `<nav>` | A block of navigation links |
| `<table>` | Real tabular data only |
| `<div>` | Pure layout |

**Headings follow a real hierarchy, never chosen for size:** `h1` page title (one per page, inside
the `*Heading` component) → `h2` card or modal title → `h3` a section inside a card.
Body text is `<p>`, inline text is `<span>`. Never a `div` for text.

Swapping `<div>` → `<section>`/`<article>`/`<header>` is visually safe: all are `display: block`, and
Tailwind's preflight resets them identically. Swapping to `<span>` is **not** — that is inline.

---

# 4. Components

## 4.1 When to create one

**Before creating a component, search for the name first.**

- **Used in 2+ files, same meaning** → its own file in the narrowest shared scope.
- **Used only inside one file** → a local `const` in that file. A small presentational helper used
  twice in one file stays in that file. Do **not** promote it "just in case".
- **Used once** → inline it. Never create a component for a single piece of markup.
- **Never split a page into components just to shorten the file.** Split on a real boundary:
  heading, filters, table, modal, a repeated row.
- **Extend an existing shared component before creating a variant of it.** Add a prop — never
  `Input2` or `PrimaryButton`.

Same markup ≠ same component. Share when the **meaning** is the same; two things that merely look
alike today will drift apart tomorrow.

**Any small, generic UI atom belongs in `components/shared/` — never in a module folder.** Form
controls, links, badges, small wrappers: if a second feature could plausibly use it, it goes in
`shared/` from the start. A module's `components/` folder is for feature components, not primitives.

**Promotion path:** a component starts in its module's `components/`. The moment a second module
needs it, move it up — `components/shared/` if it is a primitive, `components/global/` otherwise —
and delete the copy. **Never copy a component into a second module.** Copying is how a codebase ends
up with four versions of the same thing, three of them subtly stale.

## 4.2 Props

```jsx
const ComponentName = ({ heading, items = [], className = "", onAction }) => {
  …
  return ( … );
};

export default ComponentName;
```

- Arrow function assigned to a `const`; `export default` on the last line. Never
  `export default function`.
- **Destructure props in the signature with defaults.** Never `props.x`.
- **One prop = one meaning.** Never make a prop do two jobs. `variant` controls appearance, `type`
  is the HTML button type. Overloading `type` with a look puts an invalid value on the DOM — and an
  invalid `type` makes the browser fall back to `submit`, silently submitting the surrounding form.
- **Call optional callbacks with `?.`** — `onAction?.(value)`.
- **Every reusable component accepts `className`** for its outer element.
- **Spread `...rest` onto the underlying native element** in form primitives, so `name`, `value`,
  `required`, `disabled`, `min` pass through without new props.
- The component owns its internal structure; the **caller owns its outer spacing.** Never bake
  `mt-*` into a shared component.
- **Never mutate a prop.** React does not re-render on a mutation, so the change silently does
  nothing. Lift the update to whoever owns the state and pass a callback down.

## 4.3 The page composition every page follows

```jsx
const Feature = () => {
  const [filters, setFilters] = useState(initialFilters);
  const options = [...new Set(rows.map((row) => row.field))];
  const filteredRows = rows.filter(/* … */);

  return (
    <article className="flex flex-col gap-4">
      <FeatureHeading heading="…" subheading="…" />
      <FeatureFilter filters={filters} setFilters={setFilters} options={options} />
      <FeatureTable rows={filteredRows} />
    </article>
  );
};
```

---

# 5. File layout and size

**Every file reads top to bottom in the same order:**

```
1. imports
2. file constants     (VARIANT_CLASSES, initialFilters)
3. local helpers      (getStatusColor, StatusPill)
4. the component
5. export default
```

- **Only what this one file uses sits at its top** — style maps and initial state. Values the code
  compares against (statuses, types, tabs) go in a constants file (§1.6).
- **Keep components under ~150 lines.** Past that, something inside wants to be extracted.
  Count the *component body*, not the file — config above it does not count against the limit.
- **Keep utils files under 200 lines.** Past that, split by topic — `<module>.<topic>.utils.js` (§1.2).
- **Big configuration objects live above the component, not inside it.** A table's `columns` array
  goes in a `buildColumns({ onEdit, onView, onDelete })` function above the component — or its own
  file once it passes ~60 lines. A component body should read as *logic + JSX*, not a wall of config.
- File constants sit outside the component so they are not rebuilt on every render.

---

# 6. State and data flow

## 6.1 App state

- **Shared, app-wide state lives in `src/redux/`** (Redux Toolkit — see §0).
- **Never add a React Context provider for app state.** The store is the one place.
- **API errors are shown once, by the store.** `apiErrorToast` in `redux/store.utils.js` toasts every
  failed mutation in the top-right corner. Pages never render an API error themselves.
- **One API file per module, in `redux/apis/<module>.apis.js`** — `auth.apis.js`, `branding.apis.js`.
  Register each in `redux/store.js` (its reducer and its middleware) **and add it to
  `resetOnUserChange` in `redux/store.utils.js`**, so one user's cached data is never left for the
  next user on that tab.
- **One slice per module, in `redux/slices/<module>.slice.js`**, registered in `redux/store.js`.
  Server data stays in the API cache — never copy a query result into a slice.
- **Two tags per module: one for the list, one per record.** The list query provides
  `API_TAGS.BRANDINGS`; the single query provides `{ type: API_TAGS.SINGLE_BRANDING, id }`. A mutation
  that changes one record invalidates **both** — otherwise an open detail page keeps showing the old data.
- **Call a mutation with `.unwrap()` inside `try/catch`.** Without `.unwrap()` a failed request
  resolves instead of throwing, so the code after it runs anyway:

```js
try {
  await login(formData).unwrap();
  navigate(ROUTES.HOME);
} catch (error) {
  console.error("Login error:", error);
}
```
- `useState` remains the right tool for state that belongs to a single component or page: filters,
  form values, which modal is open, expand/collapse.
- **Reusable stateful logic becomes a hook** — never a copy of the same `useEffect` in two components.
  One module uses it: `modules/<module>/hooks/`. The moment a second module needs it, move it to
  `src/hooks/`.

## 6.2 Page and component state

- **The page owns the state.** It passes `filters` + `setFilters` down to the filter component, and
  the already-filtered list down to the table.
- **Derive during render. Never mirror derived data into state, and never `useEffect` to sync it.**
  Filtered lists, totals, option sets, "is this valid" — all plain `const`s in the render body.
  A `useEffect` whose only job is `setX(...)` is a bug waiting to happen: it costs an extra render
  and goes stale the moment someone forgets a dependency.
- **Updates are immutable and use the functional form:**
  `setItems((prev) => prev.map(…))`, `setFilters((prev) => ({ ...prev, [name]: value }))`.
- **One change handler per form**, reading `e.target.name` / `e.target.value` — not one per field.
  Custom controls should emit the same `{ target: { name, value } }` shape so they work with that
  handler unchanged.
- **Never read a ref during render.** `containerRef.current?.clientWidth` in the render body returns
  a stale value on first paint and does not trigger a re-render when it changes. Measure into state
  with a `ResizeObserver` in an effect, and render from that state.
- `useEffect` is for real side effects only. Always guard, then clean up exactly what you added:

```jsx
useEffect(() => {
  if (!open) return;
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [open]);
```

- **No `alert()`, and no `console` outside an API `catch`.** Inside one, log the error as
  `console.error("<Action> error:", error)` — the toast comes from the store, the log is for the
  developer. A placeholder handler is a named no-op with a `// TODO:` saying what will replace it.

## 6.3 Loading, empty, and error states

**Every screen that fetches data renders all four states: loading, error, empty, and data.** Never
render a blank area while a request is in flight or after it fails.

```jsx
const { data: brandings = [], isLoading, isError, refetch } = useGetBrandingsQuery();

if (isLoading) return <LoadingState title="Loading brandings" />;
if (isError) return (
  <EmptyState title="Could not load brandings">
    <Button type="button" onClick={refetch}>Try again</Button>
  </EmptyState>
);
if (!brandings.length) return <EmptyState title="No brandings yet" />;

return <BrandingTable rows={brandings} />;
```

- **Use the shared components** — `LoadingState` and `EmptyState` in `components/shared/`, and
  `CustomLoading` for the full-page fallback. Never hand-roll a spinner or a "no data" message.
- **Keep the order:** loading → error → empty → data, each an early return.
- **A failed query offers a retry.** A failed mutation is toasted by the store (§6.1); the page does
  not render it again.
- **Disable a submit button while its mutation runs** (`isLoading` from the mutation hook), so one
  click never sends two requests.

## 6.4 Error boundaries

- **`ErrorBoundary` in `components/global/` wraps the app and the AI chat widget** (`main.jsx`). A
  render crash shows its fallback with a retry, never a white screen.
- **A self-contained panel that can crash on its own gets its own boundary** — a canvas, a map, a
  third-party widget, the stepper. Give it a `name` so the report says which one failed.
- A boundary catches **render** errors only. Errors in handlers and requests are caught with
  `try/catch` (§6.1).

## 6.5 Form validation

- **Validate on submit, then show the error next to its field.** One error per field, in plain words:
  "Enter a valid email". Clear a field's error when its value changes.
- **Hold the errors in one `errors` object in state**, keyed by field `name` — the same keys the
  change handler uses (§6.2).
- **Put the checks in a module utils file** as plain functions that return a message or `""`. A check
  two modules use moves to `src/utils/` — `isValidEmail`, `isValidPhone`.
- **Match the backend.** A rule the backend enforces (required, format, length) is checked here too,
  so the user sees it before the request. The frontend check is for the user; the backend check is
  the real one.
- Mark required fields with `required` and `aria-invalid` on a field with an error, and point
  `aria-describedby` at its message.

## 6.6 Lazy-loaded routes

- **Every page is imported with `lazy()` in `App.jsx`**, and the routes sit inside one `<Suspense
  fallback={<CustomLoading />}>`. A page is never imported statically — it would ship in the first
  bundle for every visitor.
- **Heavy libraries load with the page that uses them** — `pdfmake`, `html2canvas-pro`, the maps and
  the IDMission SDK. Never import them from the app shell or a shared component every page loads.

---

# 7. Permissions

**What an account sees is decided by permissions, never by role name.** The backend enforces every
permission (backend-rules.md §7); the UI only hides what the account cannot use.

## 7.1 The permissions file

**`src/utils/permissions.js` is the only place a permission or system role is named.** It is a copy of
the backend's `global/utils/permissions.js` — `PERMISSIONS` and `SYSTEM_ROLES` with the exact same
names — plus the one check:

```js
const hasPermission = (user, permission) =>
  user?.role?.name === SYSTEM_ROLES.ADMIN ||
  Boolean(user?.role?.permissions?.some((item) => item?.name === permission));
```

- **Admin passes every check**, like on the backend.
- **Add, rename, or remove a permission in both apps in the same change.**
- Permission names are `<action>_<module>` — `create_form`, `read_branding` — plus `access_sidebar`
  for the sidebar. The naming rules are in backend-rules.md §7.2.

## 7.2 Using a permission

**Components ask `usePermission(permission)` from `src/hooks/`** — it returns `true` or `false`. Never
read `user.role` yourself.

```jsx
const canCreateForm = usePermission(PERMISSIONS.CREATE_FORM);

return (
  <header>
    <h1>Application Forms</h1>
    {canCreateForm && <Button onClick={handleCreateForm}>Create Form</Button>}
  </header>
);
```

- **Hide what the account cannot do.** A create, update, or delete control renders only with its
  permission — never shown and left to fail.
- **Never branch on a role name.** `user?.role?.name === "guest"` is forbidden — ask for the permission
  the check is really about. The one role-name check is inside `hasPermission`.
- **Ownership is not a permission.** "Is this my form" stays an id comparison —
  `form?.owner === user?._id`.
- **Hiding is not security.** Every action is checked again by its API route.

## 7.3 Routes and the sidebar

**Three guards, one job each:**

| Guard | Job |
|---|---|
| `ProtectedRoute` | Is the visitor allowed on this branch at all? Signed-in branch or signed-out branch; otherwise redirect |
| `RequirePermission` | Does the account hold this page's permission? Otherwise send it to its home page |
| `RoleRedirect` | Unmatched paths go to the account's home page (from `getHomePath`) |

- **Every signed-in page names its permission** — `<RequirePermission permission={PERMISSIONS.READ_BRANDING}>`,
  the `read_` permission of what the page shows.
- **My-own-account pages take no permission** — `myProfile` and `myApplications` sit under the
  signed-in `<ProtectedRoute>` alone, so every signed-in account reaches them. Same rule as the
  backend's my-own-account routes.
- **The sidebar renders only with `access_sidebar`.** Without it the layout has no sidebar.
- **Each sidebar item carries the permission of the page it opens** and is hidden without it — the
  item and its route check the same permission.
- **The home page comes from permissions, not the role:** with `access_sidebar`, the first sidebar
  page the account can read; without it, `myApplications`.
- **Signed-out pages (sign in, reset password) sit under the signed-out `<ProtectedRoute>`**, which
  sends a signed-in account to its home page.

---

# 8. Styling

## 8.1 Variants, not `!` overrides

**A `!` in a call-site className is a smell, not a technique.** It means the shared component's
defaults are wrong. Fix the component.

```jsx
// ❌ fighting the component's baked-in padding
<Button className="w-full py-0! px-0! rounded-none!" textClassName="flex px-3 py-2 …" />

// ✅ the component offers the variant
<Button variant="menuItem">Edit</Button>
```

Writing a class later in the string does **not** override an earlier one — Tailwind decides by CSS
source order, not string order. That is why `!` spreads. The fix is variants, not longer strings.

**Defining a variant vocabulary:**

- Name variants for **what they are**, not what they look like — `menuItem`, not `smallGrayRow`.
- **Add a variant only for a look used 3+ times.** A one-off stays `className` at the call site;
  every extra variant is one more thing a newcomer has to learn.
- Keep the classes in a lookup map at the top of the component, one entry per variant.

```jsx
const BASE = "inline-flex items-center justify-center gap-2 rounded-xl cursor-pointer";

const VARIANT_CLASSES = {
  primary: "bg-(--color-primary) text-white",
  bare: "",
  // … one entry per variant
};
```

**Migrating an existing component to variants — two passes, never one:**

1. **Mechanical.** Introduce the `variant` prop and map every existing call site onto it with the
   *exact same computed classes*. Nothing else moves. Verify the generated CSS is byte-identical.
2. **Semantic.** Replace repeated `className` blocks with named variants, one at a time. Take each
   call site's **current** string as the source of truth — not what it "should" be. Never "tidy" a
   conflict between two competing classes; which one wins is decided by Tailwind's output order.

## 8.2 Everything else

- **Tailwind utilities only.** No CSS modules, no styled-components. New global CSS only for a
  design token or a keyframe.
- **Scope Tailwind's scanner to `src/`.** By default it scans every non-gitignored file and turns
  prose words in your `.md` files (`invisible`, `contents`, `static`) into real CSS rules.
- **`!` works only on Tailwind-generated utilities, never on your own CSS classes.** `text-white!`
  is real; a class you wrote in `index.css` with `!` matches nothing and silently does **nothing**.
  If a custom token needs to win, remove whatever is competing with it instead.
- **Use your design tokens instead of raw colours.** Define them once in `src/index.css`, then never
  write a hex in a component. Reach for a raw value only when no token fits — and if it recurs, add a
  token.
  - When swapping a hex for a token, check the token sets **only** colour. A token that also sets
    `font-weight` will change more than you intended.
- **Inline `style` only for values that come from data** — `style={{ color: row.statusColor }}`,
  ``style={{ width: `${percent}%` }}``. Never for static styling.
- **Mobile-first**: base → `sm:` → `md:` → `lg:` → `xl:`.
- **One shape language**: pick a radius for controls, one for cards, `rounded-full` for pills and
  avatars. Do not improvise per component.
- **Overflow safety**: `min-w-0` on flex children holding text, `truncate` on that text, `shrink-0`
  on icons, avatars, badges, pills.
- **Variant styles go in a lookup map with a fallback** — never a ternary chain. Key it by the
  constant, not a typed string:

```jsx
const STATUS_STYLES = {
  [SUBMISSION_TYPES.SUBMITTED]: { pill: "bg-green-50 text-green-700", dot: "bg-green-500" },
  [SUBMISSION_TYPES.DRAFT]: { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

const { pill, dot } = STATUS_STYLES[row.type] ?? STATUS_STYLES[SUBMISSION_TYPES.DRAFT];
```

---

# 9. Modals

- **First line:** `if (!isOpen) return null;`
- **Props contract:** `isOpen`, `onClose`, `onSubmit` (or `onConfirm`), `initialData`, `mode`.
- **One component handles add and edit**, switched by `mode === MODAL_MODES.EDIT` — not two components.
- **The trigger owns the open state.** The heading component holds `isModalOpen`, renders the modal,
  and calls the parent's `onAdd*` callback on submit.
- **For row actions, store the row and derive open state:**
  `const [rowToRemove, setRowToRemove] = useState(null)` → `isOpen={Boolean(rowToRemove)}`.
- **Reuse one delete-confirmation modal** for every destructive action. Never hand-roll a confirm dialog.
- **Every modal renders inside the one shell, `components/shared/Modal.jsx`.** It owns the overlay,
  the panel, the title and the close button. Never write overlay or panel classes in a modal —
  a look the shell lacks becomes a prop on the shell.

---

# 10. Accessibility

- Every input has a `<label>` — the shared form components handle this, so use them.
- **Set `type` on every button**; `type="button"` unless it submits.
- **Icon-only buttons get `aria-label`.**
- Custom widgets carry their ARIA: `aria-haspopup`, `aria-expanded`, `role="listbox"`,
  `role="option"`, `aria-selected`. Match a native control's semantics or do not build it.
- Decorative images get `alt=""`; meaningful images get real alt text.
- Dismissible overlays close on **both** click-outside and `Escape`.
- Motion respects `prefers-reduced-motion`.

---

# 11. Comments and imports

- **Section markers in longer JSX only** — `{/* Heading */}`, `{/* Actions */}`. Skip them in short
  components; they are navigation aids, not decoration.
- **Comments follow [CLAUDE.md §6](../CLAUDE.md)** — 4–6 words, only where a step is not obvious.
- **RTK Query API files (`redux/apis/<module>.apis.js`) put a `/////` line directly above every
  endpoint.** No section headings. Add a short `//` comment only where an endpoint does something its
  `query` does not show:

```js
endpoints: (builder) => ({
  /////
  login: builder.mutation({
    query: (credentials) => ({ url: "/login", method: "POST", body: credentials }),
  }),
  /////
  logout: builder.mutation({
    query: () => ({ url: "/logout", method: "GET" }),
    // clear cached user data even if the request fails
    async onQueryStarted(_, { dispatch, queryFulfilled }) { … },
  }),
```
- **No commented-out code.** Delete it — that is what version control is for. This includes
  commented-out JSX blocks and commented-out object properties.
- **Import order:** `react` → routing → redux → other third-party → `lib/` + `hooks/` →
  `components/shared` + `components/modals` → the module's own `components/` → constants / utils /
  data / assets.
- **Import with `@/` from outside the current module** — `@/components/shared/Button`,
  `@/utils/permissions`. Use `./` only inside the same module. `@/` is the only alias; `@components`,
  `@utils`, and `@pages` are not used.
- One quote style for import paths across the whole repo.
- No barrel (`index.js`) files — they hide where a thing actually lives and defeat tree-shaking.
- **Icons come from `react-icons` only**, with an explicit size: `<FiPlus size={18} />`. Never import
  `lucide-react` in new code; swap it out when you touch a file that uses it.

---

# 12. Before you finish

- [ ] File is in the right folder per the §1.2 table — one module vs 2+
- [ ] Filename carries the module prefix and no role name (§1.3)
- [ ] Searched for the component name — it does not already exist
- [ ] Route, sidebar item, and every create / update / delete control check their permission through `usePermission` (§7)
- [ ] No check reads a role name; a new permission is in both apps' `permissions.js` with the same name
- [ ] No hard-coded string used as a key, name, status, route, or comparison — it comes from a constants file (§1.6)
- [ ] Library functions imported from `src/lib/`, never straight from the package
- [ ] Removed every wrapper not carrying a layout class or a meaning
- [ ] Heading levels descend properly, never picked for font size
- [ ] Derived values computed in render, not stored in state
- [ ] No prop is mutated; no ref is read during render
- [ ] No `!` in a call-site className; no `console` outside an API `catch`; no commented-out code
- [ ] `type` set on every button; `aria-label` on icon-only buttons
- [ ] `min-w-0` + `truncate` + `shrink-0` where text can overflow
- [ ] Component body under ~150 lines, big config lifted above it; no utils file past 200 lines
- [ ] Utils files named by topic, never by number (§1.2)
- [ ] Data screens render loading, error, empty and data states with the shared components (§6.3)
- [ ] Form errors shown per field, checks matching the backend (§6.5)
- [ ] New page imported with `lazy()`; modal built on the shared `Modal` shell (§6.6, §9)
- [ ] Lint passes with **zero** problems — not "only warnings"
