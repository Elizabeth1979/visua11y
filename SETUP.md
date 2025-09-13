# 🔒 API Key Setup Guide

This extension uses your API keys only when needed and stores them locally in extension storage.

## 🎯 Configure Your OpenAI API Key

1. Install the extension
2. Click the Visua11y icon to open the popup
3. Expand "⚙️ Configure API Keys"
4. Paste your OpenAI API key (starts with `sk-...`) and click "Save"

Notes:
- Keys are kept in extension storage and are not exposed to web pages.
- The UI masks saved keys; you can clear them at any time.

## 🎯 Configure Your Gemini API Key (optional)

1. Install the extension
2. Click the Visua11y icon to open the popup
3. Expand "⚙️ Configure API Keys"
4. Paste your Gemini API key (starts with `AIza...`) and click "Save"

Notes:
- Gemini support is optional; keys are stored locally just like OpenAI.

## 🛡️ Security Practices

- ✅ **No packaged secrets**: The extension no longer ships with any config files containing keys.
- ✅ **Extension storage**: Keys are stored in the extension’s storage area (scoped to this extension).
- ✅ **Masked display**: Keys are not displayed in plain text in the UI.
- ✅ **Least privilege**: Minimal permissions; only `https://api.openai.com/*` and `https://generativelanguage.googleapis.com/*` as host permissions.

## 🚀 How It Works

1. The extension first tries Chrome’s Built‑in Summarizer (when available).
2. If not available, it uses your OpenAI key from extension storage.
   (Gemini key storage is supported and can be used by features that target Gemini APIs.)
3. If neither is available, a friendly error is shown instead of a heuristic summary.

## 🔧 Development Tips

1. Test with and without an API key to verify both paths.
2. Avoid sharing Chrome profiles that contain saved keys.
3. Validate that `manifest.json` has no `debugger` permission and only the OpenAI and Gemini host permissions.
