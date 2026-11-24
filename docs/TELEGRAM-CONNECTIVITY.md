# Telegram connectivity diagnosis — 24.11.2026

The user reported that standalone Flowseal worked but Z-Aura did not. After the
first recommendation, the new Z-Aura log still contained only TCP fallbacks and
the stored setting was still `fallbackCfproxy: false`. Standalone stored `cfproxy:
true`. Why the previous GUI change was not saved has not been established; no GUI
save defect is claimed without reproducing it.

With explicit user consent, `scripts/telegram/diagnose_live.py` tested the **same
packaged embedded Python + runner**, without user settings, Telegram account data,
real Discord IPC or engine/service activity. Children used random loopback ports,
temporary secrets and pool=0/no direct DC overrides to isolate fallback routes.
Only the unauthenticated `req_pq_multi` handshake was sent. A positive result
requires a valid `resPQ`, matching random nonce and a bounded response frame.
Fixture processes were stopped; no system-wide process kill was used.

| Route | Result | Probe duration including child startup/cleanup |
|---|---|---|
| DC2, CF disabled | No MTProto response; upstream TCP timed out | 10.368 s |
| DC2, CF enabled | Valid `resPQ`, matching nonce, 100 response bytes | 4.619 s |
| DC5, CF enabled | Valid `resPQ`, matching nonce, 100 response bytes | 4.149 s |

Full events: `artifacts/telegram-live-routes.json`. The live script refuses network
access unless explicitly invoked with `--allow-network`; it is not bundled, not
run by normal startup/build/offline tests. User and temporary secrets are not
included in reports. The current GitHub CF-domain file was also compared read-only:
it matched the supplied local source and the packaged builtin set (20 entries).
No refresh/update downloads were enabled in the application.

After Z-Aura had exited, the user-authorized change was applied to
`%APPDATA%\Z-Aura\settings.json`: **only `telegramProxy.fallbackCfproxy` changed
false → true**. A full semantic comparison confirmed that every other setting,
including the secret, profiles, Presence and ports, matched the backup:
`settings.json.before-cf-diagnostic-20261124-060713.bak` beside the original file.
No EXE, Telegram-client setting or standalone-proxy setting was replaced.

Restart the existing `Z-Aura-Telegram-Channel.exe`, enable Telegram Proxy, and use
**«Подключить Telegram»** to select Z-Aura's actual port/secret. Stop the standalone
listener first if it uses the same port 1443. Its secret may differ from Z-Aura's.

This confirms **limited live Telegram protocol connectivity through the bundled
adapter with CF enabled**, not full Telegram Desktop/account/media acceptance,
WPF/native Job/elevation-path live acceptance, or reliability across every DC/ISP.
Clean-Windows, engine/service/reboot, live Discord and release-review gaps remain.
CF uses third-party relays and is still opt-in in defaults for other users.

Project news: [Telegram · @zaurafork](https://t.me/zaurafork).
