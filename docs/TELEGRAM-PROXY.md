# Telegram Proxy + always-on Presence — WPF integration

Project news and changelog: [Telegram · @zaurafork](https://t.me/zaurafork).

Later connectivity diagnosis: [TELEGRAM-CONNECTIVITY.md](TELEGRAM-CONNECTIVITY.md).
An explicitly authorized live `req_pq_multi` probe through the packaged adapter
received valid DC2/DC5 `resPQ` responses with CF enabled, while CF-off TCP failed.
This is limited protocol evidence, not full Telegram Desktop/media acceptance;
the build-stage test results and remaining acceptance gaps below are historical.

Date: 24.11.2026. Scope: the **.NET 10/WPF application**, not the archived React/Tauri prototype.
Current candidate: `artifacts/portable-comfort-0.3.2/Z-Aura.exe`; latest evidence is in
[DESKTOP-VERIFICATION.md](DESKTOP-VERIFICATION.md). Build-stage hashes/report paths further
below are historical; those intermediate outputs were intentionally removed during the
user-approved cleanup. User data/live sessions are not changed. No commit, push, release or Portal upload is performed.

## Architecture and ownership

```text
WPF glass card / Ctrl+K                 selected Alt + own engine state
  │ async On / Off / Restart / config         │
  ▼                                          ▼
TelegramProxy (separate serialized worker) → DiscordPresence (existing IPC worker)
  │ private stdin config / stop                 │ immutable latest snapshot
  │ stdout proxy://status, proxy://log           │ throttle 130 ms / sampling 20 ms
  ▼                                            ▼
Owned Python process + kill-on-close Job    Windows Discord named pipe
  runner.py → Flowseal MTProto → WebSocket  Alt / Zapret / Proxy + lifetime timestamp
```

`Core/TelegramProxy.cs` contains the validated settings, content-addressed package
extraction and process controller. It never calls winws/SCM or kills by process name.
Requests are ordered at submission, serialized on a separate worker and stale starts
are cancelled. An OFF request works even if the edited settings are malformed.
Restart is explicit; a child crash becomes `error`, not an application crash.
Preparation verifies all 432 embedded resources, rejects path traversal/reparse
points and unlisted importable files, and restores missing/changed expected files
atomically. It does not delete unexpected files. Package versions use different cache
roots, avoiding obsolete modules from prior versions.

Readiness is emitted **after the owned process binds its socket**, not after launch,
and validated against the requested host/port. A startup without readiness is bounded
to 20 seconds after package preparation. Port conflict and denied access get useful
messages. Exit sends a private stdin stop command, waits up to four seconds, then
terminates only the owned tree and closes its Job Object. The headless adapter has a
three-second graceful bound. Python's stdin EOF also requests stop. The small native
process-creation/Job-assignment window remains an abrupt-crash audit item.

## Source, portable runtime and build wiring

Source: the supplied `C:\Users\Takira\Desktop\tg-ws-proxy-main`, version **1.12.0**,
https://github.com/Flowseal/tg-ws-proxy, MIT. The supplied folder is not modified.
`upstream/telegram/source` retains the source/license; `vendor-lock.json` pins the
archive, runtime, wheels, dependency files and source hashes.

- CPython **3.13.17** Windows x64 embedded distribution; isolated `_pth`, `-I -B -u`.
- Core dependencies: httpx[http2] 0.28.1, cryptography 46.0.5, certifi 2026.11.20,
  with all transitive wheels pinned by file hashes. No GUI/tray dependencies imported.
- All 32 native PE components are x64. Non-system imports, including CPython/OpenSSL,
  cffi and `vcruntime140*.dll`, are bundled. This does **not** mean CPython itself was
  compiled with GNU: prebuilt VC runtime DLLs are shipped; neither an MSVC compiler
  nor user installation of a VC redistributable is requested.
- `scripts/telegram/runner.py`: headless adapter, private JSON config on stdin,
  newline-delimited status/log events on stdout; no credentials in argv/environment.
- `scripts/pack-telegram.mjs`: offline hash validation, source copy, guarded upstream
  patch disabling immediate/hourly **GitHub CF-domain downloads**, license notices,
  deterministic sorted ZIP entries/timestamps. No refresh thread/updater/tray.
- `scripts/verify-telegram.mjs`: package hashes, architecture and native DLL closure.
- `Z-Aura.csproj`: embedded `assets/telegram.zip` and `telegram.manifest.json`.
- `scripts/build-portable.mjs`: offline pack + verify, `dotnet publish --no-restore`,
  then the existing LLVM-MinGW C bootstrap. No new NuGet/Rust dependencies.

```powershell
# Existing pinned vendor tree and .NET restore cache required; no package downloads:
node scripts/build-portable.mjs --output-dir artifacts/portable-telegram
node scripts/verify-portable.mjs --artifact-dir artifacts/portable-telegram

# Development-only acquisition when deliberately updating dependencies, NOT normal build:
node scripts/vendor-telegram.mjs --fetch --source 'C:\Users\Takira\Desktop\tg-ws-proxy-main'
# It refuses to overwrite an existing vendor lock; updates require explicit review.
```

One outer EXE contains .NET/WPF, the original packet-engine resources and Python ZIP.
No user-installed Python/.NET/Node/Go, WebView2, runtime downloads or MSVC toolchain
are needed. `portable.flag` selects adjacent `data`; otherwise the existing
`%APPDATA%\Z-Aura` semantics remain. Python extracts lazily to
`<data root>/telegram-runtime/<manifest hash>/`; no proxy is started automatically.
Clean-machine execution still needs the separate live acceptance test below.

## GUI, config and logs

`UI/TelegramProxyCard.cs` is the WPF replacement for a Tauri/XAML deliverable;
the application constructs its UI in C#, consistent with the surrounding project:

```csharp
var toggle = Ui.Switch("Proxy: OFF", false);
AutomationProperties.SetName(toggle, "Telegram Proxy");
var panel = Ui.Stack(header, Ui.Row(indicator, state), uptime, message, skeleton,
    Ui.Text("Локальный MTProto → WebSocket. Работает независимо от zapret."),
    Ui.Row(restart, config, telegram), logButton, logText);
var card = Ui.Card(panel);
toggle.Checked += (_, _) => { if (!syncing) ToggleProxy(true); };
toggle.Unchecked += (_, _) => { if (!syncing) ToggleProxy(false); };
```

- ON/OFF, stopped/starting/running/error, port and uptime; restart/config/Telegram link.
- Accent/error status ring, finite paper-plane/check morph, activity pulse, startup
  skeleton and success/error toasts. OFF remains usable during startup cancellation.
- Common custom templates cover keyboard focus/hover/pressed/disabled states.
- Light/dark, reduced motion/transparency, high contrast; timers/animations unsubscribe
  when the card unloads. Responsive action rows wrap at the supported window widths.
- GUI configuration validates port/secret/DC/domain/pool/buffer fields, displays inline
  errors and saves atomically; changes need explicit restart. Secret is locally stored
  as plaintext settings, not advertised as encrypted. The generated link uses the
  **actual running config**, not unapplied edits. This is MTProto, not SOCKS/HTTP.
- In-memory logs and pending UI queue are capped at 200 lines. Persistent daily proxy
  logs rotate at 2 MiB (one previous file); secrets are redacted. Older daily files are
  retained like the existing application logs, not an unlimited in-memory queue.
- Ctrl+K has independent proxy On/Off/restart/config actions, no Discord settings action.

Defaults: `127.0.0.1:1443`; only `127.0.0.1` or `::1` bind addresses accepted;
random 16-byte hex secret, pool 4, buffer 256 KiB, DC2/DC4 redirects retained.
CF fallback is **opt-in**, with pinned builtin/user domains, no GitHub refresh.
The GUI also edits H2-media, Worker domains and optional Fake TLS domain.
`UI/MainWindow.cs` owns async shutdown and coalesced bounded UI log delivery.

## Presence and settings changes

The existing `Core/DiscordPresence.cs` is extended, not replaced by an invented
`discord_presence.rs`. Defaults keep Application ID **1573957957576556685**, all 22
builtin mappings, arbitrary user profiles, safe optional HTTP(S) «Мой Alt» button
and operator-maintained available asset keys. Existing stored sections are not reset.

Channel update: `Core/ProjectLinks.cs` holds the single application URL
`https://t.me/zaurafork`. Welcome, sidebar, settings, tray and Ctrl+K expose a
user-triggered external link; no automatic navigation/subscription. Presence always
includes a `Telegram-канал` button. A valid optional `Мой Alt` remains first, for
at most two buttons. The public bilingual README, landing page and legal-page
navigation/footer include the same channel; the private owner contact is unchanged.
See [the current ready-to-copy plain-text channel post](TELEGRAM-POST-0.3.txt). No deploy or post was made.

```diff
- details: Alt: ALT10
- state: DPI-обход активен / Z-Aura
+ details: Alt: ALT10 · Zapret: On / Off
+ state: Proxy: On / Off
+ small_image: configurable proxy_on / proxy_off, with Alt/logo fallback
+ small_text: Proxy: On / Off · Alt: ALT10
- timestamp fixed at first successful ACK, reset on ID/session changes
+ timestamp fixed at worker creation, preserved until a full application restart
- retry 0.5 → 1 → 2 → 4 → 8 s
+ retry 1 → 2 → 4 → 8 → 16 → 30 s, silent debug/warn logging
- PresenceSettingsCard, SavePresence, internal Enabled lifecycle branch
+ no Discord settings UI/search action, no enable flag/API/snapshot seam
```

Discord supports one small image: when declared uploaded, proxy-state art takes
that slot; Alt stays in details/tooltip. Missing declared assets may silently be
omitted by Discord; a local ACK is not proof that Portal artwork exists. RPC artwork
rejection falls back to text. Silence/errors use `logs/presence-YYYY-MM-DD.log`, not
GUI modals/toasts. Worker cancels/clears IPC on shutdown and retries automatically.
Local healthy-IPC coalescing targets **≤200 ms**; Discord rendering/network backoff
is outside that bound. Elapsed includes the time before Discord starts.
Zapret On represents the application's owned engine, not a possibly independent SCM
service; the selected Alt is not proof of which strategy a service is running.

### Portal assets checklist — upload not performed

- [ ] Open the application with ID 1573957957576556685; confirm its Z-Aura name.
- [ ] Keep/upload `zaura_logo` and `alt_general`; optional `alt_*` art stays supported.
- [ ] Upload square `proxy_on` and `proxy_off` PNGs, checking current Portal limits.
- [ ] Add only confirmed uploaded keys to existing `discordPresence.availableAssetKeys`
  in local settings (closed app), or the embedded defaults for future distributions.
- [ ] Optional keys can be renamed via `proxyOnImageKey` / `proxyOffImageKey`;
  default tooltips are `Proxy: On/Off · Alt: <name>`.
- [ ] Check real Discord with another account, elapsed/tooltips and optional button.

No Portal credentials, tokens, artwork generation/upload or public publishing was
used. New keys are not falsely marked uploaded in defaults.

## Nine-scenario test/acceptance plan

Reports: `artifacts/telegram-self-test.txt`, `artifacts/telegram-ui-smoke/report.txt`,
`artifacts/telegram-dependency-verification.json`, and the candidate PE/hash report.
Original Telegram-integration baseline, before the channel update: **798 backend assertions** (including
432 extracted resource hash checks), **99 GUI PASS records** (35 page/theme renders
and 64 interaction/layout checks), **34 Node tests**, **6 Python adapter tests**,
and **32 x64 native files** with all non-system imports bundled. Release/publish
completed with zero warnings/errors. Local IPC timing: **150.9 ms** final Alt and
**156.5 ms** final proxy state; these are fixture results, not live Discord UI timings.

Preserved original Telegram candidate: **95,508,992 bytes (91.08 MiB)**. SHA-256:
`cab634d70ec4fe295f1ffb7e63969a71fb3d750600d77ea788e32f54e29d0a81`.
The native launcher and managed payload both retain `requireAdministrator` as in
the original application; the proxy alone does not introduce an elevation requirement.
Launcher PE imports are Windows system DLLs only. A fresh no-install clean VM is
not represented by this PE/build verification.

### Channel-link update verification (24.11.2026)

- New candidate: `artifacts/portable-telegram-channel/Z-Aura.exe`, **95,511,040 bytes**
  (91.09 MiB); SHA-256 `2303da5b65809e88549f9f4faace5b2c6ecf53198197a945a80d479ef223009a`.
- Release/publish: zero warnings/errors; PE manifests/imports and bundled proxy hashes verified.
  All **6 Python adapter tests** also passed against the freshly packed runtime.
- **798 backend assertions**, including My Alt + channel within Discord's two-button limit.
  Reports: `artifacts/telegram-channel-self-test.txt`; local IPC timings **175.6 ms**
  (Alt) / **154.2 ms** (Proxy), not actual Discord UI measurements.
- **102 GUI PASS records**: channel Welcome/settings/sidebar/palette checks, plus the
  existing proxy/theme/config/layout and library regressions. Captures/report:
  `artifacts/telegram-channel-ui-smoke/`. No external channel button was clicked in fixtures.
- **38 Node tests**: common channel URL, generated legal-page links/private contact,
  website scroll-spy external-link guard and exact **350-character** GitHub description.
- Landing page loaded in the browser from a loopback preview server: four channel links,
  new feature cards and in-page navigation; no console errors at 1000px viewport,
  nav bounds did not overlap. No channel post, public deploy or GitHub push performed.
- Public upload pack: `artifacts/Z-Aura-GitHub-Telegram.zip` (README, description,
  website and screenshots). Legal navigation/footer-only update is separate:
  `artifacts/Z-Aura-GitHub-Pages-Channel.zip`; it preserves the owner contact and
  is not a newly reviewed proxy privacy policy. Prior packs/video/EXEs are retained.

All automated Presence uses random test-owned pipes, never `discord-ipc-*`;
GUI/self-tests isolate user storage. Proxy fixtures use pool 0 and no DC redirects;
Python adapter tests additionally deny outbound non-loopback network calls.

| # | Scenario / expected result | Automated evidence | Live acceptance |
|---|---|---|---|
| 1 | Start with Discord, both switches Off; current Alt and both Off visible | Snapshot/IPC construction | New integrated candidate not checked in real Discord |
| 2 | Start without Discord; open it later; silent retries and elapsed from app start | Fake delayed launch, backoff and lifetime assertions | Real delayed launch pending |
| 3 | Builtin/custom Alt changes and ten rapid proxy toggles; final snapshot coalesces ≤200 ms | Local IPC timing assertions; rapid process toggles; user-profile regression | Real Discord display timing pending |
| 4 | Proxy On/Off while zapret is Off/busy; MTProto link uses actual port/config | Real loopback listener + GUI busy-flag/Presence checks | Real Telegram connectivity pending |
| 5 | Zapret On/Off while proxy stays running; neither controller stops the other | Independent controller/static check, separate Presence state construction | Elevated winws and independent service run pending |
| 6 | Occupied port, invalid config, permission/startup failure, hung readiness, crash, restart and exit | Real port/crash/restart; injected permission/hung fixtures; owned Job closure | Real policy denial and abrupt parent crash window pending |
| 7 | Close/restart Discord; latest Alt/Proxy returns and timer does not reset | EOF/drop/reconnect and ID-change fixtures | Real Discord restart pending |
| 8 | No Discord setting/toggle/search results in current RU UI or English search terms | Full settings and Ctrl+K GUI checks | Current supported UI covered, no separate localization catalogue |
| 9 | Clean Windows x64, no Python/.NET/MSVC installs, one EXE + portable.flag, offline startup | Embedded resource hashes/native closure/PE manifests | Clean VM/offline execution and portable data-root audit pending |

## Explicit acceptance checklist

- [x] Existing WPF codebase; local upstream copy kept intact; previous EXE preserved.
- [x] Bundled headless proxy runtime, pinned source/dependencies/licenses; offline build path.
- [x] Independent lifecycle, real socket readiness, recoverable errors, bounded UI logs.
- [x] Glass card, configuration editor, restart/link, accessibility and theme/layout fixtures.
- [x] Always-on Presence, Alt + Zapret + Proxy, configurable assets, app-lifetime elapsed.
- [x] All user enable/disable paths and internal Enabled seam removed; no Discord settings UI.
- [x] Automated local IPC coalescing, silent reconnect, no real account/user-data fixtures.
- [ ] Real Telegram connectivity; integrated live Discord artwork/tooltips/timing/button.
- [ ] Clean Windows/offline portability and elevated engine/service/reboot acceptance.
- [ ] Publisher signing, upstream/Microsoft redistribution and complete corresponding-source review.
- [ ] Portal uploads, ordinary GitHub Release with `Z-Aura.exe`, legal-site deployment/recheck.

Z-Aura is **not a VPN**. It does not hide IP, add VPN-style encryption or guarantee
connectivity/anonymity. Proxy use connects to upstream Telegram endpoints and,
if explicitly enabled, third-party CF relays. Public legal/website/video artifacts
were not silently republished; only channel navigation/footer was added to new local
legal-page output, without replacing the approved prior pack. New proxy-data disclosures require review
before distributing this candidate publicly.
