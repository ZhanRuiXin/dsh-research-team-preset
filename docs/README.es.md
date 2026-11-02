# Research Team Mode

**Un preset de agente de DSH que convierte una sesión en un pequeño equipo de investigación coordinado.**

**Versión 0.1.0** · **Actualizado 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <strong>Español</strong> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Descripción general

Research Team Mode es un preset de agente de DSH para ejecutar investigación de principio a fin como un equipo en lugar de un único chat. El Lead planifica el trabajo, mantiene ambos registros (tarjetas del tablero para las puertas del usuario, tareas de equipo para las etapas internas), despacha el trabajo, integra los resultados y habla con el usuario. Siete especialistas predeterminados cubren la revisión asesora, la literatura y la evidencia, la adquisición de datos, el código, las ejecuciones, la revisión independiente y la redacción de artículos.

El modo está pensado para investigaciones que abarcan días o semanas, que necesitan evidencia trazable y que se benefician de límites de rol claros. No es un modo de preguntas y respuestas de una sola vez: el Lead crea solo los roles que una tarea necesita realmente.

## De un vistazo

| | |
| --- | --- |
| **Roles predeterminados** | 7: advisor, researcher, data, builder, runner, reviewer, writer |
| **Flujo de trabajo** | Basado en puertas: las etapas internas en `team_task_*`, las puertas del usuario en el tablero; crear, reclamar, ejecutar, informar, revisar, aceptación del usuario |
| **Finalización** | `in_review` es la última parada del agente; solo el usuario puede mover una tarjeta a `done` |
| **Enrutamiento de modelos** | Proveedor, modelo y esfuerzo de razonamiento por rol desde un formulario de ajustes de la página de Plugins |
| **Git** | El agente lo inicializa al empezar el trabajo sustantivo; cambios destructivos en una rama; fusión solo tras la aceptación |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + un archivo acotado por tarjeta con puerta; al reanudar se leen PLAN e INDEX primero |
| **Runtime** | PTC (`run_code` + SDK generado), una capa de subagente por miembro |

## Para quién es

- Proyectos de investigación que combinan revisión de literatura, implementación, experimentos y producción del artículo.
- Equipos que necesitan un rastro de evidencia desde la afirmación hasta la fuente, el registro de ejecución o el log.
- Usuarios que quieren un asesor y un revisor independiente en lugar de un único agente de propósito general.
- Trabajos en los que el usuario debe tomar la decisión final de aceptación, no el agente.

**No es para:** preguntas factuales rápidas, ediciones de un solo archivo o tareas en las que basta una respuesta puntual. El modo indica al Lead que responda directamente las preguntas simples y que movilice al equipo solo para investigación sustantiva.

## Requisitos

Research Team Mode es un **bundle de DSH a nivel de perfil**. El bundle no instala ni habilita los bundles de perfil que utiliza; el instalador de paquetes de DSH gestiona dependencias npm, no bundles de funcionalidades. Habilita primero las dependencias en el mismo perfil.

| Capacidad | Proveedor | Notas |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Desarrollado contra `0.2.1-rc.5`; otras versiones pueden funcionar, pero no están garantizadas |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Proporciona `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent`, `team_task_*` y los servicios de Team |
| Tablero de tareas | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | Proporciona `taskboard_*` y el tablero de la Web GUI |
| Runtime PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) y [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Forma parte de la base de DSH; habilita `run_code` |
| Git Bash (opcional, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | Añade una herramienta `bash` para los agentes que la necesiten |
| Web GUI | DSH Web/Desktop | Necesaria para el formulario de ajustes y el tablero de tareas |

Si falta una dependencia, el modo aún puede cargarse parcialmente, pero las herramientas de equipo, el tablero o la página de ajustes no estarán disponibles. El gestor de plugins no solicita estos bundles ni los vincula automáticamente.

## Instalación

Este repositorio es un bundle local de DSH. Desde una copia de trabajo:

1. **Habilita los requisitos previos** en el perfil de destino:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Tablero de tareas: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Opcionalmente [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) en Windows.
2. **Instala este bundle** con la acción de instalación de la página de Plugins o del gestor de plugins, usando un enlace local:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   También funciona una ruta de carpeta local. Mantén el enlace si prevés actualizar desde esta copia de trabajo; reinstala después de reemplazar la carpeta.
3. **Reinicia DSH.** Las filas de preset y la parte cliente del bundle se cargan al arrancar.
4. **Comprueba que el bundle está habilitado** en el mismo perfil.
5. **Abre una sesión nueva** y elige **Research Team Mode** en el selector de modo.
6. Para las sesiones de ejecución del tablero de tareas, crea tarjetas con `presetId=research-team` para que la ejecución use la misma persona y las mismas herramientas.

> El modo es un bundle a nivel de perfil: instalarlo en un perfil no lo habilita en otro. Repite los pasos de instalación y de requisitos previos en cada perfil.

## Primera ejecución

Pide al Lead que compruebe el entorno y el tablero antes de empezar el trabajo real:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

Una primera tarea típica:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create only at user gates -> team_task_create -> send_message
Members: team_task_update (claim) -> work -> complete + send_message; gated steps also claim the card
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Equipo predeterminado

| Rol | Responsabilidad |
| --- | --- |
| `advisor` | Evaluación independiente de la dirección, el enfoque, las afirmaciones centrales, la suficiencia de la evidencia y la estrategia del artículo; recomienda continuar / revisar / detenerse. Solo asesoramiento, no una puerta |
| `researcher` | Búsqueda de literatura, adquisición, lectura atenta, extracción de evidencia y una tabla de evidencia afirmación → fuente → ubicación |
| `data` | Adquisición de conjuntos de datos y pesos de modelos externos, con disponibilidad de la fuente y estado de licencia/acceso, herramientas de descarga con reanudación y manejo de límites de tasa, verificación de integridad contra hashes del editor, descompresión, contrato de manifiesto, muestra pequeña validada y registro de disco. No escribe código de entrenamiento ni modifica el protocolo de evaluación |
| `builder` | Código, configuración, canalizaciones de datos, pruebas y puntos de entrada reproducibles; sin entrenamientos largos |
| `runner` | Iniciar y monitorear entrenamiento/evaluación; registrar ids de ejecución, configuraciones, semillas, métricas, logs, checkpoints y rutas de artefactos |
| `reviewer` | Verificación independiente de las notas de literatura, el código, los resultados y las afirmaciones/citas del artículo; PASS/FAIL con evidencia bloqueante |
| `writer` | Borrador de artículo en LaTeX: prosa, secciones, tablas, pies de figura, citas y código de figuras; no ejecuta experimentos ni cambia código/modelos |

El Lead se encarga de la aclaración del objetivo, la descomposición, la gestión del tablero, el despacho, la integración, los resúmenes, el ensamblaje final de los activos y la entrega. Los miembros pueden usar una capa de subagente para una subtarea acotada; no pueden crear compañeros de equipo.

## Flujo de trabajo del tablero de tareas

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Solo las etapas que esperan la revisión o aceptación del usuario reciben una tarjeta del tablero: hitos de entregable, decisiones de alcance que el usuario debe confirmar, cambios de riesgo y la entrega final. Las etapas internas, las subtareas autoaprobadas y los traspasos entre miembros se siguen en `team_task_*` y quedan fuera del tablero; al llegar a la puerta, la tarjeta conserva el entregable, sus pruebas y el veredicto de revisión. Los miembros del equipo se coordinan internamente en inglés; las respuestas al usuario, las tarjetas y los entregables siguen el idioma del usuario. Cuando una decisión o información faltante corresponde al usuario, el Lead pregunta directamente con `ask_user_question` en lugar de dejar un estado de espera en la tarjeta. Si la pregunta agota el tiempo, el Lead pide una recomendación independiente al advisor, la registra y continúa el trabajo.

## Flujo de trabajo con Git

El modo inicializa el seguimiento duradero cuando empieza el trabajo sustantivo, y el agente decide si una petición es trabajo real o una pregunta simple. En un espacio de trabajo que aún no está dentro de un repositorio, el agente llama a `research_workspace_init`, que crea `worklog/PLAN.md` y `worklog/INDEX.md` y ejecuta `git init`. Nunca crea un repositorio anidado ni hace commit del andamiaje.

Los cambios destructivos o de riesgo se hacen en una rama con el nombre del paso, por ejemplo `task/<title>+<id>` (la tarjeta para el trabajo con puerta, la tarea de equipo para el trabajo interno), en lugar de editar la rama predeterminada. La tarjeta o la tarea de equipo registran los commits base y head, y el reviewer lee `git diff <base>..<head>` como base de la revisión de código y vuelve a ejecutar las comprobaciones de aceptación.

Una rama solo se fusiona después de que la tarjeta sea aceptada, y luego se elimina. Los artefactos generados, como conjuntos de datos, checkpoints, logs y cachés, quedan fuera del repositorio. Si el proyecto no es un repositorio git, la revisión recurre a una instantánea de hashes de archivos y a la evidencia registrada en la tarjeta.

## Worklog

El trabajo que puede abarcar varias sesiones mantiene un registro pequeño y acotado junto al código. `worklog/PLAN.md` contiene el objetivo, el hito actual, las tarjetas activas, los bloqueos y las decisiones fechadas; `worklog/INDEX.md` contiene una línea por tarjeta activa. Cada tarjeta recibe `worklog/<task-id>.md` con un bloque de estado actual arriba y entradas breves solo de adición debajo.

Al reanudar, el agente lee primero PLAN e INDEX y luego solo el bloque de estado y el final de la tarjeta objetivo, nunca el archivo entero ni el directorio entero. PLAN se mantiene por debajo de unas 100 líneas, los archivos de tarjeta por debajo de unas 200, y las tarjetas terminadas se retiran del índice. Las plantillas compactas de los tres archivos están en la persona del preset, así que cualquier sesión puede crearlas o actualizarlas sin leer este repositorio.

## Perfiles de modelo del equipo

La página de ajustes mantiene varios perfiles de modelo con nombre para los miembros predeterminados del equipo y usa el seleccionado en el siguiente spawn.

Abre:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

La barra de perfiles en la parte superior de la página:

- **Cambiar** el perfil (desplegable `团队配置`) que usará el siguiente compañero de equipo predeterminado.
- **新建配置** añade un perfil con siete filas de rol vacías.
- **配置名称** cambia el nombre del perfil seleccionado. Los nombres son obligatorios, únicos y de 60 caracteres como máximo.
- **删除配置** elimina el perfil seleccionado tras un segundo clic de confirmación. El último perfil restante no se puede eliminar.

Cada perfil tiene una fila por miembro predeterminado:

- **Modelo**: un desplegable que contiene los modelos de todos los proveedores, con encabezados de grupo de proveedores no clicables. Al seleccionar un modelo se establecen a la vez el proveedor y el modelo.
- **Esfuerzo de razonamiento**: un segundo desplegable con los esfuerzos anunciados del modelo seleccionado, más una opción de valor predeterminado del modelo.

Un modelo vacío significa «heredar la ruta del Lead»; un esfuerzo vacío significa «usar el valor predeterminado del modelo». `spawn_teammate_with_model` lee el valor predeterminado por rol del perfil seleccionado cuando se omite `model`; un `model` explícito lo anula. El `spawn_teammate` simple siempre hereda del Lead.

La lista completa de perfiles se guarda en conjunto, así que cambiar de perfil no descarta las ediciones hechas en otro. La página valida los nombres antes de guardar y muestra el texto de error del servidor cuando se rechaza un guardado.

El nombre de la fila importa: `research-team-settings` debe permanecer en la **raíz del paquete** `@local/dsh-research-team-preset`. El escáner de módulos de cliente de DSH solo descubre `dsh.client` en filas que son exactamente la raíz del paquete; un nombre con subruta inicia el plugin host pero nunca carga la página.

### Dónde se guardan los ajustes

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "version": 2,
  "activeProfileId": "default",
  "profiles": [
    {
      "id": "default",
      "name": "默认配置",
      "roles": {
        "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
        "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    },
    {
      "id": "p-example",
      "name": "快速实验",
      "roles": {
        "advisor": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    }
  ]
}
```

- `activeProfileId` indica el perfil que usará el siguiente compañero de equipo. El servidor recurre al primer perfil si falta o es desconocido.
- Un archivo heredado (`{ "roles": { ... } }` o un mapa de roles sin envoltorio) se migra en memoria a un único perfil llamado `默认配置`; el archivo se reescribe con la forma de perfiles en el siguiente guardado. Un `POST { "roles": ... }` heredado actualiza solo el perfil activo, así que los scripts antiguos no pueden eliminar los demás perfiles.
- El archivo JSON es la fuente de verdad. El plugin host lo carga al arrancar; `getSettings()` y `modelForRole()` se refrescan desde él, de modo que la página y el siguiente compañero de equipo ven los valores más recientes.
- Un archivo ausente o temporalmente ilegible conserva la última instantánea buena en memoria en lugar de borrarla.
- El archivo de ajustes **no** está en este repositorio. Haz una copia de seguridad por separado. Es por `DSH_HOME`, no por perfil.
- No se almacenan credenciales; solo nombres de perfil y cadenas de proveedor/modelo/esfuerzo.
- Al guardar los ajustes se aplican sin reiniciar DSH: el almacén vuelve a leer el archivo y el siguiente spawn resuelve el perfil activo. Cambiar el código de este plugin sí necesita un reinicio de DSH, porque la mitad host registra una ruta WebSocket/HTTP y una ranura de la página de Plugins a nivel host.
- La versión 0.1.0 corrige un error del cargador de compilaciones anteriores: el archivo envuelve los roles bajo `"roles"`, y el cargador antiguo pasaba el objeto completo al normalizador de roles, produciendo ajustes totalmente vacíos tras reiniciar. El cargador actual desenvuelve `"roles"`, migra los archivos antiguos y admite un mapa de roles sin envoltorio por compatibilidad.

## Referencia de configuración

| Ajuste | Ubicación | Notas |
| --- | --- | --- |
| Id de preset | `cordis.patch.yml` | `research-team`; las tarjetas de tarea deben usar `presetId=research-team` |
| Persona | `cordis.patch.yml` | Prompt del sistema en inglés; reglas para todo el modo |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Establece `false` para eliminar `spawn_teammate_with_model` y su envoltorio de servicio |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Proveedores de subagente que usa la herramienta de spawn modelada; valores predeterminados `spawn` / `fork` |
| Fila `research-team-settings` | `cordis.patch.yml` | Fila host de nivel superior; mantén el nombre en la raíz del paquete |
| Perfiles de modelo del equipo | `$DSH_HOME/research-team-settings.json` | Perfiles con nombre; el perfil activo aporta provider/model/reasoningEffort para los siete roles predeterminados |

## Estructura del repositorio

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
│   └── settings-store.js         # Shared profile snapshot + disk refresh
├── settings/
│   └── index.js                  # Profile file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config profile editor (model/effort dropdowns)
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

## Cómo funciona

- **Preset**: `cordis.patch.yml` declara la persona, las filas de herramientas, el submódulo de compañeros modelados y la fila de ajustes de nivel superior.
- **Prompt del tablero de tareas**: `plugin/index.js` registra una sección de protocolo en inglés (`plugin:dsh-taskboard`) en el ámbito del preset y proporciona `research_project` para resolver el espacio de trabajo actual.
- **Enrutamiento por rol**: `plugin/modeled-teammates.js` envuelve `subagents.startActivation` con `AsyncLocalStorage` e inyecta `agentOptions` solo para una llamada a `spawn_teammate_with_model`. El paquete oficial Agent Teams no se modifica. Cordis expone los servicios como un proxy rastreable, así que el envoltorio comprueba su propio descriptor de propiedad en lugar de la identidad del método.
- **Ajustes**: `settings/index.js` carga y guarda el archivo JSON de perfiles y sirve `GET/POST /api/dsh-research-team-settings`; `client/index.js` registra el editor de perfiles de la página de Plugins mediante `plugins.row.config`.
- **Actualización**: `plugin/settings-store.js` mantiene la instantánea en memoria, resuelve el perfil activo en cada lectura y spawn, y conserva la última instantánea buena si una lectura falla.

## Lista de verificación

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
新建配置 -> ponle un nombre -> guarda -> vuelve a abrir la página -> ambos perfiles listados
selecciona otro perfil -> guarda -> spawn_teammate_with_model lo usa
elimina un perfil -> guarda -> solo queda el perfil restante
archivo heredado {roles} -> reinicia -> aparece como 默认配置
guarda el modelo de un rol -> reinicia -> la página sigue mostrándolo
```

La ruta de persistencia de los ajustes se puede comprobar sin la interfaz:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Solución de problemas

### Los ajustes parecen restablecerse después de reiniciar

La versión 0.1.0 corrige la causa conocida: el cargador antiguo pasaba todo el objeto `{ roles: ... }` al normalizador de roles y producía ajustes totalmente vacíos. Actualiza a 0.1.0 o posterior, reinicia DSH y comprueba que:

- `$DSH_HOME/research-team-settings.json` existe y contiene los perfiles guardados;
- los archivos antiguos `{ "roles": ... }` se muestran como un único perfil `默认配置` y se reescriben con la forma de perfiles en el siguiente guardado;
- la fila `research-team-settings` se llama exactamente `@local/dsh-research-team-preset`;
- el host actual ejecuta esta copia de trabajo, no una copia instalada obsoleta.

### La página de ajustes no aparece en Plugins

- La fila debe ser la raíz del paquete, no `@local/dsh-research-team-preset/settings`.
- La parte cliente necesita un reinicio de DSH y una recarga del navegador después de la instalación.
- Comprueba que el bundle está habilitado en el perfil.

### Faltan las herramientas de equipo

Habilita [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) en el mismo perfil y reinicia. El instalador no lo solicita.

### Faltan las herramientas del tablero de tareas

Habilita [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) en el mismo perfil y reinicia.

### `spawn_teammate_with_model` no está disponible

El submódulo envuelve un servicio interno de subagentes. Una actualización de DSH puede cambiar la forma de la activación. Revisa el texto del fallo; si el envoltorio no se puede instalar, establece `research-modeled-teammates.enabled: false`, reinicia y usa el `spawn_teammate` simple.

### El preset no aparece en la lista

Confirma que el bundle está instalado y habilitado, reinicia DSH y abre una sesión nueva. Las declaraciones de preset se cargan al arrancar.

### `research_project` no puede resolver el espacio de trabajo

Abre el directorio de trabajo como proyecto/espacio de trabajo de DSH en la GUI o pasa un proyecto conocido; la herramienta no adivina.

## Limitaciones conocidas

- El enrutamiento de modelos por rol es un envoltorio de servicio interno, no una extensión oficial de Agent Teams. Las actualizaciones de DSH pueden romperlo; el respaldo está documentado arriba.
- Las dependencias a nivel de perfil no se instalan ni se habilitan automáticamente. Este repositorio las documenta pero no las gestiona.
- Los perfiles de modelo del equipo viven en un archivo JSON independiente bajo `$DSH_HOME`; no forman parte de la exportación/copia de seguridad estándar de la configuración de DSH. Copia el archivo si cambias de máquina.
- El menú de modelos es un `<select>` nativo con grupos de proveedores, no un selector personalizado con búsqueda.
- El modo no genera automáticamente siete compañeros de equipo al iniciar la sesión. El Lead crea los roles según lo requiera la tarea.
- El modo nunca inicializa un repositorio dentro de un repositorio existente, y nunca hace commit por su cuenta del worklog ni del andamiaje del repositorio.
- Los miembros pueden usar una capa de subagente; la delegación más profunda está deshabilitada intencionalmente.

## Desarrollo

Este repositorio es un bundle local de DSH sin paso de compilación para el código host. La página de cliente es un módulo precompilado `window.__ModuleLoader__.load` en `client/index.js`.

Ciclo típico:

1. Instala la copia de trabajo como dependencia `link:` en un perfil de DSH.
2. Edita los archivos host/cliente.
3. Reinicia DSH (el preset y los módulos de cliente se cargan al arrancar; HMR puede gestionar algunos cambios del host).
4. Inspecciona la ruta de ajustes y la página de Plugins.

Comprobaciones útiles:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

Todavía no hay una suite de pruebas automatizada. La ruta de ajustes, el catálogo de modelos, el flujo del tablero de tareas y la persistencia tras reiniciar son las comprobaciones manuales de mayor valor.

## Versionado

Versionado semántico. La versión actual es **0.1.0**; consulta [CHANGELOG.md](../CHANGELOG.md). La documentación bajo `docs/` lleva la misma versión.

## Licencia

MIT. Consulta [LICENSE](../LICENSE).

## Agradecimientos

Construido sobre [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) y [Cordis](https://github.com/cordiverse/cordis). La integración con el tablero de tareas usa el plugin [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard); las herramientas de equipo provienen del bundle oficial del perfil Agent Teams. Gracias a los autores de los plugins y a todas las personas que prueban el modo en proyectos de investigación reales.
