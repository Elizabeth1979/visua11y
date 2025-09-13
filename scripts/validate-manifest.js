#!/usr/bin/env node
/*
 Human-friendly validator for this Chrome Extension's manifest (v3).

 What this script does, in plain language:
 - Opens the extension's settings file (manifest.json).
 - Checks for the most common issues that cause "the extension won't load".
 - Makes sure every file the manifest points to actually exists.
 - If something is wrong, it prints clear messages and stops the build.

 You can run it locally with: `node scripts/validate-manifest.js`
*/

const fs = require('fs');
const path = require('path');

const errors = [];

// Collects a readable error if a condition is not met.
function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

// Verifies a file exists at the path the manifest references.
// Example: fileExists('popup/popup.html', 'Popup HTML')
function fileExists(relPath, label) {
  const p = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(p)) {
    errors.push(
      `${label} not found at "${relPath}". ` +
      'Tip: check the spelling and folder path, and make sure the file is committed.'
    );
    return false;
  }
  return true;
}

function isSemverLike(v) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(v);
}

function main() {
  const manifestPath = path.resolve(process.cwd(), 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Could not find manifest.json at the project root.');
    console.error('Tip: the file should be named exactly "manifest.json" and live in the top folder.');
    process.exit(1);
  }

  let manifest;
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(raw);
  } catch (e) {
    console.error('manifest.json could not be read as valid JSON.');
    console.error('Tip: JSON requires quotes around keys/values and commas between items.');
    console.error('Parser error:', e.message);
    process.exit(1);
  }

  // Basic required fields
  // The manifest version must be 3 (this is how Chrome knows which rules to follow).
  assert(
    manifest.manifest_version === 3,
    'manifest_version should be 3. This project uses Manifest V3, which Chrome expects.'
  );

  // The extension needs a human‑readable name that shows in Chrome.
  assert(
    typeof manifest.name === 'string' && manifest.name.length > 0,
    'name is missing. Add a short, human‑friendly name for your extension.'
  );

  // Versions should look like 1.2.3 so updates are clear and predictable.
  assert(
    typeof manifest.version === 'string' && manifest.version.length > 0,
    'version is missing. Use a simple number pattern like 0.1.0.'
  );
  assert(
    isSemverLike(manifest.version),
    `version should look like 1.2.3 (three numbers with dots). Currently: "${manifest.version}"`
  );

  // Background service worker
  // This tells Chrome which script quietly runs in the background.
  assert(
    manifest.background && typeof manifest.background === 'object',
    'background section is missing. It should point to the background service worker file.'
  );
  if (manifest.background && typeof manifest.background === 'object') {
    // The background service worker is a file path like "background/service-worker.js".
    assert(
      typeof manifest.background.service_worker === 'string',
      'background.service_worker should be a file path (e.g., background/service-worker.js).'
    );
    if (typeof manifest.background.service_worker === 'string') {
      fileExists(manifest.background.service_worker, 'Background service worker file');
    }
  }

  // Action popup and icons
  // The action is the button in the toolbar; it can open a small popup window.
  assert(
    manifest.action && typeof manifest.action === 'object',
    'action section is missing. This defines the popup and icons shown in the toolbar.'
  );
  if (manifest.action && typeof manifest.action === 'object') {
    if (typeof manifest.action.default_popup === 'string') {
      // The popup HTML is shown when you click the extension’s icon.
      fileExists(manifest.action.default_popup, 'Popup HTML page');
    } else {
      errors.push('action.default_popup should be a file path to your popup HTML (e.g., popup/popup.html).');
    }
    if (manifest.action.default_icon && typeof manifest.action.default_icon === 'object') {
      for (const [size, iconPath] of Object.entries(manifest.action.default_icon)) {
        if (typeof iconPath === 'string') fileExists(iconPath, `Toolbar icon (${size}px)`);
      }
    }
  }

  // Top-level icons
  if (manifest.icons && typeof manifest.icons === 'object') {
    for (const [size, iconPath] of Object.entries(manifest.icons)) {
      if (typeof iconPath === 'string') fileExists(iconPath, `App icon (${size}px)`);
    }
  }

  // Content scripts
  // These files are injected into web pages to add functionality.
  if (Array.isArray(manifest.content_scripts)) {
    manifest.content_scripts.forEach((cs, idx) => {
      if (Array.isArray(cs.js)) cs.js.forEach((p) => fileExists(p, `Content script JS file #${idx + 1}`));
      if (Array.isArray(cs.css)) cs.css.forEach((p) => fileExists(p, `Content script CSS file #${idx + 1}`));
    });
  }

  if (errors.length) {
    console.error('Manifest check found some issues:');
    for (const e of errors) console.error(' -', e);
    process.exit(1);
  } else {
    console.log('Manifest looks good. All required files and settings are in place.');
  }
}

main();
