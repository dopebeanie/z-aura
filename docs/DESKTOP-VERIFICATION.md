# Z-Aura — current candidate verification

Updated 2026-11-24. Current build: **0.3.1 / 0.3.1.0**, application updates, optional support,
Discord Return/referrer fix and keyboard/mouse focus cues. This is a local test candidate,
not a published or fully accepted release. The retained 0.3.0 candidate was not overwritten.

## Production artifact

- `artifacts/portable-update-0.3.1/Z-Aura.exe`
- **96,348,672 bytes / 91.88525390625 MiB**
- SHA-256: `8c1cfe9b49d0d38e53b14048e6e5330a2064ad4329fb1a509691ad78c936fdd4`
- Native and embedded managed payload: x64, production `requireAdministrator` manifests,
  version **0.3.1.0**, company **@dopebeanie / TC Studio**.
- Native imports: Windows system DLLs only. Metadata/hash is not a publisher signature.
- PE report: `artifacts/portable-update-0.3.1-verification.json`.

The current managed payload in `artifacts/managed` is retained for PE verification;
it is not an additional end-user download. Rebuild it with the normal portable-build command.

## Passed for this build

| Check | Result / scope |
| :--- | :--- |
| Managed Release | 0 warnings / 0 errors. |
| Backend | **1,700 assertions**: prior OAuth/avatar/callback/console fixtures plus release/version parsing, URL/hash/size rejection, HTTP errors, cancellation, atomic replacement/backup and restart-failure rollback on disposable files. |
| GUI | **273 PASS records**: prior regressions plus update/About idle state, no live GitHub in fixtures, exact RU/ENG donation button at normal/minimum sizes, localized donation dialogs and focus-cue state. |
| Browser return | Actual Chromium 152: reproduced `Origin: null`/400 with the old HTML meta; fixed meta + document header send the exact local Origin, receive 303, and render the acknowledgement. Separate loopback HTTP/WPF fixture restores the existing hidden/minimized window without changing page, Presence, account or engine. No live Discord code/token. |
| Self-contained fixture | Separate **asInvoker** managed test payload passed **1,700 assertions** with invalid DOTNET_ROOT. Not production native-launcher or clean-Windows acceptance. |
| Node | **64 tests**, including release policy, donations, HTML meta/header regression, README/gallery/post and retained runtime/dependency tests. |
| Localization | Roslyn inventory **678 fragments**, full exact coverage; English values contain no Cyrillic. Callback page RU/ENG checked separately. |
| Telegram bundle | 432 resources; dependency closure **32 x64 PE files**, all non-system imports bundled. No runtime download. |
| Visual evidence | **16 fresh README screenshots**: all ten prior gallery subjects plus update cards RU/ENG, donation dialogs RU/ENG, appearance and actual browser return page. Actual WPF/browser captures, not generated mock screenshots. |

## Kept evidence

- `artifacts/update-0.3.1-self-test.txt`
- `artifacts/update-0.3.1-packaged-self-test.txt`
- `artifacts/update-0.3.1-final-ui-smoke/report.txt` and screenshots
- `artifacts/browser-return-0.3.1-fixed/browser-evidence.json` and `result.json`
- `artifacts/update-0.3.1-node-test.txt`
- `artifacts/update-0.3.1-gallery.json`
- `artifacts/telegram-dependency-verification.json`
- `artifacts/comfort-localization-current.json` (current inventory; historical filename)
- `artifacts/update-0.3.1-preservation-before.json` and `update-0.3.1-preservation-after.json`
- `artifacts/cleanup-report.json` (historical intentional cleanup)

The previous 13-file preservation report describes the state *before historical cleanup*;
do not rerun its deleted-EXE entries as a current invariant. This build records its own baseline
for existing settings/user data, hosts, original Desktop EXE, retained 0.3.0 EXE and runtime inputs.

Two existing environment-sensitive fixtures needed a retry: a dropdown lost its open state
during the earlier label-only GUI run; the first packaged console fixture did not report READY.
Unchanged retries passed; no assertions were removed. The final GUI run passed on its first run.

## Still not claimed

- Live OAuth consent, owner Portal configuration and a second real Discord account.
- Real next-version GitHub download/native replacement, early-crash health/rollback and
  production updater UAC. Atomic file swap/launch-failure rollback were disposable-file fixtures.
- Real Discord Presence artwork/timing/buttons, Telegram account/media/DC connectivity.
- User's exact elevated winws Stop/exit scenario; driver activation/unload.
- Real ISP/YouTube playback and QUIC behavior.
- Production UAC/security software, real hosts apply/rollback/DNS flush.
- Service installation/start/stop/removal/reboot and clean Windows/offline acceptance.
- Mixed-DPI overlay behavior and a comprehensive accessibility audit.
- Publisher signing and third-party redistribution/corresponding-source compliance.

No build/package step stops a user process, changes a service, edits hosts or real user settings,
publishes a GitHub release/Telegram post, deploys the site or changes Discord Portal.
See [UPDATE-0.3.1.md](UPDATE-0.3.1.md) and [COMFORT-UPDATE.md](COMFORT-UPDATE.md).
