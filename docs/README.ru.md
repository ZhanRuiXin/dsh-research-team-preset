# Research Team Mode

**DSH agent preset, превращающий одну сессию в небольшую слаженную исследовательскую команду.**

**Версия 1.1.0** · **Обновлено 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <strong>Русский</strong> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Обзор

Research Team Mode — это DSH agent preset для проведения сквозного исследования командой, а не в одном чате. Lead планирует работу, ведёт доску задач, распределяет карточки, интегрирует результаты и общается с пользователем. Семь специалистов по умолчанию покрывают консультативную оценку, литературу и доказательства, получение данных, код, запуски, независимую проверку и написание статьи.

Режим рассчитан на исследования, которые длятся дни или недели, требуют прослеживаемых доказательств и выигрывают от чётких границ ролей. Это не режим «вопрос — ответ»: Lead создаёт только те роли, которые действительно нужны задаче.

## Кратко

| | |
| --- | --- |
| **Роли по умолчанию** | 7: advisor, researcher, data, builder, runner, reviewer, writer |
| **Рабочий процесс** | Сначала доска задач: создать, взять в работу, выполнить, отчитаться, проверить, принять пользователем |
| **Завершение** | `in_review` — последняя остановка агента; только пользователь может перевести карточку в `done` |
| **Маршрутизация моделей** | Провайдер, модель и усилие рассуждения для каждой роли через форму настроек на странице Plugins |
| **Среда выполнения** | PTC (`run_code` + сгенерированный SDK), один уровень subagent на участника |

## Для кого

- Исследовательские проекты, объединяющие обзор литературы, реализацию, эксперименты и подготовку статьи.
- Команды, которым нужна цепочка доказательств от утверждения к источнику, записи запуска или логу.
- Пользователи, которым нужен консультант и независимый рецензент, а не один универсальный агент.
- Работа, где окончательное решение о приёмке должен принимать пользователь, а не агент.

**Не для:** быстрых фактических вопросов, правок одного файла или задач, где достаточно одноразового ответа. Режим предписывает Lead отвечать на простые вопросы напрямую и мобилизовать команду только для содержательного исследования.

## Требования

Research Team Mode — это **bundle DSH уровня профиля**. Bundle не устанавливает и не включает профильные bundle, которые он использует; установщик пакетов DSH работает с npm-зависимостями, а не с функциональными bundle. Сначала включите зависимости в том же профиле.

| Возможность | Провайдер | Примечания |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Разработано для `0.2.1-rc.5`; другие версии могут работать, но не гарантируются |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Предоставляет `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` и сервисы Team |
| Доска задач | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | Предоставляет `taskboard_*` и доску в Web GUI |
| Среда PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) и [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Входит в базовый DSH; включает `run_code` |
| Git Bash (опционально, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | Добавляет инструмент `bash` для агентов, которым он нужен |
| Web GUI | DSH Web/Desktop | Требуется для формы настроек и доски задач |

Если зависимости не хватает, режим всё равно может загрузиться частично, но инструменты команды, доска или страница настроек будут недоступны. Менеджер плагинов не запрашивает эти bundle и не связывает их автоматически.

## Установка

Этот репозиторий — локальный DSH bundle. Из checkout:

1. **Включите предварительные условия** в целевом профиле:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Доска задач: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Опционально [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) в Windows.
2. **Установите этот bundle** действием установки на странице Plugins или в менеджере плагинов, используя локальную ссылку:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   Локальный путь к папке тоже подходит. Сохраняйте ссылку, если планируете обновляться из этого checkout; переустановите после замены папки.
3. **Перезапустите DSH.** Строки preset и клиентская часть bundle загружаются при старте.
4. **Убедитесь, что bundle включён** в том же профиле.
5. **Откройте новую сессию** и выберите **Research Team Mode** в селекторе режимов.
6. Для сессий выполнения с доски задач создавайте карточки с `presetId=research-team`, чтобы выполнение использовало ту же персону и инструменты.

> Режим — это bundle уровня профиля: установка в одном профиле не включает его в другом. Повторите шаги установки и предварительных условий для каждого профиля.

## Первый запуск

Попросите Lead проверить окружение и доску перед началом реальной работы:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

Типичная первая задача:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Команда по умолчанию

| Роль | Ответственность |
| --- | --- |
| `advisor` | Независимая оценка направления, постановки, ключевых утверждений, достаточности доказательств и стратегии статьи; рекомендует продолжить / пересмотреть / остановиться. Только консультация, не шлюз |
| `researcher` | Поиск литературы, получение источников, внимательное чтение, извлечение доказательств и таблица доказательств «утверждение → источник → место» |
| `data` | Получение внешних наборов данных и весов моделей, включая доступность источника и статус лицензии/доступа, инструменты загрузки с докачкой и обработкой ограничений скорости, проверку целостности по хешам издателя, распаковку, контракт manifest, небольшую проверенную выборку и журнал диска. Не пишет код обучения и не меняет протокол оценки |
| `builder` | Код, конфигурация, конвейеры данных, тесты и воспроизводимые точки входа; без длительных запусков обучения |
| `runner` | Запуск и мониторинг обучения/оценки; записывает run id, конфигурации, seed, метрики, логи, чекпойнты и пути к артефактам |
| `reviewer` | Независимая проверка заметок по литературе, кода, результатов и утверждений/цитирований статьи; PASS/FAIL с блокирующими доказательствами |
| `writer` | Черновик статьи в LaTeX: текст, разделы, таблицы, подписи, цитирования и код рисунков; не запускает эксперименты и не меняет код/модели |

Lead отвечает за уточнение цели, декомпозицию, управление доской, диспетчеризацию, интеграцию, резюме, финальную сборку материалов и передачу. Участники могут использовать один уровень subagent для ограниченной подзадачи; создавать новых участников они не могут.

## Процесс работы с доской задач

```text
User goal
Lead:  research_project -> taskboard_create (checklist, presetId=research-team)
       -> comment the owner -> send_message
Member: taskboard_get (read comments) -> taskboard_move todo -> in_progress
       -> work -> taskboard_checklist (with evidence) -> taskboard_execution_report
       -> taskboard_comment_add -> taskboard_move -> in_review
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Доска — единственный реестр задач. Не храните учёт результатов только в чате. `team_task_*` служит для временной координации, а не для результатов.

## Настройки модели для каждой роли

Откройте:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

Каждый участник по умолчанию занимает одну строку:

- **Model**: один выпадающий список со всеми моделями всех провайдеров и некликабельными заголовками групп провайдеров. Выбор модели задаёт и провайдера, и модель.
- **Reasoning effort**: второй выпадающий список с заявленными усилиями выбранной модели плюс вариант «по умолчанию модели».

Пустая модель означает «наследовать маршрут Lead»; пустое усилие означает «использовать значение модели по умолчанию». `spawn_teammate_with_model` читает значение роли по умолчанию, если `model` не указан; явный `model` его переопределяет. Простой `spawn_teammate` всегда наследует Lead.

Имя строки имеет значение: `research-team-settings` должно оставаться в **корне пакета** `@local/dsh-research-team-preset`. Сканер клиентских модулей DSH обнаруживает `dsh.client` только для строк с точным именем корня пакета; имя подпути запускает host-плагин, но страница никогда не загружается.

### Где хранятся настройки

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "roles": {
    "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
    "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
  }
}
```

- JSON-файл — источник истины. Host-плагин загружает его при старте; `getSettings()` и `modelForRole()` обновляются из него, поэтому страница и следующий участник видят актуальные значения.
- Отсутствующий или временно нечитаемый файл сохраняет последний корректный снимок в памяти вместо его очистки.
- Файл настроек **не** находится в этом репозитории. Делайте его резервную копию отдельно. Он относится к `DSH_HOME`, а не к профилю.
- Учётные данные не хранятся; только строки provider/model/effort.
- Сохранения настроек применяются без перезапуска DSH. Перезапуск требуется для первой установки строки настроек/клиентской страницы и для изменений preset/плагинов.
- Версия 1.0.0 исправляет ошибку загрузчика в предыдущих сборках: файл оборачивает роли в `"roles"`, а старый загрузчик передавал весь объект нормализатору ролей, из-за чего после перезапуска все настройки оказывались пустыми. Текущий загрузчик разворачивает `"roles"` и для совместимости поддерживает простую карту ролей.

## Справочник по конфигурации

| Настройка | Расположение | Примечания |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`; карточки задач должны использовать `presetId=research-team` |
| Персона | `cordis.patch.yml` | Английский system prompt; правила для всего режима |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Установите `false`, чтобы убрать `spawn_teammate_with_model` и его обёртку сервиса |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Провайдеры subagent, используемые инструментом modeled spawn; по умолчанию `spawn` / `fork` |
| Строка `research-team-settings` | `cordis.patch.yml` | Host-строка верхнего уровня; сохраняйте имя корня пакета |
| Маршруты ролей | `$DSH_HOME/research-team-settings.json` | provider/model/reasoningEffort для семи ролей по умолчанию |

## Структура репозитория

```text
research-team-preset/
├── README.md                     # This file (canonical, English)
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── package.json                  # DSH bundle manifest and exports
├── cordis.patch.yml              # Preset + top-level settings row
├── plugin/
│   ├── index.js                  # research_project + English task-board prompt section
│   ├── modeled-teammates.js      # spawn_teammate_with_model + activation wrapper
│   └── settings-store.js         # Shared settings snapshot + disk refresh
├── settings/
│   └── index.js                  # Settings file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config form (model/effort dropdowns)
└── docs/
    ├── README.zh-CN.md
    ├── README.zh-TW.md
    ├── README.ja.md
    ├── README.ko.md
    ├── README.de.md
    ├── README.fr.md
    ├── README.es.md
    ├── README.pt-BR.md
    ├── README.ru.md
    ├── README.ar.md
    └── README.hi.md
```

## Как это работает

- **Preset**: `cordis.patch.yml` объявляет персону, строки инструментов, подмодуль modeled-teammates и строку настроек верхнего уровня.
- **Prompt доски задач**: `plugin/index.js` регистрирует раздел английского протокола (`plugin:dsh-taskboard`) в области видимости preset и предоставляет `research_project` для определения текущего workspace.
- **Маршрутизация по ролям**: `plugin/modeled-teammates.js` оборачивает `subagents.startActivation` через `AsyncLocalStorage` и внедряет `agentOptions` только для вызова `spawn_teammate_with_model`. Официальный пакет Agent Teams не изменяется.
- **Настройки**: `settings/index.js` загружает и сохраняет JSON-файл и обслуживает `GET/POST /api/dsh-research-team-settings`; `client/index.js` регистрирует форму строки на странице Plugins через `plugins.row.config`.
- **Обновление**: `plugin/settings-store.js` хранит снимок в памяти, обновляет его с диска при чтении и при spawn и сохраняет последний корректный снимок, если чтение не удалось.

## Контрольный список проверки

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
save a role model -> restart -> page still shows it
```

Путь сохранения настроек можно проверить без интерфейса:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Устранение неполадок

### Настройки сбрасываются после перезапуска

Версия 1.0.0 исправляет известную причину: старый загрузчик передавал весь объект `{ roles: ... }` нормализатору ролей и получал полностью пустые настройки. Обновитесь до 1.0.0 или новее, перезапустите DSH и проверьте, что:

- `$DSH_HOME/research-team-settings.json` существует и содержит сохранённые роли;
- строка `research-team-settings` называется ровно `@local/dsh-research-team-preset`;
- текущий host запускает этот checkout, а не устаревшую установленную копию.

### Страница настроек не появляется в Plugins

- Строка должна быть корнем пакета, а не `@local/dsh-research-team-preset/settings`.
- Клиентской части нужен перезапуск DSH и обновление браузера после установки.
- Проверьте, что bundle включён в профиле.

### Инструменты команды отсутствуют

Включите [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) в том же профиле и перезапустите. Установщик это не предлагает.

### Инструменты доски задач отсутствуют

Включите [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) в том же профиле и перезапустите.

### `spawn_teammate_with_model` недоступен

Подмодуль оборачивает внутренний сервис subagent. Обновление DSH может изменить форму активации. Проверьте текст ошибки; если обёртка не может установиться, задайте `research-modeled-teammates.enabled: false`, перезапустите и используйте простой `spawn_teammate`.

### Preset не отображается в списке

Убедитесь, что bundle установлен и включён, перезапустите DSH и откройте новую сессию. Объявления preset загружаются при старте.

### `research_project` не может определить workspace

Откройте рабочий каталог как проект/workspace DSH в GUI или передайте известный проект; инструмент не угадывает.

## Известные ограничения

- Маршрутизация моделей по ролям — это обёртка внутреннего сервиса, а не официальное расширение Agent Teams. Обновления DSH могут её сломать; запасной вариант описан выше.
- Зависимости уровня профиля не устанавливаются и не включаются автоматически. Этот репозиторий документирует их, но не управляет ими.
- Настройки ролей живут в отдельном JSON-файле в `$DSH_HOME`; они не входят в стандартный экспорт/резервное копирование конфигурации DSH. Копируйте файл при переносе на другую машину.
- Меню моделей — это нативный `<select>` с группами провайдеров, а не пользовательский выбор с поиском.
- Режим не запускает семь участников автоматически при старте сессии. Lead создаёт роли по мере необходимости для задачи.
- Участники могут использовать один уровень subagent; более глубокая делегация намеренно отключена.

## Разработка

Этот репозиторий — локальный DSH bundle без шага сборки для host-кода. Клиентская страница — это предсобранный модуль `window.__ModuleLoader__.load` в `client/index.js`.

Типичный цикл:

1. Установите checkout как зависимость `link:` в профиле DSH.
2. Редактируйте файлы host/client.
3. Перезапустите DSH (preset и клиентские модули загружаются при старте; HMR может обработать часть изменений host).
4. Проверьте маршрут настроек и страницу Plugins.

Полезные проверки:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

Автоматизированного набора тестов пока нет. Маршрут настроек, каталог моделей, процесс доски задач и сохранение после перезапуска — самые ценные ручные проверки.

## Версионирование

Семантическое версионирование. Текущая версия — **1.1.0**; см. [CHANGELOG.md](../CHANGELOG.md). Документы в `docs/` несут ту же версию.

## Лицензия

MIT. См. [LICENSE](../LICENSE).

## Благодарности

Построено на [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) и [Cordis](https://github.com/cordiverse/cordis). Интеграция с доской задач использует плагин [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard); инструменты команды берутся из официального профильного bundle Agent Teams. Спасибо авторам плагинов и всем, кто тестирует режим на реальных исследовательских проектах.
