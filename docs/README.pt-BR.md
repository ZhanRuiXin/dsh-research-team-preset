# Research Team Mode — Português (Brasil)

**Versão:** 1.0.0 · **Atualizado:** 2026-10-31

**Idiomas:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · **Português (Brasil)** · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

> Esta página é uma introdução curta. A documentação completa e canônica está no [English README](../README.md).

## Visão geral

Research Team Mode é um preset de agente do DSH que transforma uma sessão em uma pequena equipe de pesquisa coordenada. O Lead planeja o trabalho, mantém o quadro de tarefas, distribui os cartões, integra resultados e conversa com o usuário. Seis funções padrão cobrem aconselhamento, literatura e evidências, código, execuções, revisão independente e redação do artigo.

O modo é voltado a pesquisas que duram dias ou semanas, exigem evidências rastreáveis e se beneficiam de limites claros de função. Não é pensado para perguntas pontuais ou pequenas alterações únicas.

## Para quem

- Projetos que combinam revisão de literatura, implementação, experimentos e produção do artigo.
- Equipes que querem ligar cada afirmação a uma fonte, um log de execução ou um registro de run.
- Usuários que preferem um consultor e um revisor independente a um único agente generalista.
- Trabalhos em que a aceitação final deve continuar sendo uma decisão humana.

## Recursos

- **Seis funções padrão**: advisor (aconselhamento científico), researcher (literatura e evidências), builder (código), runner (treinamento e execução), reviewer (revisão), writer (redação).
- **Quadro de tarefas em primeiro lugar**: o Lead cria cartões, os membros assumem e executam, enviam um relatório de execução e o reviewer verifica de forma independente.
- **Modelo por função**: a página de configuração do plugin permite escolher provider, model e esforço de raciocínio para cada membro.
- **Conclusão apenas pelo usuário**: o agente chega até `in_review`; somente o usuário move um cartão para `done` na interface.
- **Runtime PTC**: `run_code` e o SDK gerado agrupam operações em lote e reduzem idas e voltas.
- **Rastreabilidade**: evidências, execuções e decisões ficam nos comentários dos cartões.

## Início rápido

1. No mesmo perfil do DSH, ative o Agent Teams (`@deepseek-ai/dsh-experimental-agent-team-profile`) e o `dsh-taskboard`.
2. Instale este bundle por um caminho local ou `link:` e reinicie o DSH.
3. Abra uma nova sessão e escolha “Research Team Mode”; os cartões usam `presetId=research-team`.
4. Em “Plugins → @local/dsh-research-team-preset → research-team-settings → Configure”, defina os modelos padrão.

A instalação completa, a configuração, o fluxo do quadro e os problemas conhecidos estão no [English README](../README.md). Esta página é uma tradução assistida por IA; correções são bem-vindas.
