# Z-Aura — archived Tauri prototype

> Historical documentation preserved with the previous source tree. Current portable desktop uses .NET/WPF + native GNU bootstrap; see `README.md` and `docs/DESKTOP-PORTABLE.md` from the repository root. Limitations below describe the previous Tauri prototype, NOT the new portable binary.

Windows GUI-форк **Flowseal/zapret-discord-youtube** на основе локального комплекта `D:\zapret` (версия 1.10.4). Целевой результат — собственное приложение `.exe`, заменяющее bat-интерфейс при сохранении стратегий и ресурсов Flowseal. Browser preview — только инструмент разработки UI.

### Привязка к Flowseal

Встроенные упрощённые примеры заменены **22 настоящими стратегиями** из `general*.bat`: General, ALT–ALT13, EXP, FAKE TLS AUTO и SIMPLE FAKE с вариантами. Конвертер читает аргументы, но не исполняет команды bat. Сохраняются порядок `--new`, повторяющиеся fake-аргументы и ссылки на списки. Пути разрешаются относительно рабочей папки `bin`, как в исходнике.

```powershell
npm.cmd run import:flowseal -- "D:\zapret"
```

Результат — `src/generated/flowseal-profiles.json`; происхождение и SHA-256 исходных стратегий/движка — `upstream/flowseal-manifest.json`. Исходный `D:\zapret` не изменяется. Сейчас выберите в настройках **`D:\zapret\bin\winws.exe`**. Файлы bin/lists пока используются из исходного комплекта, а не встроены в EXE.

Game Filter управляется в **Настройки → Игровой трафик**: выключен / TCP+UDP / только TCP / только UDP; диапазоны задаются отдельно. При запуске подставляются только игровые параметры всех 22 встроенных стратегий. Повторный импорт и пересборка для этого больше не нужны. Пользовательские копии сохраняют собственный argv. По умолчанию TCP+UDP `1024-65535`, как в локальном комплекте; выключенный протокол использует порт 12 согласно логике Flowseal. Файл `utils/game_filter.enabled` не изменяется.

Название продукта и будущего релизного бинарника — **Z-Aura / Z-Aura.exe**. Папка исходного проекта пока остаётся `D:\Opencode Projects\Glassline`. Внутренние `app.glassline.zapret`, `GlasslineZapret` и localStorage-ключи намеренно сохранены для совместимости с ранее созданными данными/службой. Новая служба получает отображаемое имя `Z-Aura Zapret Engine`. Выбранный профиль сохраняется вместе с настройками и перед запросом UAC при запуске/установке службы.

До готового форка остаются перенос переключателей списков/fake-файлов в GUI, упаковка runtime-комплекта, проверка лицензий и нативная Windows-сборка. Поддержка произвольного winws2 — второстепенная возможность, не замена интеграции с Flowseal.

**Состояние:** реализован интерфейс и исходный код нативного backend. Нативная компиляция и системные сценарии пока **не подтверждены**: в текущем окружении отсутствует MSVC `link.exe`. Движок и драйвер найдены в `D:\zapret\bin`, но пока не упакованы в приложение; NSSM не входит в проект. Это не готовый проверенный инсталлятор.

## Быстрый старт

Для preview: Node.js 24+ (эта версия нужна встроенным тестам с TypeScript stripping).

```powershell
cd "D:\Opencode Projects\Glassline"
npm.cmd ci
npm.cmd test
npm.cmd run dev
```

Откройте `http://127.0.0.1:1420`. Browser preview хранит свои профили в отдельном `localStorage`, но **не имитирует** запуск winws, UAC, службу или успешную сетевую проверку.

Для Windows-приложения нужны:

1. Windows 10/11 x64, WebView2 Evergreen Runtime.
2. Rust stable с target `x86_64-pc-windows-msvc`.
3. Visual Studio 2022 Build Tools: **Desktop development with C++**, MSVC x64/x86 и Windows SDK. Один VS Code или .NET SDK недостаточен.
4. Node.js и зависимости проекта.

Запускайте сборку из Developer PowerShell for VS 2022:

```powershell
npm.cmd run tauri -- dev
# Релизный exe без установщика:
npm.cmd run tauri -- build --no-bundle
# NSIS-установщик:
npm.cmd run tauri -- build
```

Иконки уже сгенерированы в `src-tauri/icons`. Исходник — `public/app-icon.svg`.

Полный доверенный комплект движка размещайте в постоянной папке, например:

```text
C:\Tools\Glassline\
  Z-Aura.exe
  portable.flag              # необязательный пустой файл
  tools\nssm.exe             # для службы, внешняя зависимость
  zapret\
    winws.exe                # либо winws2.exe
    WinDivert.dll
    WinDivert64.sys
    cygwin1.dll               # если требуется выбранной сборкой
    ...                      # Lua, hostlists, .bin из того же комплекта
```

В настройках выберите исполняемый файл и сохраните путь. Не переносите папку движка или NSSM после установки службы.

## 1. Выбор стека

**Rust + Tauri 2 + React/TypeScript** выбран из-за точного контроля над кастомным UI: CSS glassmorphism, анимации, собственный заголовок и лёгкая WebView2-оболочка. Rust управляет дочерним процессом и Windows-интеграцией; JavaScript не получает универсальный shell.

| Вариант | Плюсы | Ограничения |
|---|---|---|
| Tauri, выбран | Кастомный дизайн, типизированный IPC, Rust backend, WebView2 вместо Chromium в поставке | MSVC toolchain; отдельное проектирование UAC; системные операции остаются Windows-only |
| WinUI 3 | Нативные Mica/Acrylic, SCM/PInvoke, ConnectedAnimation | Windows App SDK, больше XAML-работы для специфического дизайна |
| WPF | Зрелая экосистема и MVVM, Windows 10 | Acrylic и сложные композиционные эффекты требуют дополнительной интеграции |

Текущий MVP повышает права **всего GUI** через `ShellExecuteW("runas")`. Для production предпочтителен небольшой elevated broker с ограниченным IPC, чтобы WebView оставалась обычным пользовательским процессом.

## 2. Архитектура и взаимодействие

```text
React screens / локальное состояние
     │ typed invoke(command, payload)
     ▼
src/bridge.ts — транспорт Tauri + отдельно ограниченный browser preview
     │
     ▼
Rust commands (src-tauri/src/lib.rs)
     ├─ Core: process ownership, argv validation, UAC, stop/status
     ├─ Data: profiles.json, settings.json, log files
     └─ Integration: Command, Win32 Console API, sc.exe, NSSM, reqwest
     │
     └─ emit(engine-log / engine-status / service-status) → React
```

Границы слоёв логические: Rust-код MVP пока сосредоточен в `lib.rs`, а не разнесён в полноценный workspace. Чистые операции с профилями вынесены в `src/profiles.ts`; типы — в `src/types.ts`. Следующий рефакторинг: `core/process.rs`, `data/repository.rs`, `integration/services.rs`, отдельные React Views.

`Mutex` защищает владение `Child` и сериализует операции движка/службы. Служба управляется через `spawn_blocking`, HTTPS — асинхронно. Reader threads читают stdout/stderr и публикуют события; UI хранит последние 400 строк.

JSON записывается во временный файл и заменяется через `MoveFileExW(REPLACE_EXISTING | WRITE_THROUGH)`, без предварительного удаления оригинала. Обновление GUI не переинициализирует пользовательскую библиотеку; встроенные пресеты хранятся отдельно в коде.

Обычный режим: `%APPDATA%\app.glassline.zapret\` (старый идентификатор сохранён для совместимости). Портативный: `portable-data` рядом с exe, когда существует `portable.flag` или `portable.mode`. Новые логи прямого процесса — `logs/z-aura-<UTC-day>.log`; службы — `service-stdout.log` и `service-stderr.log`. Прежние log-файлы не удаляются.

## 3. Дизайн-система

Реализация: `src/styles.css`, без внешних шрифтов и фоновых сетевых загрузок.

| Токен | Значение |
|---|---|
| Фон | `#F7F5FF`, лавандовые radial-gradient акценты |
| Акцент | `#7C3AED`, `#9467DA` |
| Вторичная поверхность | `#EDE9FE` |
| Основной текст | `#34204F` |
| Светлое стекло | `rgba(255,255,255,.72)` |
| Тёмный фон / стекло | `#161321` / `rgba(39,32,54,.78)` |
| Blur | `blur(30px) saturate(140%)` |
| Радиусы | карточки 20–26px, hero 25px, modal 26px; кнопки 12–14px; поля 12px |
| Тень | `0 12px 32px #49317108`; modal `0 35px 100px #2f124350` |
| Переход экрана | slide + fade, 380ms |
| Easing | `cubic-bezier(.32,.72,0,1)` |
| Нажатие | `scale(.96)`, 220ms |
| Skeleton | shimmer, 1500ms |

- **Кнопка:** градиент или стеклянная поверхность, line-иконка Lucide, focus outline, disabled/busy состояния.
- **Карточка:** прозрачная поверхность, тонкая граница; статус не кодируется только цветом — есть текст.
- **Сайдбар:** backdrop-filter; на узком preview сворачивается в icon rail, названия сохраняются в `aria-label`.
- **Modal:** blur scrim, slide/scale появление, Escape в редакторе, системные предупреждения при первом запуске.
- **Окно:** `decorations:false`, drag region, свои minimise/maximise/close кнопки. Acrylic через Tauri `EffectsBuilder` с CSS-fallback.
- **Доступность:** focus-visible, семантические диалоги и switch, `prefers-reduced-motion`, focus trap редактора с возвратом фокуса на кнопку открытия. Полная accessibility-проверка ещё нужна.

Минимум desktop окна — 1120×720. CSS дополнительно поддерживает более узкий browser preview.

## 4. Ключевой код и технические решения

### Запуск и статус

```rust
// Пользовательский argv не проходит через cmd.exe/PowerShell/bat.
let mut command = Command::new(&executable);
command.args(&args)
    .current_dir(executable.parent().unwrap())
    .stdin(Stdio::null())
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());
let child = command.spawn()?;
let pid = child.id();
// Child хранится в AppState. Reader threads → engine-log.
// try_wait() каждые 550ms → running / stopped / error.
```

UI переключается `stopped → starting → running`; неожиданный ненулевой exit публикует `error`. `running` означает существование процесса, **не подтверждённую работоспособность DPI-стратегии**.

Остановка сначала пытается `AttachConsole(pid)` + `GenerateConsoleCtrlEvent(CTRL_BREAK_EVENT, pid)`, ждёт до 3 секунд и только затем использует `Child::kill()` для собственного PID. Совместимость сигнала с конкретной Cygwin/winws-сборкой нужно проверять. Обычный close пытается этот путь; Alt+F4 имеет fallback принудительного завершения. Полноценный Windows Job Object для cleanup при аварии GUI пока не реализован.

В редакторе одна строка — **один элемент argv**, не команда shell:

```text
--filter-tcp=443
--dpi-desync=multisplit
--dpi-desync-split-pos=1
--hostlist=C:\My Profiles\domains.txt
```

Внешние кавычки в строке пути не нужны: `Command::args` обеспечивает Windows quoting. `--wf-tcp`, `--wf-udp`, `--wf-raw-part`, `--wf-iface` генерируются из полей и заменяют одноимённые аргументы. `--new` сохраняет границы последовательных стратегий.

**winws и winws2 не взаимозаменяемы.** Встроенные стратегии Flowseal 1.10.4 — для winws. GUI блокирует их запуск с winws2; для него нужен пользовательский профиль с совместимыми Lua-скриптами из соответствующей версии движка. GUI пока не анализирует Lua и не переводит стратегии автоматически.

### Windows-служба

Консольный winws нельзя безусловно считать полноценной SCM-службой. MVP использует внешний **NSSM**:

```rust
Command::new(&nssm)
    .args(["install", "GlasslineZapret"])
    .arg(&engine)
    .output()?;
Command::new(&nssm)
    .args(["set", "GlasslineZapret", "AppParameters", &joined_argv])
    .output()?;
Command::new(&nssm)
    .args(["set", "GlasslineZapret", "Start", "SERVICE_AUTO_START"])
    .output()?;
// checked sc.exe start / stop / delete, ожидание состояния SCM
```

Каждый exit code проверяется. Если настройка новой службы не завершилась, происходит попытка отката. Существующая служба не перезаписывается автоматически. Системные `sc.exe`/`tasklist.exe` вызываются из папки, полученной через `GetSystemDirectoryW`, а не случайно из PATH.

NSSM сохраняет рабочую папку, stdout/stderr и restart-on-exit. В UI можно установить автозапуск, стартовать, остановить и удалить **только `GlasslineZapret`**. Чужие службы и драйверные службы WinDivert не удаляются. В текущем MVP live-панель читает прямой дочерний процесс; служебные логи доступны как файлы, live tail для них ещё предстоит добавить.

Портативный режим **не делает службу портативной**: при запуске службы Windows нужен постоянный локальный путь. Для service-бинарников используйте папку с ACL, не разрешающим их замену обычным пользователям. До production-релиза нужна отдельная проверка ACL и staging в защищённую папку.

### HTTP/TLS диагностика

```rust
let client = reqwest::Client::builder()
    .no_proxy()
    .redirect(reqwest::redirect::Policy::none())
    .timeout(Duration::from_secs(8))
    .build()?;
let response = client.get(&url).send().await;
// HTTP <400 → success; >=400 → error;
// is_timeout() → timeout; иначе DNS/TLS/сетевая ошибка.
```

URL проверяется через `reqwest::Url`: HTTPS, порт 443, точный домен или его поддомен, без credentials. Валидация сертификата не отключается. Это обычный TCP/TLS-тест, не тест QUIC и не гарантия обхода; HTTP 403 означает наличие сетевого ответа, но прикладную ошибку.

### Acrylic и переходы

```rust
use tauri::window::{Color, Effect, EffectsBuilder};
window.set_effects(EffectsBuilder::new()
    .effect(Effect::Acrylic)
    .color(Color(247, 245, 255, 180))
    .build())?;
```

```css
.panel {
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(30px) saturate(140%);
  border-radius: 21px;
}
.main-scroll { animation: page-in .38s cubic-bezier(.32,.72,0,1); }
@keyframes page-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
button:active:not(:disabled) { transform: scale(.96); }
```

## Пользовательские сценарии

1. **Первый запуск:** onboarding объясняет WinDivert, UAC и приватность. Пользователь выбирает «Начать» без elevation или явный запрос UAC; Windows перезапускает GUI через `runas`. Затем в настройках выбирает комплект winws.
2. **Пресет → запуск:** выбрать General / ALT / FAKE TLS AUTO / Discord / YouTube / QUIC; сохранить engine path; нажать «Запустить». Если GUI не elevated — подтвердить UAC и после перезапуска повторить действие. Backend проверяет файл, DLL/driver-файлы и внешние процессы, сохраняет argv, запускает напрямую и транслирует логи.
3. **Автозапуск:** остановить прямой процесс, добавить доверенный NSSM, нажать «Настроить». Создаётся automatic-служба для текущего профиля; затем нажать «Запустить» в карточке службы. Перезагрузка Windows не зависит от открытого GUI.
4. **Не работает сайт:** запустить диагностику до/после движка; посмотреть timeout/DNS/TLS/HTTP-результат; проверить stderr и последнюю строку argv; дублировать стратегию, сузить фильтр и повторить. Нет автоматического изменения hosts/DNS/системных настроек.
5. **Свой профиль:** «Профили → Новый профиль»; имя, описание, argv по строкам; вкладка WinDivert для портов и IfIdx; сохранить; выбрать; протестировать. JSON экспортирует только пользовательские профили; импорт проверяет структуру, размер, типы, диапазоны портов и выдаёт новые ID.

## 5. Структура проекта

```text
Glassline/
├─ README.md, NOTICE.md, LICENSE
├─ package.json, package-lock.json
├─ index.html, vite.config.ts, tsconfig.json
├─ public/app-icon.svg
├─ src/
│  ├─ main.tsx                  # React entry
│  ├─ App.tsx                   # экраны, действия, редактор
│  ├─ Onboarding.tsx
│  ├─ bridge.ts                 # native IPC / ограниченный preview
│  ├─ types.ts                  # интерфейсы данных и событий
│  ├─ profiles.ts               # валидация / compile argv / импорт
│  ├─ data.ts                   # встроенные стартовые профили
│  └─ styles.css                # тема, controls, motion, adaptive
├─ tests/profiles.test.mjs
└─ src-tauri/
   ├─ Cargo.toml, Cargo.lock, build.rs
   ├─ tauri.conf.json
   ├─ capabilities/default.json # минимальные IPC/dialog permissions
   ├─ icons/
   └─ src/
      ├─ main.rs                # Windows GUI entry
      └─ lib.rs                 # Core / Data / Integration MVP
```

## 6. MVP: сделано и оставшееся

### Реализовано в исходном коде

- [x] Пять экранов, onboarding, стеклянные панели, собственный titlebar, тёмная тема.
- [x] Прямой `Command::args`, Child ownership, статусы и stdout/stderr события.
- [x] Попытка мягкой остановки с ограниченным kill fallback.
- [x] UAC через системный `runas`, сообщения об отмене.
- [x] Установка/start/stop/delete NSSM-службы с автозапуском и проверкой exit codes.
- [x] Пользовательский CRUD, копирование, JSON import/export и фильтры интерфейса.
- [x] HTTPS/DNS/TLS результаты с elapsed time и timeout.
- [x] Последний argv, portable flag, локальные JSON/log-файлы, без телеметрии.
- [x] Отдельный browser preview, не выдающий системные действия за успешные.

### До полноценного Windows MVP-релиза

- [ ] Собрать Rust/MSVC и проверить EXE/NSIS в Windows VM.
- [ ] Прогнать реальные winws/WinDivert/UAC/NSSM/перезагрузку; проверить Ctrl+Break на выбранной Cygwin-сборке.
- [ ] Зафиксировать совместимые версии winws/winws2 и рабочие стратегии/hostlists/fake blobs.
- [ ] Проверка подписи WinDivert через Windows trust API, проверка BFE и инструкций по кодам ошибок драйвера.
- [ ] Защищённое размещение service-бинарников, ACL validation; подпись приложения.
- [ ] Job Object cleanup при crash GUI, persist launch history, service log tail/rotation.
- [x] Сохранение выбранного профиля при сохранении настроек/запуске и настройка Game Filter без bat.
- [ ] Schema migrations и backup corrupted settings.
- [ ] Вместо только предупреждения о чужом PID — отдельный безопасный диалог управления внешними процессами с повторной проверкой identity.
- [x] Focus trap редактора и восстановление фокуса; подтверждение закрытия активного движка кнопкой заголовка.
- [ ] Полная клавиатурная навигация и accessibility-аудит; подтверждение Alt+F4 на нативном уровне.

### Вторая версия

- Elevated broker вместо полностью elevated WebView.
- Версионированные upstream-адаптеры и Lua strategy studio для winws2.
- Отдельные HTTP/TCP/TLS/QUIC пробы, пользовательские домены, история сравнений.
- Профили по SSID/NLM, список интерфейсов через Windows networking API.
- Tray, корректный shutdown policy, updater с проверкой подписи и backup миграций.

## Ограничения и безопасность

- Требуется **подписанный** WinDivert для поддерживаемой архитектуры. Не отключайте Secure Boot или антивирус ради непроверенного бинарника. Файлы могут оказаться в карантине: проверяйте происхождение и подпись, а не добавляйте автоматические исключения.
- Наличие `WinDivert64.sys` проверяется, **криптографическая проверка подписи пока не реализована**.
- Чужой winws блокирует прямой запуск и запуск службы. Приложение сообщает PID, но не делает широкого `taskkill /IM` и не удаляет чужие службы.
- GUI не меняет firewall, hosts, DNS, TCP timestamps или сетевые драйверные настройки.
- DPI-bypass не является VPN и не добавляет шифрование. Декоративная схема на dashboard не измеряет пакеты или качество обхода.
- Engine/NSSM/.bin/Lua и upstream source не включены. Перед публикацией настоящего форка или общего бинарного комплекта выполните лицензионные условия каждого компонента; см. `NOTICE.md`.
