# Research Team Mode

**Un preset de agente de DSH que convierte una sesión en un pequeño equipo de investigación coordinado.**

**Versión 1.0.0** · **Actualizado 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <strong>Español</strong> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Descripción general

Research Team Mode es un preset de agente de DSH para ejecutar investigación de principio a fin como un equipo en lugar de un único chat. El Lead planifica el trabajo, mantiene el tablero de tareas, despacha las tarjetas, integra los resultados y habla con el usuario. Seis especialistas predeterminados cubren la revisión asesora, la literatura y la evidencia, el código, las ejecuciones, la revisión independiente y la redacción de artículos.

El modo está pensado para investigaciones que abarcan días o semanas, que necesitan evidencia trazable y que se benefician de límites de rol claros. No es un modo de preguntas y respuestas de una sola vez: el Lead crea solo los roles que una tarea necesita realmente.

## De un vistazo

| | |
| --- | --- |
| **Roles predeterminados** | 6: advisor, researcher, builder, runner, reviewer, writer |
| **Flujo de trabajo** | Primero el tablero de tareas: crear, reclamar, ejecutar, informar, revisar, aceptación del usuario |
| **Finalización** | `in_review` es la última parada del agente; solo el usuario puede mover una tarjeta a `done` |
| **Enrutamiento de modelos** | Proveedor, modelo y esfuerzo de razonamiento por rol desde un formulario de ajustes de la página de Plugins |
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
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Proporciona `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` y los servicios de Team |
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
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Equipo predeterminado

| Rol | Responsabilidad |
| --- | --- |
| `advisor` | Evaluación independiente de la dirección, el enfoque, las afirmaciones centrales, la suficiencia de la evidencia y la estrategia del artículo; recomienda continuar / revisar / detenerse. Solo asesoramiento, no una puerta |
| `researcher` | Búsqueda de literatura, adquisición, lectura atenta, extracción de evidencia y una tabla de evidencia afirmación → fuente → ubicación |
| `builder` | Código, configuración, canalizaciones de datos, pruebas y puntos de entrada reproducibles; sin entrenamientos largos |
| `runner` | Iniciar y monitorear entrenamiento/evaluación; registrar ids de ejecución, configuraciones, semillas, métricas, logs, checkpoints y rutas de artefactos |
| `reviewer` | Verificación independiente de las notas de literatura, el código, los resultados y las afirmaciones/citas del artículo; PASS/FAIL con evidencia bloqueante |
| `writer` | Borrador de artículo en LaTeX: prosa, secciones, tablas, pies de figura, citas y código de figuras; no ejecuta experimentos ni cambia código/modelos |

El Lead se encarga de la aclaración del objetivo, la descomposición, la gestión del tablero, el despacho, la integración, los resúmenes, el ensamblaje final de los activos y la entrega. Los miembros pueden usar una capa de subagente para una subtarea acotada; no pueden crear compañeros de equipo.

## Flujo de trabajo del tablero de tareas

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

El tablero es el único registro de tareas. No lleves el seguimiento de los entregables solo en el chat. `team_task_*` es para la coordinación transitoria, no para los entregables.

## Ajustes de modelo por rol

Abre:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

Cada miembro predeterminado ocupa una fila:

- **Modelo**: un desplegable que contiene los modelos de todos los proveedores, con encabezados de grupo de proveedores no clicables. Al seleccionar un modelo se establecen a la vez el proveedor y el modelo.
- **Esfuerzo de razonamiento**: un segundo desplegable con los esfuerzos anunciados por el modelo seleccionado, más una opción de valor predeterminado del modelo.

Un modelo vacío significa «heredar la ruta del Lead»; un esfuerzo vacío significa «usar el valor predeterminado del modelo». `spawn_teammate_with_model` lee el valor predeterminado por rol cuando se omite `model`; un `model` explícito lo anula. El `spawn_teammate` simple siempre hereda del Lead.

El nombre de la fila importa: `research-team-settings` debe permanecer en la **raíz del paquete** `@local/dsh-research-team-preset`. El escáner de módulos de cliente de DSH solo descubre `dsh.client` en filas que son exactamente la raíz del paquete; un nombre con subruta inicia el plugin host pero nunca carga la página.

### Dónde se guardan los ajustes

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

- El archivo JSON es la fuente de verdad. El plugin host lo carga al arrancar; `getSettings()` y `modelForRole()` se refrescan desde él, de modo que la página y el siguiente compañero de equipo ven los valores más recientes.
- Un archivo ausente o temporalmente ilegible conserva la última instantánea buena en memoria en lugar de borrarla.
- El archivo de ajustes **no** está en este repositorio. Haz una copia de seguridad por separado. Es por `DSH_HOME`, no por perfil.
- No se almacenan credenciales; solo cadenas de proveedor/modelo/esfuerzo.
- Al guardar los ajustes, se aplican sin reiniciar DSH. El reinicio es necesario para la primera instalación de la fila/página de ajustes y para los cambios de preset/plugin.
- La versión 1.0.0 corrige un error del cargador de compilaciones anteriores: el archivo envuelve los roles bajo `"roles"`, y el cargador antiguo pasaba el objeto completo al normalizador de roles, produciendo ajustes totalmente vacíos tras reiniciar. El cargador actual desenvuelve `"roles"` y admite un mapa de roles sin envoltorio por compatibilidad.

## Referencia de configuración

| Ajuste | Ubicación | Notas |
| --- | --- | --- |
| Id de preset | `cordis.patch.yml` | `research-team`; las tarjetas de tarea deben usar `presetId=research-team` |
| Persona | `cordis.patch.yml` | Prompt del sistema en inglés; reglas para todo el modo |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Establece `false` para eliminar `spawn_teammate_with_model` y su envoltorio de servicio |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Proveedores de subagente que usa la herramienta de spawn modelada; valores predeterminados `spawn` / `fork` |
| Fila `research-team-settings` | `cordis.patch.yml` | Fila host de nivel superior; mantén el nombre en la raíz del paquete |
| Rutas por rol | `$DSH_HOME/research-team-settings.json` | Proveedor/modelo/reasoningEffort para los seis roles predeterminados |

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

## Cómo funciona

- **Preset**: `cordis.patch.yml` declara la persona, las filas de herramientas, el submódulo de compañeros modelados y la fila de ajustes de nivel superior.
- **Prompt del tablero de tareas**: `plugin/index.js` registra una sección de protocolo en inglés (`plugin:dsh-taskboard`) en el ámbito del preset y proporciona `research_project` para resolver el espacio de trabajo actual.
- **Enrutamiento por rol**: `plugin/modeled-teammates.js` envuelve `subagents.startActivation` con `AsyncLocalStorage` e inyecta `agentOptions` solo para una llamada a `spawn_teammate_with_model`. El paquete oficial Agent Teams no se modifica.
- **Ajustes**: `settings/index.js` carga y guarda el archivo JSON y sirve `GET/POST /api/dsh-research-team-settings`; `client/index.js` registra el formulario de fila de la página de Plugins mediante `plugins.row.config`.
- **Actualización**: `plugin/settings-store.js` mantiene la instantánea en memoria, se refresca desde el disco en las lecturas y en los spawns, y conserva la última instantánea buena si una lectura falla.

## Lista de verificación

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

La ruta de persistencia de los ajustes se puede comprobar sin la interfaz:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Solución de problemas

### Los ajustes parecen restablecerse después de reiniciar

La versión 1.0.0 corrige la causa conocida: el cargador antiguo pasaba todo el objeto `{ roles: ... }` al normalizador de roles y producía ajustes totalmente vacíos. Actualiza a 1.0.0 o posterior, reinicia DSH y comprueba que:

- `$DSH_HOME/research-team-settings.json` existe y contiene los roles guardados;
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
- Los ajustes de rol viven en un archivo JSON independiente bajo `$DSH_HOME`; no forman parte de la exportación/copia de seguridad estándar de la configuración de DSH. Copia el archivo si cambias de máquina.
- El menú de modelos es un `<select>` nativo con grupos de proveedores, no un selector personalizado con búsqueda.
- El modo no genera automáticamente seis compañeros de equipo al iniciar la sesión. El Lead crea los roles según lo requiera la tarea.
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

Versionado semántico. La versión actual es **1.0.0**; consulta [CHANGELOG.md](../CHANGELOG.md). La documentación bajo `docs/` lleva la misma versión.

## Licencia

MIT. Consulta [LICENSE](../LICENSE).

## Agradecimientos

Construido sobre [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) y [Cordis](https://github.com/cordiverse/cordis). La integración con el tablero de tareas usa el plugin [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard); las herramientas de equipo provienen del bundle oficial del perfil Agent Teams. Gracias a los autores de los plugins y a todas las personas que prueban el modo en proyectos de investigación reales.
