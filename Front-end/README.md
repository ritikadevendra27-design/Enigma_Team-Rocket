# GreenLoop

GreenLoop is a frontend-only demo for a circular material exchange platform. It connects organizations with unused materials to local buyers and reuse partners, and makes the resulting circular impact visible.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build` and preview it with `npm run preview`.

## Demo

- Choose **Continue as Demo User** on the login screen, or choose any of the college, recycler, and admin demo accounts.
- Post a material, open **Smart Matches**, then view its details and send an exchange request.
- On the material details page, use **Accept request** and **Mark exchange complete** to simulate the handoff.
- Listings, profile, and exchanges persist in browser `localStorage`. Clear the site's local storage to restore the seeded state.

Green Points use the demo factors in `src/data.js`. Estimated CO₂e factors are configurable there as well. Both are prototype estimates, not certified carbon credits.

## Stack and layout

- React and Vite
- Tailwind CSS utilities with a custom responsive design system in `src/styles.css`
- React Router, Lucide React, and Recharts
- `src/data.js`: seeded demo listings, exchanges, chart data, and impact factors
- `src/App.jsx`: landing, authentication demo, application shell, marketplace, posting, matching, and material detail flows
- `src/Extra.jsx`: exchange tracking, impact, profile, and admin demo screens

This project intentionally has no backend or external API dependency.
