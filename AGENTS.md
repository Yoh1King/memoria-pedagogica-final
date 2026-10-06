<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data (classes/students/records/profiles) lives in Lovable Cloud tables with per-user RLS; `src/lib/store.tsx` loads everything on sign-in and applies optimistic updates + direct client writes — keeps the `useApp` API stable for components.
- Auth gate is `NameGate` (login/signup screen) wrapping `<Outlet />` in `__root.tsx`; signup auto-confirms so users land signed in.
- PWA: vite-plugin-pwa (generateSW, output in dist/client/sw.js) registered only via `src/lib/pwa.ts`, never in dev/preview; `PwaLifecycle` handles install/update/offline UI — keeps preview caches clean.
