# Z-Aura — окончательный сайт документов 0.3.2

## Результат и утверждение

Редакция **25.11.2026** подготовлена как окончательная по явному указанию владельца «сразу утверди, не делай черновик». `website/legal/site.config.json` содержит `publicationApproved:true` и основание. На всех шести итоговых страницах нет DRAFT. Это утверждение владельцем для подготовки пакета, **не независимая юридическая экспертиза, deploy, App Verification или одобрение Discord**.

Новый адрес по уточнению владельца: **https://dopebeanie.github.io/z-aura-confidentiality-policy/**. Репозиторий: **dopebeanie/z-aura-confidentiality-policy**. Основной сайт `dopebeanie/z-aura` — отдельный; загрузка туда не обновит эти документы.

Окончательный output: `artifacts/legal-final-0.3.2`. Desktop-пакет: `C:\Users\Takira\Desktop\Z-Aura-Legal-Final-0.3.2`.

## Что изменилось

- Оригинальный логотип в шапке и favicon; аккуратная фиолетовая палитра light/dark, панели, читаемая типографика и карточки документов.
- RU / ENG — двухсегментный переключатель с выделением текущего языка, реальными статическими URL и переносом темы на соответствующий документ.
- Солнце/луна вместо Windows select. Доступная radio-группа с roving Tab и клавиатурой; собственные tooltip, границы и скроллбары.
- Навигация About/Terms/Privacy выделяет текущий документ. Оглавление строится из настоящих заголовков, на телефоне расположено над текстом и раскрывается обычным `details`.
- Контакт ответственного, Telegram-канал, редакция и независимость от Discord сохранены.
- Inter загружается с самого сайта, SIL OFL включена. Добавлен только `font-src 'self'`; остальные ограничения CSP сохранены. Inline-код, внешние ресурсы, аналитика или cookie-механизмы не добавлены.
- Политика RU/ENG уточняет локальные шрифты и поведение оглавления. Раскрытия DPAPI, refresh, удаления, Presence, хостинга, журналов и ограничений приложения сохранены.
- Никаких изменений WPF/.NET, EXE, обновлений, стратегий, профилей или пользовательских настроек в этой работе.
- В текущих README и RU/ENG исходниках основного сайта исправлен только адрес юридических ссылок. Для этой отдельной загрузки в `dopebeanie/z-aura` приложен `OPTIONAL-MAIN-LINKS.zip`; основной дизайн не менялся, прежний site-fix архив не перезаписывался. Не загружайте этот optional ZIP в юридический репозиторий.

## Проверки

- **80 Node-тестов PASS**, включая четыре новые проверки дизайна: утверждение/кнопки/языки, точные цели оглавления, CSP/режимы доступности и побайтовое сохранение логотипа/Inter/OFL. Исходная блокировка неутверждённых конфигураций продолжает работать.
- **192 Chromium layout-кейса**: шесть страниц × две темы × 16 ширин: 320, 375, 640, 641, 760, 761, 959, 960, 970, 1024, 1100, 1180, 1181, 1307, 1440, 1920. Проверены горизонтальный overflow, границы/перекрытие/обрезка шапки, загрузка локального шрифта/логотипа, radio-состояния, язык, текущий документ и ссылки оглавления.
- Реальные действия Chromium: click, ArrowRight с циклическим переходом, End, Space и Enter; один Tab-stop, видимый keyboard outline, сохранение при reload и переходе на другой документ без query. RU → ENG переносит только тему, не посторонний query/fragment.
- Lighthouse на локальном окончательном Privacy ENG dark: **Accessibility 100**, **Best Practices 100**. Замечание о несоответствии имени бренда исправлено удалением избыточного aria-label. SEO **83**: проверка robots.txt остановлена строгой CSP (`connect-src` не разрешён); CSP не ослаблялась ради оценки. Это локальный аудит, не утверждение публичной индексируемости.
- Скриншоты desktop light/dark и mobile, Node-log, browser-result и исходный Lighthouse JSON/HTML находятся в `evidence` Desktop-пакета.

Ограничения: тесты layout — same-origin iframe viewports в Chromium, не реальные телефоны или Safari/Firefox/browser matrix. Reduced motion/transparency и forced colors проверены регрессиями CSS; переключение реальных настроек ОС и полная проверка screen reader не выполнялись. Локальный аудит не заменяет юридическую или публичную проверку.

## Загрузка и поля Portal

1. Распаковать `UPLOAD-TO-LEGAL-REPO.zip` и загрузить **13 файлов из его корня** в источник Pages репозитория **dopebeanie/z-aura-confidentiality-policy**. Не вкладывать их в дополнительную папку и не загружать evidence/SOURCE ZIP.
2. Заменить совпадающие сайт-файлы, не удаляя остальные файлы репозитория. Проверить успешный Pages deploy и открыть сайт с Ctrl+F5.
3. Проверить документы по HTTPS, HTTP 200, без входа в аккаунт, правильные тексты/контакт и обе темы.
4. Затем вставить в Discord Developer Portal:
   - Terms: **https://dopebeanie.github.io/z-aura-confidentiality-policy/terms.html**
   - Privacy: **https://dopebeanie.github.io/z-aura-confidentiality-policy/privacy.html**
5. `Interactions Endpoint URL` и `Linked Roles Verification URL` оставить пустыми для неиспользуемых функций; App Verification выполняется владельцем отдельно.

Ассистент ничего не публиковал, не менял Portal и не создавал коммиты/релизы. Исторические DRAFT-пакеты, доставки приложения и основной site-fix оставлены отдельно. Нынешние Terms/Privacy в `portal-links.json` относятся только к новому адресу; старый путь не используется для финальной загрузки.

## Воспроизведение

```powershell
node scripts/build-discord-legal-site.mjs --config website/legal/site.config.json --out artifacts/legal-final-0.3.2
node --test tests/*.test.mjs
$env:ZAURA_LEGAL_PREVIEW='artifacts/legal-final-0.3.2'
node scripts/preview-sites.mjs
```

Для layout-проверки откройте `/main/index.html` локального preview в **активной** вкладке Chromium и выполните `scripts/check-legal-layout.browser.js` через browser.evaluate. Скрипт меняет только тестовый DOM; исходники основного сайта не затрагиваются. Preview автоматически закрывается через 15 минут.
