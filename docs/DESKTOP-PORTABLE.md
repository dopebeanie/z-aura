# Z-Aura 0.3.2 — desktop portable build

Project news and changelog: [Telegram · @zaurafork](https://t.me/zaurafork).

## Current outcome

Native **.NET 10 / WPF + C bootstrap compiled with LLVM-MinGW** implementation, compiled without MSVC. React/Tauri is a preserved legacy prototype, not the shipping runtime. Packet engine is the unchanged embedded Flowseal winws, not a rewritten engine.

Current build output: `artifacts/portable-comfort-0.3.2/Z-Aura.exe`. This is a build candidate, **not a fully accepted release**: clean-machine, elevated driver/service and reboot tests remain outstanding. Never infer those tests from UI screenshots or a successful publish. Latest evidence: [DESKTOP-VERIFICATION.md](DESKTOP-VERIFICATION.md). New changes/security: [COMFORT-0.3.2.md](COMFORT-0.3.2.md); inherited update requirements: [UPDATE-0.3.1.md](UPDATE-0.3.1.md).

**Telegram integration is included in the current candidate.** Intermediate build outputs
were removed during the user-approved cleanup, not silently replaced. See
[TELEGRAM-PROXY.md](TELEGRAM-PROXY.md) for bundled CPython, offline packaging, ownership,
settings and current acceptance evidence. Both runtimes are embedded in the one outer EXE;
Python resources are lazily extracted under the selected data root, not downloaded.

## Toolchain and build

Build machine: Windows x64, .NET SDK 10.0.x with WindowsDesktop SDK, Node 24+ and portable LLVM-MinGW 20261117 msvcrt x64. No MSVC, Rust linker, Qt, WebView2, NSSM or external zip utility is required. First restore can download .NET runtime packs on the **developer's** machine; end users do not download zapret or .NET.

```powershell
cd "D:\Opencode Projects\Glassline"
# Optional, when updating upstream strategies/resources:
npm.cmd run import:flowseal -- "D:\zapret"
node scripts/pack-runtime.mjs "D:\zapret"

# One-file publish and artifact/hash check:
node scripts/build-portable.mjs --output-dir artifacts/portable-comfort-0.3.2
node scripts/verify-portable.mjs --artifact-dir artifacts/portable-comfort-0.3.2

# Equivalent two-step build:
dotnet publish desktop/Z-Aura/Z-Aura.csproj -c Release -r win-x64 --no-restore --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o artifacts/managed
node scripts/build-bootstrap.mjs --output-dir artifacts/portable-comfort-0.3.2
```

The runtime package is already in the desktop source tree. A developer can publish it without the original `D:\zapret`; the original directory is needed only for regenerating/updating upstream payloads. Self-contained .NET 10/WPF is preferable here to Tauri GNU because it is installed on this build machine and does not add a WebView runtime to the clean-machine requirements. Trimming is deliberately disabled for WPF reflection/XAML compatibility. ReadyToRun is disabled and both payload ZIP and single-file compression are enabled. Do **not** use UPX: the saved size is not worth worsening antivirus heuristics. Publisher signing needs an owned code-signing certificate, not an invented certificate or disabling SmartScreen.

## Embedded resources and extraction

### Native bootstrap build dependency

Portable LLVM-MinGW is a **developer-only** dependency. It was downloaded and its official GitHub asset digest checked; it is not embedded or shipped to end users. The `msvcrt` target imports the Windows system C library, not a VC++ redistributable.

```powershell
New-Item -ItemType Directory -Force tools
Invoke-WebRequest https://github.com/mstorsjo/llvm-mingw/releases/download/20261117/llvm-mingw-20261117-msvcrt-x86_64.zip -OutFile tools/llvm-mingw-20261117-msvcrt-x86_64.zip
if ((Get-FileHash tools/llvm-mingw-20261117-msvcrt-x86_64.zip).Hash.ToLowerInvariant() -ne '17db10bd2c0bcbf55e5e4382475190165d0fc90dfe52ca165a51f1dfb1ca19c8') { throw 'Compiler archive hash mismatch' }
Expand-Archive tools/llvm-mingw-20261117-msvcrt-x86_64.zip -DestinationPath tools
```

`scripts/build-bootstrap.mjs` runs `x86_64-w64-mingw32-windres.exe` to embed EXE/icon/UAC manifest, then `x86_64-w64-mingw32-clang.exe -O2 -static -mwindows -municode -lbcrypt -lshell32 -lole32 -luuid -Wl,--strip-all`. The launcher uses only Windows system DLLs.

### Key production code

From `desktop/Bootstrap/launcher.c`, **before** creating the managed process:

```c
if (!SetEnvironmentVariableW(L"DOTNET_BUNDLE_EXTRACT_BASE_DIR", framework) ||
    !SetEnvironmentVariableW(L"ZAURA_LAUNCHER_EXE", origin))
    return fail(L"Cannot set bundle environment");
```

From `Core/Storage.cs`, atomic writes on the same volume:

```csharp
using (var stream = new FileStream(temp, FileMode.CreateNew, FileAccess.Write, FileShare.None)) {
    stream.Write(bytes);
    stream.Flush(true);
}
File.Move(temp, path, true);
```

From `Core/RuntimePackage.cs`, builtins are not trusted just because they were extracted:

```csharp
if (bytes.LongLength != file.Size || Storage.Hash(bytes) != file.Sha256)
    throw new IOException("Хэш встроенного ресурса не совпадает: " + file.Path);
Storage.AtomicWrite(path, bytes);
```

From `Core/EngineController.cs`, no shell string concatenation:

```csharp
var start = new ProcessStartInfo(engine) {
    UseShellExecute = false,
    WorkingDirectory = Path.GetDirectoryName(engine)!,
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    WindowStyle = ProcessWindowStyle.Hidden,
    CreateNoWindow = false
};
foreach (var arg in args) start.ArgumentList.Add(arg);
```

From `Core/StrategyCompiler.cs`, resource replacement is scoped to the chosen strategy block:

```csharp
blocks[binding.Segment].RemoveAll(arg => arg.StartsWith(binding.Option + "="));
blocks[binding.Segment].Add(binding.Option + "=" + Path.GetRelativePath(bin, destination));
```

```text
desktop/Z-Aura/
  Z-Aura.csproj              # self-contained, single-file, compressed
  app.manifest              # requireAdministrator, PerMonitorV2
  assets/
    app.ico
    fonts/                  # bundled static Inter 4.1 faces + OFL license
    runtime.manifest.json   # version, path, length, SHA-256
    runtime.zip             # EmbeddedResource ZAura.runtime.zip
    payload/                # source payload used to produce ZIP
      bin/
        winws.exe
        cygwin1.dll
        WinDivert.dll
        WinDivert64.sys
        *.bin               # authentic Flowseal file names, no fake aliases
      lists/*.txt
      presets/flowseal.json
      presets/provenance.json
  Core/
    Models.cs Storage.cs Native.cs RuntimePackage.cs
    Validation.cs AssetRepository.cs StrategyCompiler.cs
    EngineController.cs WindowsService.cs LogReader.cs SelfTests.cs
  UI/
    Theme.xaml Ui.cs MainWindow.cs UiSmoke.cs
    Motion.cs Icons.cs GlassBorder.cs Welcome.cs
    ProfilePages.cs AssetPages.cs DiagnosticPages.cs
  Program.cs
desktop/Bootstrap/
  launcher.c                 # pure C, OS-only imports, pre-.NET cache routing
  test.manifest              # test-only, never a production UAC manifest
  generated.rc              # generated RCDATA/icon/UAC resource
  payload-hash.h            # generated compile-time SHA-256
```

No renamed dummy `fake_http.bin` is fabricated when upstream does not contain that payload. All fake resources actually referenced by the 22 bundled profiles are included. Icons, font, Russian UI strings and presets are local; there are no startup font/network/CDN requests. Current payload: 39 manifest entries, roughly 1.49 MB compressed.

Data roots:

```text
With portable.flag next to EXE:   <exe directory>/data/
Without portable.flag:           %APPDATA%/Z-Aura/
  settings.json profiles.json assets.json
  lists/<asset id>.txt
  fake/<asset id>.bin
  logs/z-aura-YYYY-MM-DD.log
  cache/
  runtime/
    bin/{winws,driver,dlls,fakes}
    bin/custom/{materialized user bindings}
    lists/*.txt
    presets/*.json
    runtime.manifest.json
```

**Strict first-run cache portability:** the C launcher reads `portable.flag` before any .NET code runs, selects the root, validates/extracts the embedded WPF EXE under `data/cache/app/<SHA-256>/Z-Aura.exe`, sets `DOTNET_BUNDLE_EXTRACT_BASE_DIR=data/cache/framework`, then starts it. Managed `Storage.Exe` uses `ZAURA_LAUNCHER_EXE` to find the outer EXE/flag instead of confusing its cache path for the portable root. Both framework and application cache therefore stay in the chosen data root. This was exercised with separate asInvoker test fixtures; production still requires elevation. Persistent caches are reused; loaded framework DLLs are never forcibly deleted.

Each startup uses a per-root named mutex, validates path traversal/junctions, checks file length and SHA-256, restores missing or modified builtins from ZIP, writes with `FileMode.CreateNew` + flush + same-directory rename, validates the extracted hash and checks the driver with `WinVerifyTrust` in cache-only offline mode. ZIP paths normalize both Windows backslashes and ZIP forward slashes. A progress stream reports Проверка → Распаковка → Валидация → Готово.

The engine runs directly via `ProcessStartInfo.ArgumentList`, no shell/bat. Working directory is `runtime/bin`, retaining upstream `../lists/` semantics. User bindings are copied into `bin/custom` and referenced by relative paths. Stdout/stderr are drained independently and streamed into UI + daily files. Shutdown attempts Ctrl+Break, then kills only the owned process tree after 3 seconds; a kill-on-close Job Object protects normal crash cleanup (the short creation/assignment race still needs a native integration audit).

## GUI flows

- **Lists:** Hostlist / IPset / Exclude tabs; select a builtin or create a user list; search and filter valid/invalid/duplicate rows; click headers to sort; add/edit/delete selected rows; merge `.txt` or JSON string-array imports; optionally deduplicate; save/export. Invalid domains/CIDR block save. Builtins save as user copies. Deleted catalog entries have Undo; file bytes are retained for Undo, not destroyed blindly.
- **Fakes:** browse builtins/user entries, size/hash/first 32 bytes; choose TLS/QUIC/HTTP/RAW, import file or drop it; validate size and protocol header; bind to a chosen profile/block/option. RAW is intentionally marked as arbitrary, not “verified TLS”. Restore builtins rechecks/restores the entire embedded runtime and preserves user assets.
- **Binding:** choose a profile, argument and `--new` block. Builtin strategies copy to user profiles. Only the selected option in the selected block is replaced, avoiding global corruption of Flowseal strategy segments. Changes require an explicit engine restart/service reinstall.
- **Profiles:** user CRUD, frozen duplicates, JSON import/export, argv/WinDivert editing and reference summary. Missing catalog bindings block compile and can be removed via explicit autofix. Raw missing file references block validation but are **not** silently replaced by guessed resources.
- **Diagnostics:** user-triggered HTTPS/TLS requests, response status/time/history sparkline and repeat. No automatic diagnostics traffic. HTTPS success is not a guarantee of QUIC/DPI bypass or VPN protection.
- **Appearance:** light/dark, reduced motion, reduced transparency, high contrast. Transparent rounded shell, embedded Inter, original vector icons and custom control/file-dialog templates; Welcome gates the real runtime check. Ctrl+K has navigation/profile startup/list search. Tray popover has status, toggle, profile startup shortcuts and exit. Explicit profile startup stops the owned engine first, then starts the selected strategy. See [UI redesign](UI-REDESIGN.md) for the current components and full source export.

## Service architecture

The same EXE contains a real SCM dispatcher (`StartServiceCtrlDispatcher`, status updates, stop/shutdown handler) activated by `--service`. This fixes the prior dependence on NSSM; the console winws is **not** directly registered as if it were a service.

Installation copies the **managed single-file service-host**, builtins and materialized bindings to `%ProgramData%/Z-Aura/Service`, disables inherited ACLs, grants full access only to SYSTEM/Administrators using SID-based `icacls`, writes config/custom-file hashes, registers `ZAuraZapret` as Automatic and starts it. The service `Environment` REG_MULTI_SZ redirects `DOTNET_BUNDLE_EXTRACT_BASE_DIR` to its permanent protected cache before apphost startup. SCM must directly launch the process with `StartServiceCtrlDispatcher`, not a spawning launcher. Removal stops/deletes only this service; persistent files are retained to avoid loaded-file/driver races. Startup rechecks builtins/driver trust/custom-file hashes. These operations are implemented but not end-to-end tested. Service logs are polled every 2 seconds. Installation has progress/cancel/rollback.

The old Tauri service ID `GlasslineZapret` is not overwritten or silently removed. A running legacy service is a possible conflict and must be stopped explicitly. Legacy Tauri/localStorage data is not silently migrated; JSON profile imports are available. Import binding IDs are not portable between unrelated user libraries, so missing references require rebinding/autofix.

## Design tokens and limitations

Current tokens: ink `#292337`, muted `#797287`, accent `#7C3AED`; dark ink `#F3ECFF`, surface `#292132`. Window/card/button radii 28/22/13 DIP. Glass samples a shared frozen bitmap of soft ambient gradients, rebuilt on theme/size changes, then adds tinted surfaces and light strokes. Live VisualBrush/blur and subtree shader shadows were removed to reduce animation cost. HWND Acrylic is deliberately disabled to avoid square window backgrounds. This is **not** live desktop/per-sibling CSS backdrop blur; WPF does not provide `backdrop-filter` for arbitrary child cards.

Buttons have subtle eased hover/pressed states and border-based focus/disabled feedback; dropdowns, checkbox marks, switches, page/tab transitions and custom modal openings use bounded WPF animation clocks. Retargets preserve the displayed position, completed clocks are removed, page refresh does not replay enter, and nested stagger was removed. Modals cycle keyboard navigation and support Escape; errors/confirmations/file pickers do not use OS widgets. Runtime loading is confined to Welcome and hidden on completion/error. Toast shows success/error + Undo. Reduced motion immediately completes active clocks and suppresses new motion. Large-list validation runs in the background and hidden library tabs load on demand. True icon morphing, complete skeleton/empty-state set and comprehensive accessibility matrix remain in progress. Theme checks confirm rendering, not WCAG certification.

## Verification

```powershell
# Managed test runner does not elevate or start networking/driver/service:
$env:ZAURA_TEST_REPORT = "$PWD\artifacts\self-test.txt"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --self-test

# Native WPF page rendering, in isolated temporary application data:
$env:ZAURA_UI_REPORT = "$PWD\artifacts\ui-smoke"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --ui-smoke
```

Self-tests verify all embedded/extracted file hashes, real offline WinDivert trust, tamper repair, all preset argv/game-mode combinations, custom list/fake bindings, dedupe, deleted-binding failure, Undo, invalid inputs and portable/AppData root selection. UI smoke produces 35 PNGs (7 screens × 5 appearance modes). Neither test executes winws or installs a service.

GUI smoke additionally exercises nine actual routed-button/modal workflows in its isolated data root: invalid domain save rejection; domain add/delete/TXT persistence; builtin profile copy and hostlist binding; hostlist argv; fake hash/hex display; fake modal binding/argv; profile editor save/selection; profile deletion; Undo. File-picker and OS drag-drop interactions are still not end-to-end automated. Protocol-incompatible TCP/UDP fake bindings are rejected by the compiler; broken/null JSON is backed up before default recovery.

The separate unprivileged native bootstrap test also extracted the actual self-contained WPF payload, started its .NET apphost with `--packaging-test`, and recorded `portable=true`, outer EXE identity, managed process path, argument forwarding and framework cache under `./data/cache/framework`. Production launcher and payload retain `requireAdministrator`; the test fixtures are isolated and are not distributable artifacts.

## Definition of Done

| Requirement | Status |
|---|---|
| One self-contained EXE built without MSVC, bundled engine/resources | **Done (publish/artifact check)** |
| Clean Windows 10/11, offline, no redistributables | **In progress: VM/clean host test required** |
| Actual extraction, atomic restore, progress, hashes, driver trust | **Done; tested on current host** |
| Domain/IP CRUD, import/export/merge, profile binding and correct argv | **Implemented; basic GUI/argv passed; picker import/merge E2E pending** |
| Custom fake import/drop/metadata/binding and correct argv | **Implemented; metadata/binding GUI + backend import passed; picker/drop E2E pending** |
| Full phase C visual/state/accessibility requirements | **In progress; only page/theme render checks complete** |
| portable.flag application data / AppData, including framework cache | **Done in code; native + managed bootstrap test passed** |
| Elevation, real winws/WinDivert, foreign conflict and soft stop | **Implemented; elevated integration tests pending** |
| Real service lifecycle/logs/reboot | **Implemented; integration/reboot tests pending** |
| AV quarantine, denied ACLs, damaged resources | **Hash tamper tested; AV/ACL scenarios pending** |
| Publisher signing / SmartScreen reputation | **Deferred: owned signing certificate unavailable** |
| Upstream redistribution/license review | **Open release blocker** |

## Risks

- **SmartScreen/AV:** EXE/winws unsigned; driver retains original verified signature. UI warns honestly. Do not generate a false trust claim, auto-allow exclusion or disable security.
- **Hash integrity:** validates against compile-time embedded manifest; an attacker replacing the entire unsigned EXE can replace its manifest too. Publisher signing is still required for authenticated distribution.
- **Trust offline:** a clean Windows trust store may lack a necessary cached certificate. This must be tested; failure is reported rather than bypassed.
- **Service privileges:** persistent service files have restricted ACLs, no user-controlled install path, no reliance on removable media. Administrator is powerful; imported strategy arguments are untrusted and need review.
- **Portability:** protected folders can reject `./data`; UAC using different credentials changes AppData owner/location. Legacy libraries need explicit export/import. Native launcher fixes cache routing; old version-hash caches are not pruned automatically while other instances might use them.
- **Licensing:** packaging locally does not grant redistribution rights. Flowseal, zapret, WinDivert, Cygwin and font licenses must be audited/provided before public distribution. No public release/push has been performed.
- **Crash/lifecycle:** Job Object provides owned-process cleanup, not a guarantee that a driver has unloaded or that a separate service stopped. Never delete persistent driver files on GUI exit.
