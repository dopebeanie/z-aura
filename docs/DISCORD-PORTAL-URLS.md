# Z-Aura — URL в Discord Developer Portal

Новости проекта: [Telegram · @zaurafork](https://t.me/zaurafork).
Канал — ссылка сообщества, не замена Terms/Privacy или Interactions Endpoint.

Проверено по документации Discord **22 ноября 2026 года**. Приложение: `1573957957576556685`.

## Что означают четыре поля

| Поле | Назначение | Для текущего Z-Aura |
|---|---|---|
| Interactions Endpoint URL | Публичный HTTP обработчик slash-команд, компонентов и других interactions; альтернатива доставке через Gateway | **Оставить пустым:** таких функций нет. Не URL сайта/документа и не local IPC |
| Linked Roles Verification URL | Старт реального OAuth2-сценария для привязанных ролей и записи role-connection metadata | **Оставить пустым:** функция не реализована. Это не верификация самого приложения |
| Terms of Service URL | Публичные условия использования приложения | Документ утверждён; итоговый файл `artifacts/discord-legal-site/terms.html`. После размещения — URL реального `terms.html` |
| Privacy Policy URL | Публичная политика обработки данных | Документ утверждён; итоговый файл `artifacts/discord-legal-site/privacy.html`. После размещения — URL реального `privacy.html` |

**Заполнение всех четырёх полей не является требованием для базового Rich Presence и не означает прохождения проверки Discord.** По руководству Discord, Rich Presence without authentication требует доступного desktop-клиента и зарегистрированного приложения с валидным Application ID. Эти юридические страницы не исправляют ошибки IPC и не подменяют загрузку assets.

Не путайте:

- **Rich Presence / Activity пользователя:** статус из нашего локального Windows-приложения.
- **Discord Activities:** отдельные приложения, работающие внутри Discord через Embedded App SDK.
- **App Verification / Discovery:** отдельные процедуры проверки и размещения приложения в каталоге; требования доступны в разделе App Verification вашего Portal и могут зависеть от типа приложения.
- **Linked Roles:** проверка внешних условий для роли пользователя на сервере, не проверка подлинности Z-Aura.

## Подготовленные документы

Сайт из `website/legal` не зависит от WPF-сборки, не добавляет runtime-зависимостей и не загружается автоматически при запуске EXE. Он содержит главную страницу, условия, политику и CSS. В документах явно раскрыта постоянная активность Discord, передача выбранной метки/имени пользовательского профиля, локальные журналы без автоматического срока удаления, диагностика и обработка сетевых пакетов сторонним движком.

Сведения владельца внесены в `website/legal/site.config.json`: дата **22.11.2026**, владелец **Август / @dopebeanie (wannadie2day)**, контакт **z-aura@internet.ru**, выбранный хостинг **GitHub Pages**, предоставленный адрес сайта **https://dopebeanie.github.io/cl3j1hdh7dbb2dzx/**. Политика описывает технические данные и хранение по правилам GitHub, со ссылкой на его политику. Владелец подтвердил редакцию: установлен `publicationApproved:true`, окончательная сборка разрешена. Подтверждение владельца не означает независимой юридической проверки, публикации сайта или одобрения Discord.

Проверка 22.11.2026: главная страница и обе целевые страницы документов вернули **HTTP 404**. Ссылки ниже сохранены как целевые, а не как уже опубликованные документы:

- Terms: `https://dopebeanie.github.io/cl3j1hdh7dbb2dzx/terms.html`.
- Privacy: `https://dopebeanie.github.io/cl3j1hdh7dbb2dzx/privacy.html`.

```powershell
node scripts/build-discord-legal-site.mjs --config website/legal/site.config.json
# Необязательный черновой просмотр в отдельной папке:
node scripts/build-discord-legal-site.mjs --draft --config website/legal/site.config.json --out artifacts/discord-legal-site-draft
```

Результат: `artifacts/discord-legal-site/{index.html,terms.html,privacy.html,styles.css,portal-links.json}` и пакет для ручной загрузки `artifacts/Z-Aura-GitHub-Pages.zip` (пять файлов в корне). Итоговые страницы без отметки «Черновик», ссылки вычисляются от выбранного `siteUrl`, включая подкаталог хостинга. В явно запрошенном draft-режиме URL по-прежнему равны `null`. Скрипт **не публикует** сайт и **не изменяет** Portal; ZIP подготовлен отдельно. Инструкция по полям конфигурации и размещению: [website/legal/README.md](../website/legal/README.md).

## После публикации

1. Проверить оба URL по HTTPS без входа в аккаунт, HTTP 200 и правильность документов/контакта. Сайт должен быть постоянным, не `localhost`, `file://` или временным tunnel.
2. Открыть [General Information приложения](https://discord.com/developers/applications/1573957957576556685/information).
3. Вставить Terms/Privacy из опубликованного сайта в соответствующие поля. Не вставлять черновые локальные пути.
4. Не менять уже настроенные Interactions/Linked Roles других функций без отдельной проверки. Если они не используются и пустые — оставить пустыми.
5. Rich Presence отдельно: проверить Application ID, имя Z-Aura, assets `zaura_logo`/нужные `alt_*`, работающий desktop Discord и настройки видимости активности. Смотреть с другого аккаунта; свой пользователь может не видеть свои activity buttons. См. [DISCORD-PRESENCE.md](DISCORD-PRESENCE.md).
6. Если нужна именно App Verification, посмотреть текущий checklist в Portal. Удостоверение личности/подтверждение владельца выполняет сам владелец через Discord, не через чат с агентом. Юридические URL не гарантируют одобрения.

## Если позже действительно понадобятся первые два URL

### Interactions Endpoint

Нужен отдельно размещённый обработчик HTTPS POST. Каждый запрос проверяется Ed25519-подписью с публичным ключом приложения, заголовками `X-Signature-Ed25519`, `X-Signature-Timestamp` и **исходным телом**, без изменения JSON до проверки. Invalid signature → HTTP 401. Подписанный PING `type:1` → HTTP 200 с JSON `{"type":1}` и правильным Content-Type. Команды требуют настоящей логики и своевременных ответов; обработчик PING без полезных функций не нужен текущему Z-Aura. Discord проводит повторные проверки безопасности.

### Linked Roles

Нужны согласованный критерий роли, OAuth2 `role_connections.write`, защищённый state/callback, конфигурация metadata, безопасное хранение/отзыв токенов и порядок unlink/delete. `Client Secret` хранится **только на сервере**, не в EXE, публичном сайте или репозитории. Не просите пароль Discord. Нельзя достоверно подтвердить установленный/активный Z-Aura только по произвольному утверждению браузера без спроектированного механизма доказательства. До определения критериев и реализации URL не задаётся.

## Проверки и статус

- **Сделано локально:** редакция утверждена владельцем, окончательный статический сайт и ZIP для загрузки, блокировка незавершённой/неутверждённой конфигурации, безопасное HTML-экранирование и построение URLs с подкаталогом.
- **Проверено:** 29 Node-тестов, включая 8 тестов документов/сборки; production build с указанными владельцем сведениями и датой `22.11.2026`, отсутствие черновых отметок, целевые URL и содержимое ZIP. Никаких новых зависимостей, внешних HTTP-запросов в тестах или изменений EXE.
- **Не сделано:** независимая юридическая проверка, настройка/проверка публикации GitHub Pages (последняя проверка целевого адреса — HTTP 404), заполнение полей Portal, App Verification и live-показ Presence. Interactions/Linked Roles backend намеренно не реализован для неиспользуемых функций.

## Официальные источники

- [Rich Presence without authentication: Requirements](https://docs.discord.com/developers/discord-social-sdk/development-guides/setting-rich-presence#rich-presence-without-authentication).
- [RPC over IPC / SET_ACTIVITY](https://docs.discord.com/developers/topics/rpc).
- [Interactions: настройка endpoint, PING и подписи](https://docs.discord.com/developers/interactions/overview#configuring-an-interactions-endpoint-url).
- [Configuring App Metadata for Linked Roles](https://docs.discord.com/developers/tutorials/configuring-app-metadata-for-linked-roles).
- [Enabling Discovery / App Verification](https://docs.discord.com/developers/discovery/enabling-discovery).
- [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
