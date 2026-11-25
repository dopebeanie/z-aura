# Z-Aura 0.3.2 — Comfort candidate

Local candidate dated 2026-11-25. No publishing, deployment or Developer Portal edits.
Delivered 0.3.1 and retained 0.3.0 are not replaced.

## Six requested changes

1. **Release compatibility.** The existing official release uses tag `Z-Aura` and body
   `Version: 0.3.1 (Lastest)`. Only that legacy tag permits one explicit, anchored Version line.
   Stable numeric and `Z-Aura-` branded numeric tags are also accepted. Repository casing is
   insensitive; authority, tag/asset suffix, query, credentials, EXE selection, SHA-256 and size
   restrictions remain strict. No arbitrary-prose guessing, prerelease or downgrade.
   GitHub's live API returned 403 here; HTML confirmed the legacy tag/body. Future asset metadata
   and an actual later-version install have not been accepted live.
2. **Clickable overlay.** Zapret dispatches through the existing `Run(ToggleEngine)`;
   Proxy through the same state-aware `ToggleProxy` as the main card. Starting Proxy is cancellable.
   Buttons have independent enabled states, accessible names/status, keyboard focus and tooltips.
   Enter on a button is not intercepted by the overlay's open-window handler; button regions do
   not initiate dragging. Existing process ownership, settings and tray behavior remain.
3. **Browser return.** Restore the existing main window, preserve maximization, restore visible
   owned dialogs and ask Windows for foreground focus with bounded-scope native calls. Thread
   input attachment is released in finally; no simulated Alt keys, registry changes or permanent
   topmost flag. Windows may still reject focus; the tray fallback remains honest.
4. **Status alignment.** Inline indicators use natural font line metrics with zero paragraph
   margin, and dots share vertical center. The Telegram listener row no longer has a bottom offset.
5. **Website language/theme.** Static RU/ENG main pages and all three legal pages; shared local
   theme preferences, keyboard outlines, reduced motion/transparency and contrast handling.
   The embedded return page defaults to the app's language/theme and switches via enumerated
   local GET links, without scripts/storage or account details. Its separate nonce/Origin POST,
   S256 PKCE, issuer/state checks, no-store and same-origin referrer policy remain.
   Production callback window: 3 minutes before callback, 10 minutes afterwards; max 128 requests.
6. **Remembered Discord session.** `discord-session.bin` stores credentials, expiry and public
   profile as Windows DPAPI CurrentUser ciphertext. Atomic writes have no plaintext backup;
   reads are bounded to 64 KiB and reject reparse-point paths. Access/refresh tokens never enter
   settings, URLs, logs, website preferences or Presence. Avatars remain memory-only.

## Session lifecycle and limits

- Restore independently of engine/Presence. Refresh near expiry, serialize restore/exchange/logout,
  commit a rotated refresh token before fetching the public profile, retry offline failure no faster
  than once per minute and revalidate periodically (at most six hours between successful checks).
- Offline startup retains the encrypted grant and cached identity, not proof of current online authorization.
- `invalid_grant`, unauthorized identity or account substitution clear the saved grant; another
  voluntary sign-in is required. No automatic consent and no new OAuth scope.
- Sign-out clears local persistence before online revocation. If revocation fails, revoke in Discord's
  Authorized Apps. Ordinary shutdown retains the session; deleting its file while closed removes it.
- Protection is local to the Windows account/device, not portable sign-in and not protection against
  malware with that user's rights. A moved portable folder requires new sign-in on another PC/user.
- Corrupt/foreign ciphertext fails closed and is not silently deleted. Successful user-requested
  sign-in can replace it; otherwise the unfamiliar file remains.
- Live public-client refresh, a real second account and actual PC-reboot acceptance are still unverified.

## Website artifacts

```powershell
node scripts/build-main-site.mjs
node scripts/build-discord-legal-site.mjs --draft --config website/legal/site.config.json --out artifacts/sites-0.3.2/legal
```

Main: `Z-Aura-GitHub/index.html`, `index.en.html`, `assets/preferences.js`.
Legal: six HTML pages, CSS, preference script and `portal-links.json` (nine files).
Updated privacy texts disclose DPAPI persistence, deletion, local theme storage and Google Fonts
on the main site. Owner/hosting/contact are retained, not invented. Revision 25.11.2026 is proposed;
`publicationApproved:false` requires renewed owner approval. Draft URLs remain null.
The older approved/deployed pages are not overwritten remotely. No assistant deploy is authorized.

## Evidence

- Production outer EXE: **96,389,120 bytes**, SHA-256
  `175dd7802f5419bfa5ba8c1dae75c3116b7e8c2b72504f5e0ac158c48a642ded`.
- Native and managed manifests: `requireAdministrator`; version 0.3.2.0; x64/system imports only.
- Backend: **1,766 assertions**, including actual DPAPI, expiry/rotation, concurrent restore,
  revocation, offline retention, malformed/corrupt/oversized storage and release parsing.
- GUI: **278 PASS records**, independent overlay dispatch/disabled states, natural status metrics,
  tray/hidden/minimized window return, prior RU/ENG, focus, modal, proxy and layout regressions.
- Node: **69 tests**; localization inventory **696 fragments**, no Cyrillic in English values.
- Real Chromium form acknowledged after EN/dark switching; strict Origin/nonce validation invoked
  the isolated callback once. Browser form and WPF window restoration are separate fixtures,
  not a live OAuth/browser-to-production-window end-to-end acceptance.
- Main and six legal pages: both languages/themes at 375 px, no horizontal overflow. This is
  scoped layout testing, not a full accessibility or mixed-DPI audit.
- Self-contained asInvoker payload: **1,736 assertions** with invalid DOTNET_ROOT, excluding
  the optional console fixture. Full packaged runs failed at existing console READY checks;
  reports remain in `artifacts/comfort-0.3.2-packaged-*`. The framework-dependent suite passed
  all console assertions. No assertion was removed and packaged console acceptance is not claimed.
- A first self-contained publish overlapped the GUI fixture and hit a DLL lock. After GUI exit,
  unchanged serial publish completed. Production outer EXE/managed payload were not replaced by
  the unprivileged test payload.

Remaining: live OAuth/refresh/reboot, actual newer-release install/UAC, Telegram/media/ISP,
driver/service and clean-Windows tests, publisher signing and third-party license/source review.
Z-Aura is not a VPN and guarantees neither connectivity nor anonymity.

Project channel: https://t.me/zaurafork. Donate remains optional: **СберБанк / SberBank**,
**2202 2085 9236 5168**; **Пожертвования** in RU, **Donate** in ENG; all features remain free.
