# Z-Aura — редизайн рабочего WPF-приложения

Изменена рабочая версия `desktop/Z-Aura`, а не архивный React/Tauri-прототип. CSS и Framer Motion здесь не участвуют: оформление — WPF `ControlTemplate`, анимации — короткие `DoubleAnimation` с ограниченным easing. Прежний managed spring-loop заменён после сообщения о резких/лагующих анимациях.

## Что изменено

- Прозрачное безрамочное окно: `WindowStyle.None`, `AllowsTransparency = true`, `Background = Transparent`. Кастомный title bar, векторные кнопки управления, перетаскивание, двойной клик и невидимые resize-зоны. Корневой контейнер и содержимое обрезаются по радиусу 28 DIP. Прямоугольный HWND Acrylic отключён.
- Сайдбар: иконка + текст, прозрачные неактивные пункты, фиолетовый градиент активного пункта, hover/focus-подсветка.
- Кастомные шаблоны Button, TextBox, CheckBox, Switch, ComboBox/ComboBoxItem, ScrollViewer/ScrollBar, TabControl/TabItem, DataGrid/Row/Cell/ColumnHeader, ListBox/Item, ToolTip, ContextMenu/MenuItem и ProgressBar. Системная синяя подсветка не используется.
- Скроллбар 6 DIP с коротким easing-затуханием; становится видимым при наведении или клавиатурном фокусе. Горизонтальный скролл таблицы также кастомный. В WPF DIP масштабируется с DPI.
- Чекбокс: скруглённый квадрат, тонкая векторная галочка с плавным масштабированием; Switch: отдельный шаблон с анимированным ползунком. Табличные булевы значения используют тот же кастомный шаблон, а не `DataGridCheckBoxColumn.DefaultElementStyle`.
- Окна подтверждения/ошибок и файловые диалоги отрисованы приложением. Файловый диалог поддерживает путь к папке/файлу, навигацию вверх, фильтр расширений, множественный выбор и подтверждение перезаписи. Обычные OS Open/Save/MessageBox исключены из рабочего GUI. Фатальная ошибка C-bootstrap также рисуется самостоятельно; для неё встроен Inter-Regular как ресурс 102.
- Welcome скрывает основной интерфейс на минимум 1,8 секунды и до фактического завершения проверки runtime. После этого становится доступна кнопка «Начать работу». Ошибка остаётся на Welcome и предлагает повторную проверку. Progress скрывается в `finally`; запоздалые `Progress<T>` сообщения не меняют готовое состояние. Загрузка журнала также получает финальное состояние. Стартовое уведомление поверх страницы удалено.
- Уведомления об операциях — компактный toast справа сверху, с непрозрачным для чтения стеклянным слоем, векторным статусом, закрытием и Undo. Это overlay, не большая плашка поверх всей страницы.
- Списки/Fake-файлы/профили: star-sized Grid для полей, WrapPanel для групп действий, вертикальная прокрутка, отдельные поля и кнопки редактора. Таблицы не раздвигают страницу длинными SHA-256. Коллекция профилей — ObservableCollection: dropdown и таблица корректно обновляются после CRUD.
- Вкладки библиотеки строятся только при первом выборе. Большие списки (>512 строк) валидируются через `Task.Run`; поиск/фильтр повторно используют результат. Version guard не даёт старому результату заменить текущий черновик. Сохранение по-прежнему полностью валидирует данные до записи.
- Discord Presence постоянно активна; её настройка включения/выключения удалена. Детали — в [DISCORD-PRESENCE.md](DISCORD-PRESENCE.md).

## Шрифт и иконки

Inter **4.1**, официальный архив: https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip.

Использованы **статические TTF**, не variable-font: Regular (400), Medium (500), SemiBold (600), Bold (700). Кириллица проверяется через встроенный `GlyphTypeface` в UI smoke. Заголовки — SemiBold, основной текст — Regular, заголовки таблиц — Medium.

```xml
<EmbeddedResource Include="assets\fonts\Inter-OFL.txt" LogicalName="ZAura.inter-license.txt" />
<Resource Include="assets\fonts\Inter-*.ttf" />
```

```csharp
new FontFamily(new Uri("pack://application:,,,/"), "./assets/fonts/#Inter");
```

`Theme.xaml` содержит `AppFont` с pack URI. Шрифты находятся внутри сборки и single-file EXE; приложение не загружает их из сети и не устанавливает в систему. Старый Atkinson оставлен в исходниках как существующий ресурс, но TTF больше не включается в рабочую сборку. Его старый OFL notice сохранён; новая лицензия Inter — `assets/fonts/Inter-OFL.txt`.

| Файл | SHA-256 |
|---|---|
| Inter-Regular.ttf | `40d692fce188e4471e2b3cba937be967878f631ad3ebbbdcd587687c7ebe0c82` |
| Inter-Medium.ttf | `97ad806f526e41546d46365bb3a393145f75b7b1568913db74549ad8b8dba872` |
| Inter-SemiBold.ttf | `78a843fade9d4612a5567302fb595b56976eb5fcebf4fea5a5912d638bafcde3` |
| Inter-Bold.ttf | `288316099b1e0a47a4716d159098005eef7c0066921f34e3200393dbdb01947f` |

`UI/Icons.cs`: оригинальные тонкие иконки с SVG-совместимыми Path Data, отрисованные WPF Path/Viewbox. Цвет берётся из ресурсов текста/акцента, в кнопках привязан к Foreground. Символьные шрифты, эмодзи и системные UI-иконки не нужны. Иконка EXE/tray — существующая собственная `app.ico`.

## Стекло и анимации

`GlassBorder` использует общий замороженный `RenderTargetBitmap` ambient-фона с мягкими радиальными градиентами. Фон строится один раз при смене темы/размера, поверхности семплируют его через кэшированные `ImageBrush`; живого `VisualBrush` и многократного `BlurEffect` больше нет. Текст/контролы остаются векторными. Поверх — полупрозрачная заливка, светлая обводка (`#66FFFFFF`, альфа .4 в светлой теме), радиусы 12–28 DIP. Shader-тени карточек/hover удалены, чтобы не растеризовать поддеревья на каждой анимации. В тёмной теме обводка слабее, high contrast усиливает её.

**Граница реализации:** это имитация стекла поверх внутреннего статического мягкого фона, не живой blur рабочего стола и не рекурсивный backdrop соседних контролов. WPF не предоставляет безопасный CSS `backdrop-filter` для произвольных дочерних элементов. Прямоугольный Acrylic намеренно отключён ради прозрачных углов. Reduced transparency заменяет стекло непрозрачными поверхностями.

`Motion.cs`: WPF clocks, `CubicEase.EaseOut`, `SnapshotAndReplace`; перенацеливание начинается с текущего видимого значения (не с исходной позиции), без overshoot. По завершении clock удаляется и фиксируется конечное значение. Opacity ограничена 0–1. Переход страницы/вкладки: одна группа, opacity .6→1 за 280 мс и slide 6→0 DIP за 320 мс. Модалка: scale .98→1 за 320 мс. Hover/press: 1.008/.992 за 180 мс. Switch и галочка: 200–220 мс. Reduced motion немедленно завершает текущие clocks и исключает новые движения. Повторный refresh той же страницы не запускает enter; version guard отменяет устаревшие navigation/tab callbacks. Одновременный stagger дочерних кнопок/полей и fade shell удалён.

`UI/MotionSmoke.cs` (`--motion-smoke`) измеряет промежутки WPF Rendering callbacks и общий CPU процесса при навигации, быстром hover и вкладках/scroll. До исправления повторный refresh сбрасывал opacity; после — opacity=1 и 0 активных clocks после завершения быстрых переходов. В текущем замере максимальная пауза навигации была 95.39 мс против 176.9 мс в исходном; hover/scroll не дали пауз >33.4 мс. Это одиночные замеры на текущем ПК, не GPU-present timestamps и не гарантия 60 FPS/ускорения на всех системах: создание страниц всё ещё даёт отдельные паузы. Raw reports: `artifacts/motion-before.json`, `artifacts/motion-after.json`.

## Исходники и проверка

```powershell
dotnet build desktop/Z-Aura/Z-Aura.csproj -c Release
npm.cmd test
$env:ZAURA_TEST_REPORT = "$PWD\artifacts\always-on-self-test.txt"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --self-test
$env:ZAURA_UI_REPORT = "$PWD\artifacts\always-on-ui-smoke"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --ui-smoke
$env:ZAURA_MOTION_REPORT = "$PWD\artifacts\motion-after.json"
dotnet desktop/Z-Aura/bin/Release/net10.0-windows/win-x64/Z-Aura.dll --motion-smoke
node scripts/build-portable.mjs --output-dir artifacts/portable-updated
node scripts/verify-portable.mjs --artifact-dir artifacts/portable-updated
node scripts/export-ui-redesign.mjs
# Optional isolated native error UI fixture, no elevation/runtime startup:
node scripts/build-bootstrap.mjs --test-as-invoker
powershell.exe -NoProfile -File scripts/test-bootstrap-ui.ps1
# Restore the production requireAdministrator resource configuration:
node scripts/build-bootstrap.mjs --output-dir artifacts/portable-updated
```

- Полный код изменённых компонентов **без сокращений**: `artifacts/Z-Aura-UI-code.md`.
- Исходный архив компонентов/стилей/шрифтов: `artifacts/Z-Aura-UI-source.zip` (это не полный архив движка/SDK; изменения накладываются на текущий проект).
- Актуальный portable EXE: `artifacts/portable-updated/Z-Aura.exe`; контрольная сумма — `artifacts/portable-updated.sha256.txt`. Предыдущий `artifacts/portable/Z-Aura.exe` был занят работающим приложением и не заменён. Перед заменой EXE закройте Z-Aura, сохраните прежние `portable.flag` и `data`, если используются.
- UI-снимки и отчёт: `artifacts/always-on-ui-smoke/`. 35 снимков страниц/тем + Welcome/ошибка Welcome + dropdown + 6 снимков адаптивной компоновки; 79 PASS записей (35 page/theme + 44 interaction/layout). Проверяются готовность/скрытие progress, ошибка и повторная реальная проверка runtime, защита от поздних сообщений, кириллица, завершение/перенацеливание easing clocks и reduced motion, отсутствие Presence toggle, lazy tabs/background IPset validation, кастомные popup/switch/table/modal/file-picker, CRUD, привязки и Undo.
- Native bootstrap error: `bootstrap-error.png` и `bootstrap-error-report.txt`; отдельно проверяются собственный класс окна, скруглённый регион и закрытие клавишей Enter. Тестовый bootstrap собран как asInvoker и **не предназначен для распространения**. Production сохраняет requireAdministrator.
- Backend self-test: 330 проверок, включая ресурсы, подпись WinDivert, стратегии, привязки, сохранение данных и 33 Presence-проверки. Node: 21 тест.

Это UI/build-кандидат. Проверки не запускают winws, службу или сетевую диагностику. UAC и другие обязательные экраны безопасности Windows нельзя и не следует заменять кастомным GUI. Полноценный аудит доступности, несколько мониторов/все DPI, elevated driver/service/reboot и чистая Windows всё ещё требуют отдельной ручной/интеграционной проверки. Успешные UI smoke и сборка не означают готовый публичный релиз.
