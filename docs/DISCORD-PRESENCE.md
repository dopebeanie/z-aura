# Discord Rich Presence — рабочий WPF-продукт Z-Aura

Новости и changelog: [Telegram · @zaurafork](https://t.me/zaurafork).

## Область и архитектура

По решению пользователя интеграция выполнена в **WPF/.NET 10**, не в архивном Tauri-прототипе. `discord-rich-presence`/`filthy-rich`, `Cargo.toml`, Tauri-команды и `presence://*` здесь не используются: они не добавили бы функцию в рабочий EXE. Текущий self-contained продукт не требует установленного .NET, WebView2, MSVC, Discord SDK DLL или скачивания ресурсов при запуске. Native bootstrap по-прежнему собирается LLVM-MinGW.

`Core/DiscordPresence.cs` содержит конфигурацию, `AltMode`, построитель activity, фоновой worker и Windows IPC транспорт. Используется только стандартная библиотека .NET: `NamedPipeClientStream`, `System.Text.Json`, `Channel`. Новых NuGet-зависимостей нет.

GUI передаёт неизменяемый snapshot при запуске, каждом `Save()` (включая выбор в Overview, Profiles, редакторе, tray/палитре, привязке ресурса и удаление активного профиля) и событии состояния собственного движка. UI не выполняет IPC и не ждёт синхронно фоновые операции. Состояние установленной службы не выдаётся за состояние GUI-движка; выбранный профиль может отличаться от фактически запущенной ранее стратегии.

Worker сканирует `discord-ipc-0..9` с таймаутом 40 мс на endpoint, выполняет handshake `v=1`, ждёт `READY` и проверяет ACK `SET_ACTIVITY` по nonce. Чтение постоянно отслеживает EOF/разрыв даже без переключений. PONG имеет отдельную ограниченную очередь и не блокирует reader; все записи сериализованы. Фреймы little-endian, максимум 64 KiB, JSON depth 32, очередь ответов 64, очередь PING 16. Переполнение/некорректный ответ приводит к безопасному отключению.

После ошибки: backoff **1 / 2 / 4 / 8 / 16 / 30… секунд**; сброс только после успешной публикации, не просто READY. При возврате Discord отправляется актуальный snapshot. Максимальная задержка восстановления — около 30.4 секунды плюс handshake; она не относится к требованию ≤200 мс для переключения при здоровом IPC.

Фиксированный throttle **130 мс**, проверка каждые **20 мс**. Быстрые изменения Alt/Proxy не создают очередь старых snapshots; непрерывный поток не обнуляет debounce и не вызывает голодание публикации. Локальные fixture-проверки измеряют ≤200 мс, но round-trip/ограничения самого Discord и его UI не гарантируются без live-проверки.

Timestamp — Unix seconds, фиксируется при создании worker: включает время до запуска Discord и сохраняется на смене Alt, Proxy, Application ID и переподключении. Сброс — только полный перезапуск приложения. При завершении отменяется in-flight IPC; best-effort `SET_ACTIVITY(activity:null)` имеет 500-мс предел, затем закрывается pipe и ожидаются фоновые задачи. Свернуть окно в tray — не завершить приложение.

## Конфигурация и GUI

- Presence **включена всегда, пока работает Z-Aura**. Настройки включения/выключения нет. Старое JSON-поле `enabled:false` игнорируется, при сохранении больше не записывается. Некорректный ID или отсутствие desktop Discord дают нейтральный статус, а не возможность выключить функцию.
- Application ID `1573957957576556685` задан в **`desktop/Z-Aura/assets/discord-presence.defaults.json`**, а не в C#.
- JSON встроен в EXE и используется для новых/старых settings без секции Presence. После первого сохранения секция хранится в `settings.json`; обновление defaults не затирает пользовательскую конфигурацию.
- Приоритет ID: `ZAURA_DISCORD_APPLICATION_ID` → `settings.discordPresence.applicationId` → встроенный default для отсутствующей секции. Пустое/некорректное environment override не вызывает скрытого отката к другому ID, а оставляет нейтральный unavailable.
- ID — публичный идентификатор, не Bot Token и не Client Secret; никакие секреты не нужны.
- **Весь Discord settings card удалён**, вместе с `SavePresence` и внутренним `Enabled` lifecycle seam; отдельного каталога локализаций у WPF нет. Ctrl+K не предлагает Discord настройки. Сохраняемые ID/URL/assets остаются в существующем JSON и не сбрасываются.
- Sidebar отображает connecting/connected/not-running/unavailable/disconnected; connected выделен акцентным цветом. `stopped` появляется только при завершении приложения.
- WPF события: `DiscordPresence.StatusChanged(PresenceStatus)` и `Error(string)`. Ошибки идут в `logs/presence-YYYY-MM-DD.log` с debug/warn; modal/toast Presence отсутствует.
- Portable: `portable.flag` рядом с EXE → `./data/settings.json`; иначе сохраняется прежний `%APPDATA%\Z-Aura/settings.json`. Presence не вводит отдельного AppData-кэша. Для полного исключения AppData включите существующий portable-режим до запуска, не меняйте глобальную семантику хранения старых данных.

Пример изменения секции существующего `settings.json` при закрытом Z-Aura (не заменяйте остальные поля файла):

```json
{
  "discordPresence": {
    "applicationId": "1573957957576556685",
    "myAltUrl": "https://example.com/my-alt",
    "proxyOnImageKey": "proxy_on",
    "proxyOffImageKey": "proxy_off",
    "availableAssetKeys": ["zaura_logo", "alt_general", "proxy_on", "proxy_off", "alt_2", "alt_10", "alt_99"],
    "modes": {
      "flowseal-general": { "label": "General", "smallImageKey": "alt_general", "largeImageKey": "zaura_logo" },
      "flowseal-general-alt2": { "label": "ALT2", "smallImageKey": "alt_2", "largeImageKey": "zaura_logo" },
      "flowseal-general-alt10": { "label": "ALT10", "smallImageKey": "alt_10", "largeImageKey": "zaura_logo" },
      "<реальный-id-вашего-профиля>": { "label": "ALT99", "smallImageKey": "alt_99", "largeImageKey": "zaura_logo" }
    }
  }
}
```

Встроенный конфиг покрывает все **22 настоящих режима**, не выдуманный фиксированный enum. Для неизвестного ID автоматически используется имя выбранного профиля и общий asset. Добавление `modes[profileId]` не требует изменения IPC-кода. Редактирование JSON применяется после перезапуска.

Activity: `type=0`, `details="Alt: <label> · Zapret: On/Off"`, `state="Proxy: On/Off"`; large asset `zaura_logo`; единственный small asset предпочитает подтверждённый `proxy_on`/`proxy_off`, иначе прежний Alt/logo fallback. Tooltip `Proxy: On/Off · Alt: <label>`. Поля ≤128 UTF-16 units; label до 103, чтобы сохранить Zapret suffix. URL — HTTP(S), ≤512, без controls/credentials. Кнопка «Telegram-канал» ведёт на `https://t.me/zaurafork`; безопасная необязательная «Мой Alt» сохраняется первой, если URL валиден. Максимум две кнопки, в пределах лимита Discord. Канал не открывается автоматически и не требует токена.

## Discord Developer Portal: checklist

**URL полей Portal:** для текущего Rich Presence не нужны Interactions Endpoint или Linked Roles Verification URL. Terms/Privacy готовятся как отдельные публичные документы; сайт-черновик и требования к публикации описаны в [DISCORD-PORTAL-URLS.md](DISCORD-PORTAL-URLS.md). Юридические URL не являются автоматической верификацией и не заменяют live-проверку IPC/assets.

1. Открыть [приложение по предоставленному ID](https://discord.com/developers/applications/1573957957576556685), проверить ID и название **Z-Aura**. Название в строке Playing берётся из Portal, не из `details`.
2. Rich Presence → Art Assets (или актуальный раздел assets Portal): загрузить `zaura_logo`. Можно использовать ранее извлечённый `C:\Users\Takira\Desktop\Z-Aura.png` — настоящий значок приложения. Локальный PNG не отправляется через IPC, его надо загрузить в Portal.
3. Загрузить `alt_general`; затем `alt_1`, `alt_2` … `alt_13`, `alt_exp` и остальные ключи из встроенного JSON для нужных режимов: `alt_fake_tls_auto`, `alt_fake_tls_auto_1..3`, `alt_simple_fake`, `alt_simple_fake_1..2`.
4. Использовать PNG подходящего качества/размеров по текущим ограничениям Portal (обычно квадратные assets, рекомендуются 512×512/1024×1024); проверить точные lowercase keys. Самостоятельное рисование новых иконок в эту работу не входило.
5. Загрузить `proxy_on` и `proxy_off`; после подтверждения вписать ключи в существующий `settings.discordPresence.availableAssetKeys` при закрытом приложении. GUI-полей больше нет. Default предполагает только `zaura_logo, alt_general`; новые proxy assets не объявляются загруженными без проверки Portal.
6. Small fallback: точный ключ → `alt_general` → `zaura_logo` → отсутствие изображения. Large fallback: заданный ключ → `zaura_logo` → отсутствие. Пустой список keys даёт текстовую Presence.
7. Discord нередко молча опускает незагруженные assets: ACK не доказывает наличие изображения. Каталог keys поддерживает оператор; автоматического запроса REST API/CDN и сетевой проверки assets нет. При RPC 4000 с artwork worker один раз повторяет публикацию без assets; другие/повторные ошибки остаются unavailable с backoff.
8. Запустить **desktop Discord**, разрешить показ активности в его настройках приватности; browser-only Discord не создаёт Windows IPC. Проверить отображение с другого аккаунта: собственные activity buttons могут не отображаться владельцу.

## Проверки

```powershell
dotnet build desktop/Z-Aura/Z-Aura.csproj -c Release --no-restore
$env:ZAURA_TEST_REPORT = "$PWD\artifacts\presence-self-test.txt"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --self-test
$env:ZAURA_UI_REPORT = "$PWD\artifacts\presence-ui-smoke"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --ui-smoke
npm.cmd test
node scripts/build-portable.mjs --output-dir artifacts/portable-telegram
node scripts/verify-portable.mjs --artifact-dir artifacts/portable-telegram
node scripts/export-discord-presence.mjs
```

Автотесты используют собственный `ZAura-presence-test-<GUID>` pipe, не настоящий Discord/account. Проверены: игнорирование старого `enabled:false`, все режимы, ID/URL/asset validation, framing/EOF/fragmentation/PING/PONG/nonce, поздний Discord, Alt/Proxy coalescing ≤200 мс в локальном fixture, lifetime timer, разрыв/рестарт, rejected artwork и async/idempotent shutdown. **Внутреннего disable/re-enable seam больше нет.** UI проверяет отсутствие всей Discord settings card и Ctrl+K результатов, proxy On при zapret Off/busy, редактор/ошибки/theme/layout. `Storage.TestRoot` заменяет настоящий IPC connector и изолирует данные. Реальный winws/служба и Telegram DC-соединения не запускаются.

### Ручной edge-case план (пока не выполнен)

- Настоящий Discord: General → ALT10 → ALT2 и Proxy On/Off; проверить текст/иконки/tooltips/elapsed с другого аккаунта; измерить ≤200 мс локальной отправки отдельно от задержки Discord UI.
- Непрерывно менять профиль; после прекращения должен остаться последний. Не должно зависнуть окно или воспроизвестись очередь старых Alt.
- Discord выключен при старте Z-Aura; открыть позднее. Закрыть/перезапустить Discord Stable/PTB/Canary, проверить endpoint 0..9 и восстановление после backoff.
- Завершить приложение во время connect, ожидания READY, ACK, reconnect; затем запустить снова; убедиться, что старая сессия очищена и окно корректно закрывается. Переключения enable/disable в GUI больше нет.
- Сменить Application ID в локальном конфиге/тестовом snapshot: clear старого IPC, тот же lifetime timer в одной сессии приложения. Изменение файла вручную применяется после перезапуска приложения; новый запуск по определению даёт новый timer.
- Asset отсутствует в каталоге → fallback; каталог ошибочно содержит незагруженный ключ → проверить поведение Discord вручную и удалить ключ. Проверить пустой каталог/4000 rejection.
- Пустая/HTTP/HTTPS ссылка, file/javascript/credentials/control/слишком длинная ссылка; постоянный Telegram-канал и не более одной валидной «Мой Alt», итого максимум две кнопки.
- Свернуть в tray, восстановить; выйти через крестик/tray/admin relaunch; не оставлять активность после фактического завершения, timer не сбрасывать при обычном hide/show.
- Engine старт/стоп/аварийный выход и отдельная работа SCM службы; не выдавать лишь выбранный профиль за реально запущенный DPI-обход.
- Discord и Z-Aura с разными integrity levels/отказом доступа к pipe → unavailable + лог, остальные функции GUI доступны.
- Offline чистая Windows 10/11 x64 без установленного .NET/MSVC/WebView2: один production EXE, рядом portable.flag, без сети. Проверить extraction только в ./data, затем Presence с установленным Discord.

## Статус приёмки

- **Сделано:** рабочая always-on WPF-интеграция без переключателя, configurable ID/22 режима/пользовательские профили, фоновое IPC, timer, bounded reconnect, coalescing, sidebar, нейтральные ошибки, clear/close/async cleanup, встроенный конфиг без новых runtime-зависимостей.
- **Автоматически проверено:** managed Release build без предупреждений, backend/self-tests, GUI smoke, Node regression, Python adapter tests и native dependency closure. Текущие отчёты: `artifacts/telegram-self-test.txt`, `artifacts/telegram-ui-smoke/report.txt`; полный новый отчёт — [TELEGRAM-PROXY.md](TELEGRAM-PROXY.md).
- **Историческая версия до Telegram:** 330 backend assertions, 79 GUI PASS; эти старые цифры/хэш `portable-updated` нельзя приписывать новому кандидату. Итоги новой сборки фиксируются отдельно в Telegram отчёте.
- **Не подтверждено:** новые assets в Portal; интегрированное live Discord отображение/tooltips/button/≤200мс; чистая Windows/offline execution; Telegram connectivity; live engine/служба/reboot; подпись и redistribution review.
- **Не применимо после выбора WPF:** `cargo build --release --target x86_64-pc-windows-gnu`, Rust-крейт, Tauri-команды/events. Проверка GNU относится к существующему C bootstrap LLVM-MinGW, а не Rust.

Прежние `artifacts/Z-Aura-Discord-Presence-code.md` и `*-source.zip` — исторический export до Telegram, не актуальный исходник. Текущий код находится в проекте; интеграционный отчёт — [TELEGRAM-PROXY.md](TELEGRAM-PROXY.md). Новый candidate — `artifacts/portable-telegram/Z-Aura.exe`, SHA-256 — `artifacts/portable-telegram.sha256.txt`; прежний `portable-updated` не заменён. Ограничения release-публикации сохраняются.

Последующее обновление ссылки на канал: `artifacts/portable-telegram-channel/Z-Aura.exe`
(исходный Telegram candidate также сохранён). Текущие отчёты:
`artifacts/telegram-channel-self-test.txt` и `artifacts/telegram-channel-ui-smoke/report.txt`.
Public README/website pack: `artifacts/Z-Aura-GitHub-Telegram.zip`;
актуальный пост (обычный текст): [TELEGRAM-POST-0.3.txt](TELEGRAM-POST-0.3.txt). Старые build-stage пути
в этом разделе исторические; промежуточные EXE/export-пакеты удалены при согласованной очистке.
Актуальная сборка и результаты: [DESKTOP-VERIFICATION.md](DESKTOP-VERIFICATION.md).
