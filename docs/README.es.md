# Research Team Mode — Español

**Versión:** 1.0.0 · **Actualizado:** 2026-10-31

**Idiomas:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · **Español** · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

> Esta página es una introducción breve. La documentación completa y canónica está en el [English README](../README.md).

## Descripción general

Research Team Mode es un preset de agente de DSH que convierte una sesión en un pequeño equipo de investigación coordinado. El Lead planifica el trabajo, mantiene el tablero de tareas, reparte las tarjetas, integra resultados y conversa con el usuario. Seis roles predeterminados cubren asesoría, literatura y evidencia, código, ejecuciones, revisión independiente y redacción del artículo.

El modo está pensado para investigaciones que duran días o semanas, necesitan evidencia trazable y se benefician de límites de rol claros. No está pensado para preguntas puntuales ni cambios pequeños de una sola vez.

## Para quién

- Proyectos que combinan revisión de literatura, implementación, experimentos y producción del artículo.
- Equipos que quieren vincular cada afirmación con una fuente, un registro de ejecución o una evidencia de run.
- Usuarios que prefieren un asesor y un revisor independiente en lugar de un único agente generalista.
- Trabajos donde la aceptación final debe seguir siendo una decisión humana.

## Capacidades

- **Seis roles predeterminados**: advisor (asesor científico), researcher (literatura y evidencia), builder (código), runner (entrenamiento y ejecución), reviewer (revisión), writer (redacción).
- **El tablero de tareas primero**: el Lead crea tarjetas, los miembros las toman y ejecutan, envían un informe de ejecución y el reviewer verifica de forma independiente.
- **Modelo por rol**: la página de configuración del plugin permite elegir provider, model y esfuerzo de razonamiento para cada miembro.
- **Finalización solo para el usuario**: un agente llega hasta `in_review`; solo el usuario mueve una tarjeta a `done` en la interfaz.
- **Runtime PTC**: `run_code` y el SDK generado agrupan operaciones por lotes y reducen los viajes de ida y vuelta.
- **Trazabilidad**: la evidencia, las ejecuciones y las decisiones quedan en los comentarios de las tarjetas.

## Inicio rápido

1. En el mismo perfil de DSH, activa Agent Teams (`@deepseek-ai/dsh-experimental-agent-team-profile`) y `dsh-taskboard`.
2. Instala este bundle mediante una ruta local o `link:` y reinicia DSH.
3. Abre una sesión nueva y elige «Research Team Mode»; las tarjetas usan `presetId=research-team`.
4. En «Plugins → @local/dsh-research-team-preset → research-team-settings → Configure», define los modelos predeterminados.

La instalación completa, la configuración, el flujo del tablero y los problemas conocidos están en el [English README](../README.md). Esta página es una traducción asistida por IA; se agradecen las correcciones.
