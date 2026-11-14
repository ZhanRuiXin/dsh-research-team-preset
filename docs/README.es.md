# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**Un preset de agente de DSH que convierte una sesión en un pequeño equipo de investigación coordinado.**

**Versión 0.2.2** · **Actualizado 2026-11-14**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <strong>Español</strong> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Descripción general

Research Team Mode es un preset de agente de DSH para llevar a cabo investigacion de extremo a extremo en equipo en lugar de en un solo chat. El Lead planifica el trabajo, mantiene el registro del worklog (archivos de elementos de trabajo para las puertas del usuario, filas del INDEX para los pasos internos), reparte trabajo, integra resultados y se comunica con el usuario. Ocho roles por defecto cubren asesoria, literatura y evidencia, obtencion de datos, diseno de experimentos, codigo, ejecuciones, revision independiente y redaccion del paper.

El modo está pensado para investigaciones que abarcan días o semanas, que necesitan evidencia trazable y que se benefician de límites de rol claros. No es un modo de preguntas y respuestas de una sola vez: el Lead crea solo los roles que una tarea necesita realmente.

## De un vistazo

| | |
| --- | --- |
| **Roles predeterminados** | 8: advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **Flujo de trabajo** | Por puertas: los pasos internos son filas del indice del worklog, las puertas del usuario son archivos de elementos de trabajo; crear, tomar, ejecutar, informar, revisar y aceptacion del usuario |
| **Finalización** | `in_review` es la última parada del agente; solo el usuario puede mover un elemento de trabajo a `done` |
| **Enrutamiento de modelos** | Proveedor, modelo y esfuerzo de razonamiento por rol desde un formulario de ajustes de la página de Plugins |
| **Git** | El agente lo inicializa al empezar el trabajo sustantivo; cambios destructivos en una rama; fusión solo tras la aceptación |
| **Worklog** | Almacén JSON en `.research/worklog/`; `PLAN.md` e `INDEX.md` son vistas generadas; al reanudar, primero `research_state` |
| **Runtime** | PTC (`run_code` + SDK generado), una capa de subagente por miembro |

## Para quién es

- Proyectos de investigación que combinan revisión de literatura, implementación, experimentos y producción del artículo.
- Equipos que necesitan un rastro de evidencia desde la afirmación hasta la fuente, el registro de ejecución o el log.
- Usuarios que quieren un asesor y un revisor independiente en lugar de un único agente de propósito general.
- Trabajos en los que el usuario debe tomar la decisión final de aceptación, no el agente.

**No es para:** preguntas factuales rápidas, ediciones de un solo archivo o tareas en las que basta una respuesta puntual. El modo indica al Lead que responda directamente las preguntas simples y que movilice al equipo solo para investigación sustantiva.

## Cómo te habla el Lead

Las respuestas del Lead son comunicación científica, no un feed de estado: primero la afirmación o el resultado, con la evidencia que lo respalda (run id, conjunto de datos, métrica con incertidumbre y tamaño de muestra, fuente), después lo que sigue siendo incierto y, por último, lo que tú tienes que decidir. Cada afirmación se etiqueta como hecho observado, inferencia, hipótesis o pregunta abierta, y el método se explica hasta donde haga falta para que puedas seguir aprendiendo.

La mecánica interna se queda dentro. Los traspasos entre agentes, los reintentos, los errores de herramientas, la contabilidad del worklog y lo que el equipo aprendió mientras trabajaba no se reenvían salvo que cambien la lectura de un resultado o bloqueen una decisión. Los informes de los miembros se traducen en una afirmación, su evidencia y sus límites, no se pegan.

La división del trabajo es explícita: tú marcas la dirección científica y juzgas la evidencia, y el equipo asume la carga de búsqueda, implementación, experimentación y verificación.

Tus preguntas son el contrato de este turno. Si pides un panorama, una lista de extensiones o una decisión, la respuesta entrega eso; un programa de investigación, una puerta o un criterio de parada es adicional y nunca lo sustituye. La respuesta recorre tus preguntas en orden, contesta cada una con su evidencia y el archivo donde está el detalle completo, y dice con claridad si alguna todavía no puede responderse.

Un turno largo no es un turno silencioso. Si el equipo lleva más de unos diez minutos trabajando, el Lead envía una respuesta intermedia breve: qué está resuelto, qué se sigue reuniendo y cuándo llegará la siguiente respuesta, para que puedas redirigir antes de gastar el cómputo.

Un resultado negativo previo limita el método, los datos y el presupuesto que lo produjeron, no la idea. Antes de cerrar una dirección se formula su versión más fuerte y se muestra que falla; cada «no se puede afirmar» viene con la versión que sí podría afirmarse y la evidencia que la ganaría.

## Requisitos

| Capacidad | Proveedor | Notas |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Desarrollado contra `0.2.2-rc.3`; otras versiones pueden funcionar, pero no están garantizadas |
| Agent Teams | [`@deepseek-ai/dsh-agent-team`](https://github.com/deepseek-ai/deepseek-harness) | Proporciona `send_message`, `wait_agent`, `interrupt_agent` y los servicios de Team; el preset registra su trabajo en el worklog, no en tareas de equipo |
| Runtime PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) y [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Forma parte de la base de DSH; habilita `run_code` |

**Integraciones opcionales.** Estos plugins son de otros autores. El preset funciona sin ellos y no instala ninguno; añade uno solo para enlazar el equipo con él:

- **Zotero** (`dsh-zotero`) — las herramientas de la biblioteca compartida (`zotero_*`) y la ruta de importación de paper-fetch. Sin él, el trabajo bibliográfico usa Semantic Scholar, arXiv y la web, y la tabla de evidencia sigue registrando afirmación, fuente y ubicación.
- **Mnemon** (`dsh-mnemon`) — notas duraderas entre sesiones (`mnemon_*`). Sin él, el worklog y `CHANGELOG.md` aportan continuidad.

Si falta una dependencia, el modo aún puede cargarse parcialmente, pero las herramientas de equipo, el worklog o la página de ajustes no estarán disponibles. El gestor de plugins no solicita estos bundles ni los vincula automáticamente.

## Instalación

Este preset se distribuye como bundle DSH y se publica en npm como `dsh-research-team-preset`.

### Instalar desde la página de Plugins de DSH

2. Abre **Ajustes → Plugins** y haz clic en **Añadir**.
3. Pega el origen de instalación: `dsh-research-team-preset@0.2.2` para el paquete npm, `github:ZhanRuiXin/dsh-research-team-preset#v0.2.2` para fijar el código fuente, o `link:/absolute/path/to/dsh-research-team-preset` para un checkout local.
4. **Reinicia DSH.** Las filas del preset y la mitad cliente del bundle se cargan al iniciar.
5. **Comprueba que el bundle está habilitado** en el mismo perfil, luego **abre una sesión nueva** y elige **Research Team Mode** en el selector de modo.

### Instalar desde la línea de comandos

```text
dsh plugin add dsh-research-team-preset@0.2.2
```

Para fijar el código fuente en lugar del registro:

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.2.2
```

> El modo es un bundle a nivel de perfil: instalarlo en un perfil no lo habilita en otro. Repite la instalación y los prerrequisitos en cada perfil.

## Primera ejecución

Pide al Lead que compruebe el entorno y el worklog antes de empezar el trabajo real:

```text
list_agents                    # create only the roles the task needs
research_project               # resolve the current project root
research_workspace_init        # seed .research/worklog/ and render the views if missing
```

Una primera tarea típica:

Con la colaboración de equipo activada, el host también inyecta su propia política de Agent Teams, que llama a `team_task_*` el tablero de tareas compartido. El registro se queda aquí: usa las tareas de equipo solo para encargos internos que no necesitan registro duradero, y mantén las puertas, la evidencia, las decisiones, los manifiestos de ejecución y la aceptación del usuario en `.research/worklog/` y `runs/`. Una tarea de equipo completada nunca sustituye una puerta del worklog.

Un elemento de trabajo puede llevar entregables: el panel muestra un botón por archivo y al pulsarlo se abre en la barra lateral derecha. Regístralos con `research_worklog` op=update y `deliverables: [{ label, path }]`, con `path` relativo a la raíz del proyecto (o `url` para un enlace http(s)).

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> research_state -> research_worklog op=update (status=todo, next) + send_message
Members: research_worklog op=claim -> work -> research_worklog op=gate (evidence, next) + send_message
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (research_worklog op=update, by="user")
```

## Equipo predeterminado

| Rol | Responsabilidad |
| --- | --- |
| `advisor` | Evaluación independiente de la dirección, el enfoque, las afirmaciones centrales, la suficiencia de la evidencia y la estrategia del paper. Constructivo por defecto: qué se sostiene, los pocos problemas que amenazan el resultado, la reparación mínima o una alternativa concreta para cada uno y, al final, proceed / revise / stop. Solo asesoramiento, no es una puerta |
| `researcher` | Búsqueda de literatura, adquisición, lectura atenta, extracción de evidencia y una tabla de evidencia afirmación → fuente → ubicación. Primero busca en la biblioteca compartida de Zotero, importa el artículo completo en su versión formal, con su PDF, cuando falta una obra necesaria, deduplica por DOI y título y comparte las referencias `zotero://` con el equipo |
| `data` | Adquisición de conjuntos de datos y pesos de modelos externos, con disponibilidad de la fuente y estado de licencia/acceso, herramientas de descarga con reanudación y manejo de límites de tasa, verificación de integridad contra hashes del editor, descompresión, contrato de manifiesto, muestra pequeña validada y registro de disco. No escribe código de entrenamiento ni modifica el protocolo de evaluación |
| `designer` | Es responsable del documento de diseño del experimento: preguntas e hipótesis, protocolo y controles, líneas base, ablaciones, métricas y plan estadístico, presupuesto de cómputo y control de cambios de diseño mientras las ejecuciones están en curso; no escribe código de producción ni ejecuta experimentos |
| `builder` | Código, configuración, canalizaciones de datos, pruebas y puntos de entrada reproducibles; sin entrenamientos largos |
| `runner` | Iniciar y monitorear entrenamiento/evaluación; registrar ids de ejecución, configuraciones, semillas, métricas, logs, checkpoints y rutas de artefactos |
| `reviewer` | Verificación independiente de las notas de literatura, el código, los resultados y las afirmaciones/citas del artículo; PASS/FAIL con evidencia bloqueante |
| `writer` | Borrador de artículo en LaTeX: prosa, secciones, tablas, pies de figura, citas y código de figuras; no ejecuta experimentos ni cambia código/modelos |

El Lead se encarga de la aclaración del objetivo, la descomposición, la gestión del worklog, el despacho, la integración, los resúmenes, el ensamblaje final de los activos y la entrega. Los miembros pueden usar una capa de subagente para una subtarea acotada; no pueden crear compañeros de equipo. El Lead mantiene ligero su propio uso de herramientas, prefiere una breve actualización al usuario antes que otra llamada rutinaria y deja el trabajo profundo al miembro correspondiente.

### Biblioteca compartida de Zotero

El researcher considera la biblioteca de Zotero del usuario como la fuente de literatura compartida del equipo. Busca en las colecciones y los elementos existentes antes que en la web abierta, reutiliza los PDF adjuntos y los pasajes de anotación e importa un artículo ausente solo en su versión formal de registro, con el PDF adjunto y archivado en una colección del proyecto. Las importaciones deduplican por DOI y título, no tocan las etiquetas ni las colecciones del usuario y registran la referencia de elemento `zotero://` en la tabla de evidencia y en la tarjeta del worklog, de modo que todos los compañeros lean el mismo artículo y el reviewer pueda verificar por muestreo las mismas páginas. Cuando el texto completo está detrás de un muro de pago o solo existen metadatos, el researcher registra el enlace y marca la evidencia como solo metadatos en lugar de importar un sustituto.

### Revisión de asesoramiento

El advisor es un co-pensador científico, no un guardián. Primero nombra qué se sostiene en el plan y por qué; después, como máximo tres problemas ordenados por cuánto amenazan el resultado, cada uno atado a un paso, una afirmación o un número concretos. Cada problema llega con la reparación mínima que haría aceptable el plan, o con una alternativa concreta y su contrapartida; un rechazo sin más no es una revisión. Distingue entre «esto no puede responder a la pregunta» y «esto funciona pero es más débil o más costoso», declara la condición bajo la cual el plan pasa a ser aceptable y termina con proceed, revise con los cambios necesarios o stop con la dirección que conviene tomar en su lugar. Juzga según el estándar al que el proyecto se ha comprometido de verdad y lo nombra, en lugar de suponer el más exigente: un plan sólido para su objetivo declarado no es un fracaso porque una afirmación más fuerte necesitaría más evidencia, y un objetivo equivocado se plantea por separado como una decisión de alcance para ti. Cuando falta la evidencia necesaria para juzgar, nombra la prueba o la fuente más barata que lo resolvería. Un plan sólido recibe un respaldo claro en vez de objeciones fabricadas, y un stop siempre lleva una dirección alternativa. Sigue siendo asesoramiento: el Lead decide y el reviewer sigue siendo la puerta independiente PASS/FAIL.

Cada consulta la prepara el Lead en lugar de reenviar la conversación. El Lead traduce lo que preguntó el usuario en la decisión que el advisor debe responder, con la afirmación o el plan en disputa, la evidencia actual y su alcance, las opciones sobre la mesa, las restricciones y lo que el usuario necesita de la respuesta; una pregunta vaga o sobrecargada se afina primero, y el mensaje original del usuario y el historial interno del equipo no se reenvían. Se consulta una vez por punto de decisión, no para confirmar lo que el Lead ya puede defender con evidencia ni para que resuma el propio trabajo del Lead, y la respuesta llega al usuario como conclusión científica y como la decisión que deja abierta, no como texto reenviado.

## Propiedad del diseño

El Lead no redacta el diseño del experimento. En el trabajo con un diseño intensivo, el designer es responsable de un documento de diseño en el espacio de trabajo del proyecto (`docs/design/<name>.md` o la ubicación de diseño existente del proyecto): la pregunta y las hipótesis, el protocolo y los controles, las líneas base, las ablaciones, las métricas y el plan estadístico, el presupuesto de cómputo y un registro de cambios de diseño realizados mientras las ejecuciones están en curso.

El builder implementa el diseño, el runner lo ejecuta y el reviewer comprueba en la puerta de propuesta que el diseño puede responder a la pregunta y, en la puerta de resultados, que la ejecución coincidió con él. El advisor ofrece una lectura científica independiente en la puerta de propuesta. El Lead confirma que el documento de diseño existe y que las entradas del researcher y de data están listas, y luego admite o devuelve el paso. En el trabajo liderado por la implementación, el builder redacta el diseño y el advisor lo revisa una vez.

## Ámbito de escritura

Cada rol escribe solo dentro de su propio ámbito. Advisor y reviewer no escriben nada; researcher posee `literature/`, `notes/` y `docs/evidence`; data posee `data/`, `manifests/`, scripts de descarga bajo `scripts/` y `reports/`; designer posee `docs/design/`; builder posee `src/`, `configs/` y `tests/`; runner posee `runs/`, `logs/` y `checkpoints/`; writer posee `paper/` y `figures/`; el Lead no tiene restricciones. Leer, buscar y comentar tarjetas sigue abierto a todos.

El ámbito es un contrato, no una preferencia: un cambio que pertenece a otro rol se reporta a su dueño en lugar de escribirlo el miembro equivocado. Advisor y reviewer se lanzan en solo lectura, así que una revisión reporta qué debe cambiar en vez de cambiarlo; un compañero que de verdad necesite escribir fuera de su ámbito recibe una excepción explícita del Lead, registrada en la tarjeta antes de empezar. Cualquier otro rol hereda el permiso de sandbox del Lead, así que un compañero nunca está más restringido que el Lead a menos que su rol lo exija.

Antes de que una tarjeta pase a in_review, el dueño o el Lead ejecuta `research_scope_check` con el rol y las rutas cambiadas o los commits base y head. Una violación se corrige moviendo el cambio a su rol o registrando la excepción aprobada por el Lead, nunca ensanchando el ámbito a mitad de la tarjeta. Un proyecto puede estrechar o ampliar un ámbito en `AGENTS.md` o en la tarjeta; para ese paso manda la tarjeta, de modo que una sesión posterior lea la misma regla.

## Admisión de experimentos

El cómputo se gasta en una decisión, no en actividad. Ninguna ejecución más allá de una prueba de humo trivial empieza hasta que su regla de decisión esté escrita, y la regla debe poder devolver "parar". Antes de lanzar se registra en el documento de diseño o en el worklog: la pregunta que resuelve la ejecución, la hipótesis, el resultado esperado y el tamaño del efecto que contaría como apoyo, el resultado que lo refutaría, el criterio de parada, la línea base que debe superar, el piloto más barato que podría resolverlo y el presupuesto de cómputo. Una ejecución sin este registro no se admite.

Primero el piloto: la configuración más pequeña que todavía pueda refutar la hipótesis (una semilla, un split, un subconjunto, un horizonte más corto), leída contra el umbral preregistrado, y solo después una decisión explícita de escalar. Si el piloto no alcanza el umbral, la línea se detiene, el resultado negativo se registra y se informa, y no se añaden semillas ni variantes para diluir la diferencia. Se cambia una variable a la vez, la confusión se declara antes de ejecutar y cualquier cambio de protocolo a mitad de la ejecución se registra con su motivo. La ejecución también está acotada por el presupuesto, por el mismo fallo repetido dos veces y por una métrica que ha dejado de moverse.

El Lead admite la ejecución, el runner se niega a lanzarla sin el registro previo y el reviewer comprueba en la puerta de resultados que la ejecución coincidió con la regla preregistrada y que una decisión de parada se respetó en lugar de anularse.

## Continuidad entre sesiones

Una sesión es una conversación, no el proyecto: `.research/worklog/`, git y las tarjetas de arquitectura llevan el trabajo; el chat, el equipo y los trabajos en segundo plano no sobreviven a la sesión. Al reanudar, llama primero a `research_state` y luego lee el elemento y su evidencia.

El trabajo que cruza sesiones vive como JSON en `.research/worklog/`: `plan.json` con objetivo, hitos, siguiente paso y decisiones, y un `items/<id>.json` por elemento. `PLAN.md`, `INDEX.md` y las tarjetas los generan las herramientas; no se editan a mano.

Una ejecución o trabajo largo que sobrevive al turno deja su identificador de trabajo o terminal, host, hora de inicio, finalización esperada y la regla de decisión que sirve en el archivo de tarjeta o en PLAN. Al reanudar se comprueba primero que siga vivo; una ejecución huérfana se concilia y se plantea al usuario como adoptar, reiniciar o detener, en lugar de ejecutarla dos veces en silencio. Una tarjeta retenida por una sesión que ya no existe se reporta al usuario para reabrirla y nunca se asume.

## Barra lateral de investigación

El trabajo que puede cruzar sesiones vive como JSON en `.research/worklog/`: `plan.json` con objetivo, hitos, siguiente paso y decisiones, y un `items/<id>.json` por elemento. Los archivos `PLAN.md`, `INDEX.md` y las tarjetas los generan las herramientas; no se editan a mano.

Las tarjetas de arquitectura son diagramas de nodos y aristas guardados como JSON en `.research/architecture/`, un archivo por tarjeta. El agente las lee y actualiza con la herramienta `research_architecture`, de modo que el diagrama siga al diseño en lugar de derivar en una diapositiva. La tarjeta se representa en SVG dentro del panel; al arrastrar un recuadro sobre los nodos se seleccionan, y la selección se puede citar en la conversación; lo que merezca conservarse se guarda en la tarjeta como nota que el agente lee antes de responder. La pestaña se registra mediante `dsh-better-sidebar` cuando ese plugin está instalado y, si no, en la barra lateral derecha nativa.

El panel también muestra al equipo activo: el nombre, el rol, el modelo y el estado (en ejecución o inactivo) de cada miembro, junto con el elemento de trabajo que posee.

La seccion de experimentos lista las ejecuciones de la mas reciente a la mas antigua y muestra cuanto llevan en marcha o cuanto tardaron. Cada ejecucion sigue un ciclo de vida explicito (planificada, pendiente de aprobacion, aprobada, en curso, completada, detenida, fallida o rechazada) y la herramienta `research_experiment` lo impulsa: register escribe la regla, las semillas y el presupuesto, start se niega sin aprobacion y finish registra completada, detenida o fallida con el motivo. La cabecera trae un selector (requiere aprobacion / automatica); una ejecucion en espera muestra aprobar y rechazar, cuya respuesta se escribe en su manifest, y la lista se desplaza dentro de su caja.

El panel es un módulo propio en `panel/`, separado del formulario de ajustes, y se puede activar o desactivar por separado. Aparece como pestaña de la barra lateral derecha en cada conversación.

El diseñador posee las tarjetas que describen el método y el constructor las de implementación, en los grupos que defina el propio proyecto; el asesor las lee antes de revisar una decisión de diseño o implementación, y el revisor las contrasta en la puerta de resultados. Arrastra con el botón central para desplazar el lienzo, usa la barra de herramientas para acercar y arrastra un rectángulo sobre los nodos para seleccionarlos y anotar.

## Registro de trabajo y coordinacion

Los cambios de estado siguen una tabla fija (`todo → in_progress → in_review → done`); `blocked` y `canceled` son estados laterales. `blocked` exige un motivo, una puerta exige al menos una entrada de evidencia, y cada cambio queda en el historial del elemento.

En la puerta, el responsable escribe la lista con evidencia, el resumen de ejecucion, el rango de commits y el siguiente paso en el archivo de tarjeta, ejecuta `research_scope_check` sobre las rutas cambiadas y pone el estado en `in_review`. El reviewer escribe un PASS/FAIL con evidencia; el Lead informa id de tarjeta, estado y evidencia solo al llegar a la puerta o cuando el usuario debe actuar. `done` pertenece a la aceptacion del usuario; `blocked` significa que no se puede continuar y `canceled` que no se continuara.

```text
User goal
Lead:  research_project -> research_state
       -> research_worklog op=update (status=todo, next) + send_message
Member: research_worklog op=claim -> work
        -> research_worklog op=gate (evidence, summary, base..head, next)
Internal steps stay index rows; only items waiting for the user get a card view
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or final review
Lead:  scientific summary (claim, evidence, uncertainty) -> item id/status when a gate needs the user
User:  accept -> research_worklog op=update with by="user" (agents can never do that)
```

## Flujo de trabajo con Git

Los cambios destructivos o de riesgo se hacen en una rama con el nombre del paso, por ejemplo `task/<title>+<id>` (la tarjeta para el trabajo con puerta, la tarea de equipo para el trabajo interno), en lugar de editar la rama predeterminada. La tarjeta o la tarea de equipo registran los commits base y head, y el reviewer lee `git diff <base>..<head>` como base de la revisión de código y vuelve a ejecutar las comprobaciones de aceptación.

Una rama solo se fusiona después de que la tarjeta sea aceptada, y luego se elimina. Los artefactos generados, como conjuntos de datos, checkpoints, logs y cachés, quedan fuera del repositorio. Si el proyecto no es un repositorio git, la revisión recurre a una instantánea de hashes de archivos y a la evidencia registrada en la tarjeta.

## Worklog

Al reanudar, primero `research_state` y después `research_worklog op=get` para el elemento y su evidencia más reciente. Las vistas son solo espejos; la fuente es el JSON.

## Perfiles de modelo del equipo

La página de ajustes mantiene varios perfiles de modelo con nombre para los miembros predeterminados del equipo y usa el seleccionado en el siguiente spawn.

Abre:

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

La barra de perfiles en la parte superior de la página:

- **Cambiar** el perfil (desplegable `团队配置`) que usará el siguiente compañero de equipo predeterminado.
- **新建配置** añade un perfil con ocho filas de rol vacías.
- **配置名称** cambia el nombre del perfil seleccionado. Los nombres son obligatorios, únicos y de 60 caracteres como máximo.
- **删除配置** elimina el perfil seleccionado tras un segundo clic de confirmación. El último perfil restante no se puede eliminar.

Cada perfil tiene una fila por miembro predeterminado:

- **Modelo**: un desplegable que contiene los modelos de todos los proveedores, con encabezados de grupo de proveedores no clicables. Al seleccionar un modelo se establecen a la vez el proveedor y el modelo.
- **Esfuerzo de razonamiento**: un segundo desplegable con los esfuerzos anunciados del modelo seleccionado, más una opción de valor predeterminado del modelo.

Un modelo vacío significa «heredar la ruta del Lead»; un esfuerzo vacío significa «usar el valor predeterminado del modelo». `spawn_teammate_with_model` lee el valor predeterminado por rol del perfil seleccionado cuando se omite `model`; un `model` explícito lo anula. El `subagent` simple siempre hereda del Lead.

Niveles de capacidad sugeridos, como punto de partida y no como regla:

| Rol | Nivel sugerido | Por qué |
| --- | --- | --- |
| `designer` | El más alto | Un error de diseño invalida todas las ejecuciones |
| `advisor` | El más alto, de una familia distinta a la del designer | La crítica independiente necesita una perspectiva distinta |
| `builder` | Alto | Corrección del código y contexto largo |
| `reviewer` | Alto, de una familia distinta a la de builder y runner | La auditoría de evidencia necesita su propia lente |
| `researcher` | Medio-alto | Criterio sobre líneas base y SOTA |
| `writer` | Medio | Redacción organizada a partir de evidencia verificada |
| `data` | Medio-bajo | Adquisición procedimental con herramientas |
| `runner` | Medio-bajo | Fiabilidad de herramientas más que razonamiento profundo |

La lista completa de perfiles se guarda en conjunto, así que cambiar de perfil no descarta las ediciones hechas en otro. La página valida los nombres antes de guardar y muestra el texto de error del servidor cuando se rechaza un guardado.

El nombre de la fila importa: `research-team-settings` debe permanecer en la **raíz del paquete** `dsh-research-team-preset`. El escáner de módulos de cliente de DSH solo descubre `dsh.client` en filas que son exactamente la raíz del paquete; un nombre con subruta inicia el plugin host pero nunca carga la página.

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
        "designer": { "provider": "", "model": "", "reasoningEffort": "" },
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
| Prompt | `prompt/` | Núcleo compartido en inglés que `plugin/prompt.js` monta como persona del preset; los briefs de rol se sirven como skills integrados mediante `plugin/roles.js` |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Establece `false` para eliminar `spawn_teammate_with_model` y su envoltorio de servicio |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Proveedores de subagente que usa la herramienta de spawn modelada; valores predeterminados `spawn` / `fork` |
| Fila `research-team-settings` | `cordis.patch.yml` | Fila host de nivel superior; mantén el nombre en la raíz del paquete |
| Perfiles de modelo del equipo | `$DSH_HOME/research-team-settings.json` | Perfiles con nombre; el perfil activo aporta provider/model/reasoningEffort para los ocho roles predeterminados |

## Cómo funciona

- **Preset**: `cordis.patch.yml` declara una sola fila de preset, `research-team`, con la fila de prompt, la de skills de rol, las de herramientas y el módulo modeled-teammates. La fila de prompt monta `prompt/core.md` para todos; la de skills de rol sirve `research-role-lead` y los ocho briefs especializados mediante la herramienta `skill`. Un compañero lanzado hereda este preset; la herramienta de spawn rechaza a un compañero como llamador, así que solo el Lead crea compañeros.
- **Enrutamiento por rol**: `plugin/modeled-teammates.js` envuelve `subagents.startActivation` con `AsyncLocalStorage` e inyecta `agentOptions` solo para una llamada a `spawn_teammate_with_model`. El paquete oficial Agent Teams no se modifica. Cordis expone los servicios como un proxy rastreable, así que el envoltorio comprueba su propio descriptor de propiedad en lugar de la identidad del método.
- **Ajustes**: `settings/index.js` carga y guarda el archivo JSON de perfiles y sirve `GET/POST /api/dsh-research-team-settings`; `client/index.js` registra el editor de perfiles de la página de Plugins mediante `plugins.row.config`.
- **Actualización**: `plugin/settings-store.js` mantiene la instantánea en memoria, resuelve el perfil activo en cada lectura y spawn, y conserva la última instantánea buena si una lectura falla.

## Solución de problemas

### Los ajustes parecen restablecerse después de reiniciar

La versión 0.1.0 corrige la causa conocida: el cargador antiguo pasaba todo el objeto `{ roles: ... }` al normalizador de roles y producía ajustes totalmente vacíos. Actualiza a 0.1.0 o posterior, reinicia DSH y comprueba que:

- `$DSH_HOME/research-team-settings.json` existe y contiene los perfiles guardados;
- los archivos antiguos `{ "roles": ... }` se muestran como un único perfil `默认配置` y se reescriben con la forma de perfiles en el siguiente guardado;
- la fila `research-team-settings` se llama exactamente `dsh-research-team-preset`;
- el host actual ejecuta esta copia de trabajo, no una copia instalada obsoleta.

### Cada compañero se ejecuta con el modelo del Lead

Mira la salida del spawn que aparece sobre el primer mensaje del miembro. Muestra `requested=<provider>/<model> effort=<effort>` cuando se aplicó una ruta configurada o explícita, y `requested=inherit (Lead route)` con una línea `note:` cuando ninguna ruta coincidió. Una `note:` que nombra un rol significa que ese rol no tiene provider/model en el perfil activo; una nota que dice que el nombre no es un rol estándar significa que el nombre del compañero no contenía ninguna palabra de rol.

Otras dos causas no tienen que ver con el archivo de ajustes:

- el Lead llamó a `subagent` simple en lugar de `spawn_teammate_with_model`, que siempre hereda del Lead. La persona indica al Lead que no pase `model` a la herramienta modeled y que nunca vuelva atrás por dudas sobre nombres;

- la fila de ajustes se guardó bajo un `DSH_HOME` distinto del que lee el host en ejecución. Compara la línea `settings file:` que imprime `research_team_routes` con `echo $DSH_HOME`.

### La página de ajustes no aparece en Plugins

- La fila debe ser la raíz del paquete, no `dsh-research-team-preset/settings`.
- La parte cliente necesita un reinicio de DSH y una recarga del navegador después de la instalación.
- Comprueba que el bundle está habilitado en el perfil.

### Faltan las herramientas de equipo

### Faltan las herramientas del worklog de tareas

El panel «Investigación» lista los elementos de trabajo activos de `.research/worklog/items/`; los terminados están detrás del interruptor «Finalizados». Regístralos o actualízalos con `research_worklog`.

### `spawn_teammate_with_model` no está disponible

El submódulo envuelve un servicio interno de subagentes. Una actualización de DSH puede cambiar la forma de la activación. Revisa el texto del fallo; si el envoltorio no se puede instalar, establece `research-modeled-teammates.enabled: false`, reinicia y usa el `subagent` simple.

### El preset no aparece en la lista

Confirma que el bundle está instalado y habilitado, reinicia DSH y abre una sesión nueva. Las declaraciones de preset se cargan al arrancar.

### `research_project` no puede resolver el espacio de trabajo

Abre el directorio de trabajo como proyecto/espacio de trabajo de DSH en la GUI o pasa un proyecto conocido; la herramienta no adivina.

## Limitaciones conocidas

- El enrutamiento de modelos por rol es un envoltorio de servicio interno, no una extensión oficial de Agent Teams. Las actualizaciones de DSH pueden romperlo; el respaldo está documentado arriba.
- Las dependencias a nivel de perfil no se instalan ni se habilitan automáticamente. Este repositorio las documenta pero no las gestiona.
- Los perfiles de modelo del equipo viven en un archivo JSON independiente bajo `$DSH_HOME`; no forman parte de la exportación/copia de seguridad estándar de la configuración de DSH. Copia el archivo si cambias de máquina.
- El menú de modelos es un `<select>` nativo con grupos de proveedores, no un selector personalizado con búsqueda.
- El modo no genera automáticamente ocho compañeros de equipo al iniciar la sesión. El Lead crea los roles según lo requiera la tarea.
- El modo nunca inicializa un repositorio dentro de un repositorio existente, y nunca hace commit por su cuenta del worklog ni del andamiaje del repositorio.
- Los miembros pueden usar una capa de subagente; la delegación más profunda está deshabilitada intencionalmente.

## Licencia

MIT. Consulta [LICENSE](../LICENSE).

## Agradecimientos


Las notas de contribución y desarrollo interno están en [DEVELOPMENT.md](../DEVELOPMENT.md).
