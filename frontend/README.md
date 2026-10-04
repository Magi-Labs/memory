# Personal dashboard

React, TypeScript, Vite, Tailwind CSS, and editable shadcn/ui primitives. React Flow renders the graph and D3 force lays it out. API state uses TanStack Query; Phosphor supplies the outline icons. Inter is bundled and served locally. The generated loop mark is a local PNG asset.

## Build

Use Node 24 or newer:

```sh
cd frontend
npm ci
npm run build
```

The FastAPI gateway serves `frontend/dist` when running from this checkout. Docker builds it in a separate Node stage and serves the result from `/app/ui`. `FRONTEND_DIR` can override this path. No Node process is needed in production.

For UI development, run `npm run dev`. Vite proxies `/api` to a local gateway on port 8080. Set that gateway's `PUBLIC_ORIGIN` to `http://127.0.0.1:5173` when making changes through the development UI; the existing origin/header checks still apply. MCP clients should connect directly to the gateway during development.

`npm run format` formats the frontend. `npm run build` checks TypeScript and produces the production bundle; it does not run automated tests.

## Structure

| Directory | Responsibility |
| --- | --- |
| `src/components/ui` | Upstream shadcn primitives: controls, dialogs, cards, items, tables, alerts, navigation |
| `src/components/layout` | Sidebar and breadcrumb/theme controls |
| `src/components/shared` | Compositions of library components; React error boundary |
| `src/features/memories` | Search, pagination, source reading pane, extracted facts |
| `src/features/graph` | React Flow graph, D3 force layout and domain filtering |
| `src/features/handoffs` | Structured task state and revision editor |
| `src/features/connections` | Client setup and credential management |
| `src/lib` | Typed API, data contracts and formatting |
| `src/hooks` | Theme preference |
| `src/styles` | Theme tokens and Tailwind base; no custom component styles |
| `public/assets` | Logo and theme initialization before paint |

All UI controls must use shadcn or another maintained UI library. Feature code may compose library components and bind domain data/state; do not implement new visual primitives or graph pointer interaction. Plain semantic text and layout containers use Tailwind utilities and shared tokens. The old component CSS overrides and handwritten SVG graph were removed. New backend behavior belongs behind `src/lib/api.ts`; browser components do not contact the memory engine directly. Query keys separate document detail, search, graph, handoff, and credential state. Returning to a section refreshes its server data while retaining the local view.

## Theme and browser behavior

The first visit follows the device's color preference. The Dark mode toggle saves an explicit light/dark choice under `memory-theme`; changes synchronize across tabs. Only the theme preference is persisted in browser storage.

The initialization script, bundle, font, and logo use same-origin assets. Dialogs and confirmation prompts use shadcn/Radix. The graph uses React Flow's built-in nodes, edges, controls and minimap; it is loaded on demand. The gateway's Content Security Policy remains unchanged. Source content is rendered as React text. Newly created bearer tokens stay outside query caches and browser storage and are removed from the page when their dialog closes.

## UI source and notices

The selected design and browser comparison evidence live in `../docs/design`; `../design-qa.md` records the visual review and its limits. Those screenshots contain illustrative local documents, not production exports. shadcn components come from its official CLI/registry and use local utility imports, Phosphor icons and theme tokens. React Flow and D3 force are pinned dependencies. Upstream notices are retained in `licenses` and copied into the runtime image.
