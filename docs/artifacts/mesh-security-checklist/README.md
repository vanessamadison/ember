# Mesh security checklist (web)

This folder contains a **browser/React** copy of the in-app checklist from **Settings → Mesh Network**.

| Artifact | Purpose |
|----------|---------|
| [MeshSecurityChecklist.web.tsx](./MeshSecurityChecklist.web.tsx) | Drop-in component for a documentation site or standalone Vite page |

**Storage:** `localStorage` key `ember_mesh_security_checklist_v1` (same identifier as the native app’s AsyncStorage key).

**Native source of truth:** `src/components/MeshSecurityChecklist.tsx` and `src/mesh/meshSecurityChecklistPreference.ts`

**Copy rule:** When you change checklist copy or steps in the app, update this file the same way (or extract shared copy to a JSON module later).

### Quick preview (Vite + React)

```bash
npm create vite@latest ember-checklist-preview -- --template react-ts
cd ember-checklist-preview
npm install
```

Copy `MeshSecurityChecklist.web.tsx` into `src/`, import it in `App.tsx`, run `npm run dev`.

Adjust the link to `MESHTASTIC-NODE-SECURITY.md` for your host (GitHub raw URL, docs base URL, etc.).
