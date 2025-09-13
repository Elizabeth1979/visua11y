# `manifest.json` Explained (Non‑Developer Friendly)

Chrome reads `manifest.json` to understand your extension: its name, icons, permissions, and which scripts run where.

```json
{
  "manifest_version": 3,                       // Format version for Chrome extensions (MV3 is current)
  "name": "Visua11y",                         // Extension name shown in Chrome
  "version": "0.1.0",                         // Your extension version number
  "description": "An AI-powered accessibility assistant to make the web easier to use.",
  "permissions": [                              // What the extension is allowed to do
    "storage",                                  // Save settings (like your API key) in Chrome
    "activeTab",                                // Work with the currently active browser tab
    "contextMenus",                             // Add right‑click menu items (e.g., Summarize)
    "scripting",                                // Inject small scripts into pages when needed
    "tabs"                                      // Query info about open tabs (e.g., active tab)
  ],
  "host_permissions": [                         // External websites the extension can contact
    "https://api.openai.com/*"                  // Needed to call OpenAI for AI features
  ],
  "background": {                               // Background “brain” that reacts to events
    "service_worker": "background/service-worker.js", // File that runs in the background
    "type": "module"                           // Use modern JavaScript modules
  },
  "content_scripts": [                          // Code automatically added to web pages
    {
      "matches": ["<all_urls>"],               // Run on all websites (so we can show summaries)
      "js": ["content/content-script.js"],     // The script that draws the summary box
      "css": [                                  // Styles used by the summary box
        "assets/styles/global.css",
        "assets/styles/summary-box.css"
      ]
    }
  ],
  "action": {                                   // Toolbar icon behavior
    "default_popup": "popup/popup.html",       // Small window when you click the icon
    "default_icon": {                           // Icons for different sizes
      "16": "assets/icons/icon16.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  "icons": {                                    // App icons used by Chrome in various places
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  }
}
```

Notes
- We removed the `debugger` permission to reduce risk and improve store approval odds.
- We only request the OpenAI host permission since that’s the only external API used.
- Comments above are for explanation — the real `manifest.json` cannot contain comments because JSON doesn’t allow them.

