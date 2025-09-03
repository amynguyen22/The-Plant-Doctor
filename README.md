# The Plant Doctor
The Plant Doctor is plant diagnostic tool to help plant lovers easily determine plant issues. It is a client-side React app. Upload a photo, pick symptoms, select soil conditions, and get a ranked list of likely problems with actionable steps. Everything runs in the browser—there is no backend.

## Quick start
```bash
npm install
npm run dev
# open the URL Vite prints (e.g. http://localhost:5173)
```

## Features
- Intake → brief loading → results flow
- Symptom & soil condition selectors (pill buttons)
- “Fertilized recently” yes/no switch
- Ranked diagnoses with confidence, reasons, actions
- Local history (thumbnail-only) with export/clear/compact
- 100% client-side; images never leave the device

## Tech stack
- Vite • React 18 • TypeScript • Tailwind CSS • lucide-react
- Lightweight Tailwind UI primitives (Card, Button, Tabs, etc.)

## Structure
```
src/
  pages/PlantDoctorApp.tsx   # main UI flow
  lib/                       # analyze, images, storage, constants, types
  components/ui                # YesNoSwitch + small UI primitives
  assets/                 # Branding
```

## How it works
- **Image handling:** FileReader → canvas downscale → preview (memory) + thumbnail (~360px) for history.
- **Analysis:** Heuristic rules (watering, humidity/light, nutrients, pests) → confidence-sorted results.
- **Persistence:** localStorage with quota-safe writes (strip thumbnails → prune oldest → clear as last resort).

## Accessibility & design
- Labeled inputs, ARIA `role="switch"` with `aria-checked`, keyboard focus states.
- Tailwind design: rounded cards, soft shadows, emerald accents.

## Dev scripts
```json
"dev": "vite",
"build": "tsc -b && vite build",
"preview": "vite preview"
```

## Customize
- Add symptoms/soil options in `PlantDoctorApp.tsx` and rules in `lib/analyze.ts`.
- Tweak UI styles in `components/ui/*` and `index.css`.

## Troubleshooting
- **@tailwind at-rule:** Ensure Tailwind config includes `./index.html` and `./src/**/*.{ts,tsx}` and `postcss.config.js` loads tailwindcss.
- **Storage quota:** Use “Compact History”; the app also auto-prunes on overflow.

## License
MIT © 2025 Amy Nguyen — See (./LICENSE) for details.
