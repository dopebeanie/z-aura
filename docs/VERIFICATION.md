# Z-Aura — verification record

> Historical React/Tauri verification only. The newer .NET/WPF/native-bootstrap build, current checks and unresolved acceptance criteria are documented in `DESKTOP-PORTABLE.md`; actual desktop reports are under `artifacts/`.

## Passed

- `npm.cmd test`: 15 Node tests, all passed.
- `npm.cmd run build`: TypeScript strict checking and Vite production build passed.
- `cargo fmt --check`: passed.
- Cargo metadata resolves package `z-aura`, library `z_aura_lib` and main binary.
- Tauri configuration sets product name `Z-Aura` and release binary name `Z-Aura`.
- Read-only Flowseal converter processed all 22 local 1.10.4 strategies and verified referenced list/blob files. Source directory `D:\zapret` was not modified.
- Default Game Filter produces the original argv for all 22 strategies.
- Four Game Filter modes change only template slots, preserve static arguments and `--new` boundaries; user profiles are not rewritten.

## Browser UI smoke checks

Browser preview only — none of these checks executed winws, requested real UAC or installed a service.

- Title and visible brand show Z-Aura; strategy selector lists the Flowseal variants.
- Saving TCP port `65536` reports an error and does not persist invalid settings.
- UDP-only with TCP `1200-1300` and UDP `2200,2300` saves and survives reload.
- General argv preview then contains disabled game TCP port `12`, game UDP `2200,2300`, unchanged normal TCP/UDP rules and list references.
- Preview Game Filter restored to default TCP+UDP `1024-65535` after testing.
- Editor initially focuses a dialog control. Shift+Tab wraps to Save; Tab wraps back. Escape closes and restores focus to New Profile. No temporary profile was saved by this test.

## Not verified / blocked

- `cargo check --locked` cannot compile build-script dependencies: MSVC `link.exe` is missing. Rust semantic/type checking for the app is therefore NOT confirmed.
- No Z-Aura EXE or NSIS installer has been produced or run.
- Direct elevated engine launch, Ctrl+Break stop, UAC relaunch, service installation/stop/remove and reboot behavior require Windows-native testing after installing the toolchain.
- Cryptographic trust validation of WinDivert and protected runtime/service packaging remain pending.
- User-list and fake-file controls have not yet been moved into the GUI.
