# Personal dashboard

React, TypeScript, Vite, Tailwind CSS, and editable shadcn/ui primitives. API state uses TanStack Query; Phosphor supplies the outline icons. Inter is bundled and served locally. The generated loop mark is a local PNG asset.

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
| `src/components/ui` | shadcn button, input, and textarea source |
| `src/components/layout` | Sidebar and breadcrumb/theme controls |
| `src/components/shared` | Icons, headings, metadata, and native dialogs |
| `src/features/memories` | Search, pagination, source reading pane, extracted facts |
| `src/features/graph` | Document membership and version graph |
| `src/features/handoffs` | Structured task state and revision editor |
| `src/features/connections` | Client setup and credential management |
| `src/lib` | Typed API, data contracts, formatting, graph layout |
| `src/hooks` | Theme preference |
| `src/styles` | Tokens plus focused layout/feature styles |
| `public/assets` | Logo and theme initialization before paint |

Use the existing primitives and tokens when extending a screen. New backend behavior belongs behind `src/lib/api.ts`; browser components do not contact the memory engine directly. Query keys separate document detail, search, graph, handoff, and credential state. Returning to a section refreshes its server data while retaining the local view.

## Theme and browser behavior

The first visit follows the device's color preference. The Dark mode toggle saves an explicit light/dark choice under `memory-theme`; changes synchronize across tabs. Only the theme preference is persisted in browser storage.

The initialization script, bundle, font, and logo use same-origin assets. Native dialogs retain browser focus/Escape behavior without requiring an inline-style exemption in the gateway's Content Security Policy. Source content is rendered as React text. Newly created bearer tokens stay outside query caches and browser storage and are removed from the page when their dialog closes.

## UI source and notices

The selected design and browser comparison evidence live in `../docs/design`; `../design-qa.md` records the visual review and its limits. Those screenshots contain illustrative local documents, not production exports. shadcn components were generated with its CLI and adapted through shared utilities and theme tokens. Upstream notices are retained in `licenses` and copied into the runtime image.
