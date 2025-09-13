# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Chrome extension — no build process required:

- **Load**: `chrome://extensions/` → enable Developer mode → "Load unpacked"
- **Reload**: Click refresh icon in `chrome://extensions/`
- **Inspect service worker**: `chrome://extensions/` → Visua11y → "Service worker"
- **Inspect popup**: Right‑click extension icon → "Inspect"
- **Content logs**: Webpage console shows "Visua11y" messages

## Architecture

Accessibility Chrome extension with AI‑powered summarization, TLDR, and page layout analysis.

**Core Files:**

- `background/service-worker.js` - Main controller, context menus, message routing
- `background/ai-manager.js` - AI service coordination and fallbacks
- `content/content-script.js` - Display summaries on web pages
- `manifest.json` - Extension permissions and configuration

## AI Service Priority

1. Chrome Built‑in Summarizer API (primary, when available)
2. OpenAI API (secondary; requires user‑provided key via popup)
   - If neither is available, UI shows a helpful error (no heuristic fallback).

## API Key Setup

- Use the extension popup to configure the OpenAI key (stored in extension storage).
- No file‑based secrets are used or packaged.

## Key Development Notes

- Extensive console logging with emoji prefixes for debugging
- Graceful error handling across AI backends
- WCAG 2.1 AA accessibility compliance required
- Never commit API keys; no config files with secrets are used
- Chrome AI setup for local testing: enable the relevant flags in Chrome Canary/Dev if summarizer isn’t available
  - `chrome://flags/#optimization-guide-on-device-model`
  - `chrome://flags/#summarization-api-for-gemini-nano`
- See `SETUP.md` for API key instructions
- See `PRODUCTION.md` for production readiness checklist
- See `README.md` for user documentation and project details
