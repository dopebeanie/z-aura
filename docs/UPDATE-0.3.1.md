# Z-Aura 0.3.1 — Update

Work is local-only: no GitHub release/push, website deployment, Telegram post or Portal change.
The application remains .NET 10/WPF + LLVM-MinGW, with production administrator manifests.
Original runtime inputs and all 22 Flowseal 1.10.4 presets are retained.

## Application updates

- Source: `https://api.github.com/repos/dopebeanie/Z-Aura/releases/latest` only.
- Numeric three-part stable version tags, optionally prefixed by `v`; no drafts, prereleases,
  downgrade or same-version reinstall. No Flowseal update endpoint is used.
- New/default settings: version checks enabled on entry and every six hours; automatic EXE
  downloading disabled until opted in. Existing explicit settings are preserved.
- GitHub receives IP/normal request metadata and `Z-Aura/<version>` User-Agent. No OAuth token,
  profile, local settings, journals or session statistics are sent. No API token is required.
- Metadata is bounded to 1 MiB/20 s. EXE is bounded to 1–256 MiB/10 minutes, with cancellation,
  byte count and SHA-256 verification. Only exact GitHub release download paths are accepted;
  redirects may reach `release-assets.githubusercontent.com` over HTTPS/443, never other hosts.
- A missing digest or ambiguous asset blocks automatic installation and offers manual Releases.
- Downloaded EXE must be x64 PE, product `Z-Aura`, company `@dopebeanie / TC Studio`,
  OriginalFilename `Z-Aura.exe`, and the selected version plus `.0`.
- Install/restart requires explicit consent. The old launcher is copied into a private GUID
  directory adjacent to the target; the downloaded EXE is never used as the replacement helper.
- Helper derives the target from the still-live GUI's native parent and verifies PID/start time,
  launcher hash and job placement. Same-user named pipe READY/GO handshake precedes normal exit.
  It never kills an unrelated process, edits hosts or changes the installed service.
- After bounded exit waits, helper verifies original/new hashes again, copies with source locks,
  performs an atomic same-volume replace with backup, and requests restart from the original path.
  A launch-request failure rolls back its own replacement. This is not an early-crash health check.
- Settings, data, profiles, lists, `portable.flag` and service resources are not update targets.
  The GUID job holds `previous.exe` and `result.json` for manual diagnosis/rollback; downloaded
  cache and successful helper directories are not blindly deleted.

### Owner release requirements

Publish a stable tag (e.g. `v0.3.1`) in **dopebeanie/Z-Aura** with exactly one supported x64
asset named `Z-Aura.exe` **or** `Z-Aura-0.3.1.exe`, never both. GitHub's asset API must expose
`state: uploaded`, matching `size`, and `digest: sha256:<64 hex characters>`. Publish the same
SHA-256 for manual verification. Include corresponding-source/licensing materials as required.
The endpoint and actual public release are not modified by this work. Version checks cannot
offer an unpublished release, and 0.3.0 builds predating the updater still need a manual upgrade.

**SHA-256 and PE metadata are not publisher signing.** Trust in the GitHub repository/transport
remains required; repository compromise cannot be solved by a hash provided by that repository.
Production UAC, AV/SmartScreen, a real later-version native replacement and clean-Windows
update/restart still require acceptance before broad rollout.

## Discord Return and focus

The callback's 303 keeps `no-referrer` and removes code/state from the address. The clean
completion document uses `same-origin` in both its HTTP header and HTML meta, preventing Chromium's null Origin on form POSTs
without leaking referrers to external origins. Exact local host/path/Origin, nonce, state,
method/body limits and the 90-second return lifetime remain enforced; `Origin: null` stays rejected.
Return restores the existing window only and never changes an already authorized account.

Mouse focus is kept functionally, but rings for buttons/switches/checkboxes/combos require
keyboard modality. Hover and keyboard outlines remain. Text input keeps its active-entry cue.
New details use static vector ornaments, specular glass edges and bounded WPF clocks; reduced
motion finishes them immediately, and reduced transparency/high contrast omit decorative sheen.

## Optional support

App sidebar/About, repository README and landing page show:
**СберБанк / SberBank · 2202 2085 9236 5168**. Copying requires a user click. Donations do not
unlock features. Transfers happen in the user's banking app; Z-Aura collects no payment data,
CVV/PIN/verification codes and makes no payment request itself. Verify recipient/details first.

The app button/dialog are **Пожертвования** in RU and **Donate** in ENG, with no mixed label.

## Verification

- Production portable EXE: `artifacts/portable-update-0.3.1/Z-Aura.exe`, 96,348,672 bytes.
- SHA-256: `8c1cfe9b49d0d38e53b14048e6e5330a2064ad4329fb1a509691ad78c936fdd4`.
- Production native/managed manifests retain `requireAdministrator`; 0 warnings/errors.
- 1,700 backend assertions; 273 GUI PASS records; 64 Node tests; 678 localization fragments.
- Separate unprivileged self-contained payload: 1,700 assertions with invalid DOTNET_ROOT.
- Actual browser: initial meta `no-referrer` overrode the fixed header, reproduced null Origin/400.
  Header + meta `same-origin` now send strict local Origin and render acknowledgement after 303.
- 16 fresh README screenshots retain all ten previous subjects plus the new screens.
- Real later-version updater install, live OAuth/Telegram/video/driver/service and clean Windows
  remain unverified. Previous 0.3.0 reports are historical, not acceptance of these changes.

Full evidence and limitations: [DESKTOP-VERIFICATION.md](DESKTOP-VERIFICATION.md).
