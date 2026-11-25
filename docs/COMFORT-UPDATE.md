# Z-Aura 0.3.0 — Comfort Update

**Historical design:** memory-only OAuth and a 90-second return listener. Current 0.3.2
supersedes those details; see [COMFORT-0.3.2.md](COMFORT-0.3.2.md) for protected persistent
sessions, refresh, foreground restoration and RU/ENG + theme websites.

Historical 0.3.0 candidate: `artifacts/portable-discord-return/Z-Aura.exe` (0.3.0.0), including the
Comfort, layout/sidebar and Discord-return changes. Old intermediate EXEs are intentionally
removed in the user-approved cleanup; current user settings, runtime inputs, the supplied
hosts sample and approved branding/legal/video source materials are preserved.
This is filesystem work only: no release, push, Portal update, website deployment or Telegram post.

Included post-delivery layout fixes:
- Journal uses a remaining-height table with measured note/action rows, preventing text from
  escaping the card at minimum window size.
- General/Appearance tabs retain the original compact string-header metrics and localize in place.
- Optional Discord sign-in is in the lower sidebar immediately above Telegram Channel. After
  authorization it shows a round avatar, display name and username; long names use ellipsis and
  user identity text is never translated. Click the account to sign out. Navigation can scroll
  independently on small windows; the account/channel stay pinned below it.

## Features and boundaries

- RU / ENG: first launch defaults to RU; Welcome and Settings selectors save immediately.
  `assets/en.json` contains the presentation catalog. Localized control subclasses coerce their
  display properties; template/data-grid bindings localize presentation only. Editable names,
  profiles, argv, host entries and source log records are not rewritten.
  Roslyn literal/fragment audit: `scripts/localization-audit/`.
  Native error screens also read the top-level saved language through a bounded read-only preference
  hint; first-launch native errors are RU. The numbered base inventory is stored as a hash-pinned
  source file, not regenerated from current line order.
- Tray: default enabled for new settings; existing saved `false` stays false.
  Minimize hides the window when enabled. Close hides without stopping GUI-owned processes.
  Open/double-click shows the same window and clears its minimized state. Explicit Exit stops
  app-owned zapret and Proxy; an installed SCM service is independent.
- Stop safety: only a disposable `--console-stop <pid> <start-ticks>` helper attaches to the
  child's console. It validates identity and rejects consoles containing unrelated processes.
  Its Ctrl+Break handler is never removed. The GUI neither attaches nor broadcasts. A timeout
  falls back to the previously owned process/job cleanup. This removes the unsafe sender race;
  reproducing the user's exact elevated winws shutdown environment still requires live acceptance.
- Tutorial: optional five-step first-entry invitation; Skip/close remembers the decision.
  Guide can reopen it. Automated UI roots never open it automatically or contact Discord.
- Overlay: optional 224×76-DIP window, three horizontal elements, two read-only process-status
  indicators and an Open action. Drag/double-click, edge/corner snapping, stored physical position
  and anchor, monitor work-area clamping; no taskbar entry. Disable/close never stops controllers.
  Real mixed-DPI monitor/hot-plug interaction remains a manual acceptance item.
- Welcome action uses zero text margins and centered content after successful loading/retry.
- Style: subtle status pills, local/version badge; supplied `Z-Aura.png` bundled as
  `assets/brand-logo.png` for the top-left header. Other approved assets are unchanged.
  The Stop action now uses an original stroked power arc/stem in the same icon style, not a square glyph.
- Metadata: managed payload and distributed native launcher both identify
  `@dopebeanie / TC Studio`, version `0.3.0.0`, product Z-Aura, description, copyright and filename.
  The native VERSIONINFO is generated from the project's FileVersion. This is not publisher signing.
  Native OriginalFilename is `Z-Aura.exe`; the managed payload's original assembly is `Z-Aura.dll`.

## Reversible YouTube Focus

The bundled zapret runtime stays Flowseal **1.10.4**, with the same **22** source presets.
Focus copies the selected profile, freezes its base strategy and inserts two YouTube-only blocks
before its original blocks. It reuses TLS/QUIC desync parameters from a selected bundled preset
(General, ALT6 or FAKE TLS AUTO), scopes them to YouTube/CDN domains and shifts copied resource
binding indices by two. It never replaces presets, binaries, Windows/browser settings or hosts.

Creation requires preview/confirmation. It selects the new copy but never stops/switches an
already running process. Restart manually to apply; Return selects the previous ALT without
deleting the experimental copy. No guarantee of playback or ISP coverage is implied.
HTTPS diagnostics cannot test QUIC, complete video-CDN routing or playback speed.

## Optional Discord profile sign-in

Application ID stays **1573957957576556685**. Always-on local Rich Presence remains independent.

Owner setup in [Discord Developer Portal](https://discord.com/developers/applications):

1. Select that application → OAuth2 → Redirects.
2. Register exactly **`http://127.0.0.1:43827/oauth/callback`**, save the change.
3. Validate browser-based code+S256 PKCE sign-in using `identify` only. No Client Secret,
   bot token, password, email, servers, friends or messages are required by Z-Aura.
4. Test consent denial/cancel, occupied callback port, missing Redirect URI, expiration,
   sign-out/revocation and firewall/security behavior. These Portal/live checks were not performed.

The listener is loopback-only and temporary. The OAuth callback accepts GET only and is
bounded to a three-minute flow.
The callback validates exact host/port/path, unique state, fixed-time state equality and
Discord issuer. Tokens are exchanged in HTTPS form bodies; access token only in the bearer header.
HTTP redirects are disabled and responses bounded. Error bodies/tokens are not logged.
Profile and access token live in memory only. No refresh token is retained; exit requires a new
sign-in. Sign-out clears local state before attempting server revocation. If revocation is refused,
the UI explains how to revoke permission in Discord's Authorized Apps. There is no automatic login.
Public avatars are fetched only after voluntary sign-in, as static PNGs from fixed Discord CDN
paths, without bearer headers, redirects or a disk cache. Responses are limited to 256 KiB/15 s;
default Discord avatars or a local icon cover missing/unavailable images. Images and identity are
cleared on sign-out/expiry/exit and never sent to Rich Presence.

Official reference checked: https://docs.discord.com/developers/topics/oauth2
Current documentation explicitly permits unauthenticated authorization-code exchanges using S256 PKCE.
Refresh without a secret requires public-client configuration; this app intentionally does not refresh.

### Local browser return page (sidebar/return follow-up)

After a validated callback, the browser receives a 303 to `/oauth/complete`, so the displayed
URL and branded page contain no OAuth code/state, access token or account identity. The page
is bundled into the EXE with its own RU/ENG strings, logo and Inter font: no external hosting,
scripts, analytics or third-party page-resource requests. It reports only receipt of Discord's
response; actual sign-in success/failure remains in Z-Aura, including consent denial.

**Return to the app** sends a bounded same-origin POST with a separate random return nonce,
checked in fixed time. It invokes restoration of the existing GUI (including hidden/minimized
states and a still-open login dialog), without registering a Windows URL protocol, launching
another EXE, changing authorization, Presence or engine state. The listener closes 90 seconds
after the callback, on a new login/sign-out, or application shutdown. Manual tray restoration
is explained as a fallback, since Windows may refuse foreground focus and expired buttons
cannot contact a closed local listener. Responses use no-store, no-referrer, nosniff and a
restrictive CSP with framing prohibited. Bodies, attempts and per-request time are bounded.

Ordinary users can authorize `identify`; there is no application-owner allowlist. Each user
needs the app running on their own PC and accessible Discord, not access to Developer Portal.
The same registered `127.0.0.1` redirect reaches each user's own local listener. Public Bot is
unrelated. The current official OAuth documentation allows any application to exchange a code
without a secret when S256 PKCE is used; public-client configuration is relevant to refresh,
which Z-Aura does not perform. Live acceptance with a second account remains unperformed.

Sidebar navigation also reserves 4 DIP *inside* the scroll viewport, preserving button outlines
during hover/focus/selection. ScrollViewer padding alone would move, rather than inset, the clip.
The 0.3.0 output is `artifacts/portable-discord-return`; earlier build outputs were removed
only after the user requested cleanup. Current build verification is in [DESKTOP-VERIFICATION.md](DESKTOP-VERIFICATION.md).

RPC statistics are **current-session** successful GUI-engine/Proxy start edges and the number of
on-demand HTTPS checks. They do not represent bytes, speed, successful bypass or SCM traffic.
Sharing counters is optional; hiding them does not disable Presence. Stable application-lifetime
elapsed, backoff/coalescing, artwork, Telegram channel and safe My Alt are retained. Account names
and OAuth tokens never enter activity snapshots. While an engine is running, its actual profile
takes precedence over a newly selected but not yet launched profile.

## Verification and remaining acceptance

Reports: `artifacts/sidebar-return-self-test.txt`, `artifacts/sidebar-return-ui-smoke/report.txt`,
`artifacts/comfort-localization-current.json`, `artifacts/portable-discord-return-verification.json`.
Self-tests include owned native-console fixtures, pure profile/geometry/statistics checks and fake
OAuth HTTP exchanges. UI fixtures use private data, injected DNS/TLS and loopback-only proxy.

Still manual: the user's live elevated winws Stop behavior, real video playback/ISP strategies,
Discord consent and Portal setup, live RPC presentation, mixed-DPI dragging, clean Windows/offline,
real UAC/security software, hosts apply/rollback and service/reboot acceptance.
Signing and third-party redistribution/source requirements still need review. Optional OAuth and
statistics expand privacy disclosures: the previously approved public legal site was not changed;
review updated disclosures before publishing this candidate.

Z-Aura is not a VPN, does not hide IP or add VPN encryption and guarantees neither connectivity nor anonymity.
