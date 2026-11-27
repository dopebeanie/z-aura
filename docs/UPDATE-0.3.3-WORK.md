# Z-Aura 0.3.3 — implementation and acceptance matrix

Local candidate, 26 November 2026; final UI correction revision, 27 November 2026.
No commits, pushes, releases, deployment,
Discord Portal changes or Telegram publication are part of this delivery.
The earlier 0.3.2 executable and user data are protected by the 561-file
`artifacts/update-0.3.3-preservation-before.json` baseline.

| Area | Implemented behavior | Evidence / boundary |
| --- | --- | --- |
| Discord avatar | Memory-only retained image, independent 30 s retry, refresh after one hour, request-generation invalidation on account/hash changes | Deterministic lifecycle tests; bounded PNG/CDN tests retained. Live OAuth/CDN availability is not guaranteed. |
| Single instance | Per-user mutex and CurrentUserOnly named pipe restore the original window, including a minimized/tray instance | Private GUID-owned cross-thread mutex/pipe test, existing tray/return GUI checks. Helpers/service/test commands bypass GUI locking. |
| Multiple engines | One Control Center selects original winws, ByeDPI v0.17.3, sing-box v1.14.4 + owned ByeDPI or GoodbyeDPI 0.2.2 | Bounded embedded extraction, exact SHA-256 checks and real `sing-box check` for both generated routing modes. Original 22 strategies retained. |
| Process routing | EXE allowlist is accepted only by sing-box; exact names, bounded list, self-process exclusions and direct default | TCP routed to verified loopback ByeDPI; no unsupported EXE filter is silently broadened to global winws/GoodbyeDPI capture. UDP/QUIC/voice remains direct. Actual elevated TUN routing still needs acceptance on a clean Windows host. |
| Engine lifetime | Bridge must own the exact loopback listener PID and complete a SOCKS5 handshake before TUN starts; coordinated stop, Job Object ownership and generation-scoped expected exits | Listener ownership/config tests; graceful helper tests. No real traffic interception is enabled by test suites. |
| Snapshots | Intent before hosts/DNS/service writes, operation-scoped post-state, selected adapter GUID verification, preflight before rollback, recovery snapshot | Pure DNS/ownership invariants and tests that deny system writes from isolated roots. Real elevated rollback is not exercised on this user's machine. |
| Removed service | Re-register only the exact own service from retained unchanged image/config/runtime hashes, restoring previous running state | Code path validates fixed paths/argv/ownership. This is not a backup of arbitrary drivers or third-party services. |
| Driver/routes | Before/after observations around own engine/service operations; owned engine shutdown handles its TUN lifetime | Foreign routes/drivers are never broadly deleted or restored. An observation is not a Windows system image. |
| Conflict detector | Lists known bypass engines, running services, probable VPN adapters and antivirus presence | Explicit hold confirmation before stopping an individually identified foreign bypass PID. VPN and antivirus are never disabled automatically; presence alone is not proof of interference. |
| Streamer Mode | Header toggle closes identity-bearing dialogs; masks sidebar/avatar/profile, notifications, status PID, sensitive pages, search and personalized RPC | GUI checks confirm no journal table/raw argv/custom profiles remain visible. Local disk logs are not erased. Mode does not provide network anonymity. |
| Changes since last launch | Local history compares measured TLS/latency for matching host and engine context | Does not infer an ISP block or strategy update from missing measurements. No unsolicited probing at launch. |
| Windows startup | Optional current-user task, 10/20/30 s delay, optional tray start; task ownership marker and per-user name | Task XML/path/delay tests. Starts GUI only; no automatic engine/Proxy startup. Reboot/task execution still needs live acceptance. |
| Crash guard | Default warning; optional prepared destination IP block after unexpected owned-engine exit; persistent unique rule intent and explicit recovery | Only own rule is removed after name/group/description/address checks. No zero-leak guarantee, no IP masking; shared-CDN/new-IP limitations are disclosed. GUI-process death cannot guarantee reactive blocking. |
| Network presets | Save selected profile, engine/process allowlist, Proxy state, optional DNS and exact adapter/gateway match; optional WLAN SSID-hash match | Auto-apply is opt-in, after three stable observations and exactly one match. Raw SSID is not saved. No built-in ISP claims. Partial failures attempt independent recovery and surface recovery errors. |
| Strategy Finder | Five strategies × four hosts × two valid-TLS probes plus separate engine-off baseline; explicit profile choice, cancellation and prior-state recovery | Injected runner tests cover counts, ranking, failed strategy cleanup and cancellation. No fabricated throughput/media/voice result. Real ISP strategy benchmarking remains user-triggered. |
| Error help / FAQ | Separate actionable error window, engine-specific FAQ, troubleshooting and local report controls | RU/ENG GUI and translation audit. No recommendation to disable Windows protection. |
| Support ZIP | Bounded redacted logs, allowlisted config, version and command captures; local-only, cancellable and atomic | Real ZIP fixture verifies entries, valid JSON, excluded secrets and no partial output on cancellation. User must inspect arbitrary custom strings before sharing. |
| RPC | Telegram channel remains; profile button after voluntary sign-in; optional measured adapter rates and local badges | Two-button limit, Streamer suppression and original Alt behavior tested. Counters are adapter totals, not per-site/process traffic. No public achievement backend or joinable session is fabricated. |
| UX | Optional session summary, quiet generated 150 ms sound, state tint, restrained 52 px glow, accessible 800 ms hold and 5 s undo | GUI hold tests cover short release, exact-once completion, Escape and ordinary Click refusal. Reduced motion/transparency/high contrast retained. |
| Preservation | Separate build/test/output directories; no reset of existing settings or earlier deliveries | 561/561 baseline files matched at the preservation checkpoint; final delivery repeats the check. |

## Reproduction and evidence

### Final correction revision

The 14-point correction matrix is in `FIXES-0.3.3-UI.md`. Production and
asInvoker counterparts use `-BuildSuffix polish-final`; the native test wrapper
is built explicitly with `--test-as-invoker`. Earlier candidates are retained.

- Production: `artifacts/portable-0.3.3-polish-final/Z-Aura.exe`, 131,552,256 bytes.
- SHA-256: `08156c5673d82bfaf32851306ca35a2aa4d82e94a73a7175e0123af466a3e933`.
- 2051 backend assertions, including native console fixture; 358 GUI PASS records;
  80/80 Node tests; localization audit has no untranslated entries.
- Final GUI evidence: `artifacts/ui-polish-0.3.3-release/`, including checked
  Streamer states at minimum width in RU/ENG and both themes, sound-setting
  persistence, audio-test suppression, visible RPC preview and bounded scrolling.
- Sound generation, volume and control persistence are tested. Actual sound-device
  output and live Discord display are not claimed as verified.
- Read-only driver/route observation timing: 2393 ms → 109 ms; not a benchmark
  of the complete elevated winws startup.
- New local delivery: `C:\Users\Takira\Desktop\Z-Aura-0.3.3-Fix`, with source ZIP,
  hash manifests, screenshots, correction instructions and an unpublished Telegram draft.

### Preservation during final packaging

The previous Desktop 0.3.3 delivery matches all 159 historical hashes. Of the
older 561-file baseline, 557 match; settings, Discord-session storage and two
live-profile logs already differed when work resumed, before final packaging.
Their contents were not reverted or replaced. A fresh hash-only checkpoint covers
720 paths: 716 static files must remain identical; the four live-profile files
are observed separately because the running application can update them.
The Discord-session hash changed again before packaging; it was left untouched.
Historical differences
are recorded in `evidence/polish-0.3.3-preservation-history.json`; the new delivery
does not contain copies of user settings, account tokens or private logs.

`scripts/deliver-polish-0.3.3.ps1` refuses an existing destination.
`scripts/verify-polish-delivery.ps1` checks every delivered inventory entry,
every source ZIP entry against its pinned hash and workspace file, and the
resumed preservation checkpoint. Its final result is also saved under
`artifacts/polish-delivery-0.3.3-verified.json`.

- `scripts/build-update-0.3.3.ps1 -TestOnly -BuildSuffix <unique-id>` creates a
  separate self-contained asInvoker test counterpart. Production omits `-TestOnly`
  and retains administrator manifests in both managed payload and native launcher.
- `--self-test` uses GUID-owned temporary data, loopback fixtures and generated
  config checks. Set `ZAURA_CONSOLE_FIXTURE` to a freshly compiled
  `desktop/Bootstrap/console-fixture.c` to include native Ctrl+Break ownership tests.
- `--ui-smoke` uses an isolated root, fake Discord IPC and no engine/service/system
  writes; screenshots include every Control Center tab in RU/ENG and both themes.
- `node scripts/audit-control-localization.mjs`; `node --test tests/*.test.mjs`.
- Exact final report counts, executable hashes, manifest inspection and native
  wrapper acceptance are recorded in the delivery's evidence folder. Intermediate
  `*-work*` results are retained separately and do not supersede final evidence.

## Unverified live acceptance

Real elevated WinDivert/TUN/service/DNS/hosts/firewall changes, clean Windows,
actual reboot/startup, live Discord OAuth refresh after reboot, real ISP media and
voice connectivity, and downloading/installing a future official update are not
claimed as tested. Previous legal-site delivery remains a separate completed task.
The added engines retain upstream notices/source; public redistribution review is
still required before any remote release. Z-Aura is not a VPN. All features remain
free; donations remain `2202 2085 9236 5168 / СберБанк` with RU «Пожертвования» /
ENG «Donate».
