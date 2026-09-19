# Solo Card Puzzle

TypeScript + Three.js + GSAP + IndexedDB + PWA. Static deployment friendly.

## Run
npm install
npm run dev

## Build
npm run build

## GitHub Pages
The Vite base is `./`, so the built site works under a repository subpath. Publish the `dist` directory with GitHub Pages.

## Current explicit defaults
- 13-card hand.
- Four suits: cross, triangle, square, diamond.
- Numbers 1–13 with 13→1 wraparound.
- Play one card, then draw one.
- A maximal consecutive-number run of at least 4 completes immediately.
- If the entire resolved run also has one identical suit, it counts as 2 groups.
- The resolved run moves to the completion area logically; the current renderer keeps the completion area minimal.
- Win target is temporarily 3 groups and is centralized in `CONFIG.WIN_GROUPS`.

This is an engineering-complete playable baseline, not proof of final human experience. The PRD still requires playtesting to validate the target group count and pacing.
