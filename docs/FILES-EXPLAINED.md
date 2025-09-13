# Files Explained (Non‑Developer Friendly)

This short guide explains what each file/folder is for.

## Project Docs
- `README.md`: Overview, how to install, features, and roadmap.
- `SETUP.md`: How to add your OpenAI API key in the popup.
- `PRODUCTION.md`: Pre‑launch checklist (testing, security, store listing, etc.).
- `CLAUDE.md`: Notes for coding assistants and developers.
- `SECURITY.md`: Security practices (permissions, secrets, reporting issues).
- `PRIVACY.md`: What data is sent where and when.

## Extension Definition
- `manifest.json`: The Chrome Extension’s “app settings” (name, permissions, which files run where). Chrome reads this file to know how to load the extension.

## Background (the brain that runs in the background)
- `background/service-worker.js`: Sets up right‑click menu, receives popup requests, calls AI functions, sends results to pages.
- `background/ai-manager.js`: Talks to AI services (Chrome Built‑in AI if available, otherwise OpenAI with your key). Creates summaries, TLDRs, and screenshot analysis.

## Content (code that runs in web pages)
- `content/content-script.js`: Draws the summary popup box on the page near your selected text and handles formatting and close‑button logic.

## Popup (small window when you click the extension icon)
- `popup/popup.html`: The popup layout — buttons for TLDR and Page Analysis, and the key‑entry form.
- `popup/popup.js`: The popup’s behavior — captures screenshots, asks background to run AI, shows results.

## Assets (images and styles)
- `assets/icons/icon16.png`, `icon48.png`, `icon128.png`: Icons shown in Chrome toolbar and store listing.
- `assets/easy-reading.png`: Illustration used in docs/UI (if referenced).
- `assets/styles/global.css`: Shared design tokens (colors, spacing, fonts) and accessibility helpers.
- `assets/styles/popup.css`: Styles for the popup window.
- `assets/styles/summary-box.css`: Styles for the in‑page summary box.

## Housekeeping
- `.gitignore`: Tells git what to ignore (e.g., secret files, bundles, logs). Now annotated for non‑devs.

