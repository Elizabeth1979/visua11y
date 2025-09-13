# Security Policy

## Supported Versions

Visua11y is under active development. Please open an issue for any security concerns and mark it clearly as “Security”.

## Reporting a Vulnerability

- Do not include sensitive details in a public issue. Instead, describe the impact and request a private channel to share proof of concept.
- We aim to acknowledge reports within 72 hours and provide a remediation plan within 7 days for high‑impact issues.

## Secrets and API Keys

- The project does not package or commit API keys.
- Users provide OpenAI or Gemini keys in the extension popup; keys are stored in the extension’s storage area.
- Never hardcode keys or include configuration files with secrets in the repository or extension package.

## Permissions and Data Access

- Manifest permissions follow a least‑privilege model: `activeTab`, `scripting`, `contextMenus`, `tabs`, and `storage`.
- Host permissions are limited to `https://api.openai.com/*` and `https://generativelanguage.googleapis.com/*`.
- The extension injects code only into the active tab when needed.

## Supply Chain

- Use dependency vulnerability scanning before releases.
- Pin/lock dependency versions if a build system is introduced.
