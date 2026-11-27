# Third-party components

Z-Aura's original GUI and integration code are licensed under MIT.
This does **not** relicense zapret, WinDivert, Cygwin, any upstream strategy or external binary.

- zapret: https://github.com/bol-van/zapret
- zapret2: https://github.com/bol-van/zapret2
- Windows bundles: https://github.com/bol-van/zapret-win-bundle
- WinDivert: https://reqrypt.org/windivert.html
- NSSM: https://nssm.cc/
  (legacy Tauri prototype only; the new desktop binary does not use or embed NSSM)
- Flowseal strategies (converted argv): https://github.com/Flowseal/zapret-discord-youtube
- .NET / WPF: https://github.com/dotnet/runtime and https://github.com/dotnet/wpf
- Atkinson Hyperlegible font: https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegible
  Legacy source asset (not the current UI font), SIL Open Font License under desktop/Z-Aura/assets/fonts/OFL.txt.
- Inter 4.1: https://github.com/rsms/inter/releases/tag/v4.1
  SIL Open Font License under desktop/Z-Aura/assets/fonts/Inter-OFL.txt; static Regular/Medium/SemiBold/Bold TTFs embedded in the WPF EXE. Regular is also embedded in the native launcher's custom fatal-error UI.
- LLVM-MinGW: https://github.com/mstorsjo/llvm-mingw (developer-only compiler, not shipped)
- 0.3.3 optional engines: ByeDPI v0.17.3 (`hufrea/byedpi`), sing-box v1.14.4
  (`SagerNet/sing-box`) and GoodbyeDPI 0.2.2 (`ValdikSS/GoodbyeDPI`). Unmodified
  upstream binaries, exact tagged source ZIPs and shipped notices are retained in
  `desktop/Z-Aura/assets/engines`; the embedded `engines.zip` carries runtime files,
  matching source archives and provenance. These components are NOT relicensed under
  Z-Aura's MIT license. Version/hash origins are in the vendor `manifest.json`.
  ByeDPI/sing-box archive digests matched release metadata; GoodbyeDPI's digest is a
  local integrity pin, not an upstream signature or independently published checksum.
  sing-box's pinned sing-tun dependency embeds its Wintun DLL (see the exact
  `040db71fcd33196f1d15708b91eb61e9dc6ab8dd` dependency source); no runtime Wintun download
  has been added. GPL/dependency redistribution review remains a public-release gate.
- Flowseal tg-ws-proxy 1.12.0: https://github.com/Flowseal/tg-ws-proxy, MIT.
  Vendored source and LICENSE under `upstream/telegram/source`; the EXE embeds source/LICENSE
  and the Python core. Integrated `config.py` disables remote CF-domain refresh; the Desktop
  source directory is not modified. The adapter and notice are in `scripts/telegram` and the ZIP.
- CPython 3.13.17 Windows x64 embedded distribution: https://www.python.org/,
  PSF license and bundled component notices retained as runtime `LICENSE.txt`.
- httpx/httpcore/anyio/idna/certifi/h2/hpack/hyperframe/cryptography/cffi/pycparser:
  binary wheels pinned by SHA-256 in `upstream/telegram/vendor-lock.json`;
  licenses retained under `Lib/*dist-info` (including cryptography's bundled OpenSSL notices).
  Runtime dependency closure is recorded in `artifacts/telegram-dependency-verification.json`.
- CPython's bundled `vcruntime140*.dll`: prebuilt runtime DLLs, not the MSVC compiler.
  No installed VC redistributable is requested; publisher must still review Microsoft
  redistribution rights/notices before distributing the combined executable.

The new desktop payload embeds the user's local winws/Cygwin/WinDivert,
fake TLS/QUIC blobs, hostlists and presets. No NSSM or upstream source tree
is embedded for the packet engine. Telegram's Python source is embedded separately.
`src/generated/flowseal-profiles.json` contains
strategies converted from the user's local Flowseal 1.10.4 bundle. Source
hashes and provenance are recorded in `upstream/flowseal-manifest.json`.
These upstream-derived configurations are NOT relicensed by the MIT license
for Z-Aura's original code. Confirm upstream redistribution terms before
publishing or distributing a combined fork.

Before shipping a combined distribution, pin upstream versions and hashes,
review each component's license, include required notices and corresponding
source, and verify the signed driver. A source-level fork of bol-van/zapret
must retain upstream's applicable license. This project targets a GUI fork
of the Flowseal distribution; upstream packet-processing code has not been
modified. Local runtime packaging is implemented; upstream license review,
corresponding source obligations and notices remain a public-release blocker.
