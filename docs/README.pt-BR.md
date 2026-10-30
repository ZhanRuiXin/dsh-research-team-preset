# Research Team Mode

**Um preset de agente do DSH que transforma uma sessão em uma pequena equipe de pesquisa coordenada.**

**Versão 1.0.0** · **Atualizado 2026-10-31**

**Idiomas:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · **Português (Brasil)** · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Guia de idiomas](LANGUAGES.md)

---

## Visão geral

Research Team Mode é um preset de agente do DSH para conduzir pesquisa de ponta a ponta como uma equipe, em vez de um único chat. O Lead planeja o trabalho, mantém o quadro de tarefas, distribui os cartões, integra os resultados e conversa com o usuário. Seis especialistas padrão cobrem revisão consultiva, literatura e evidências, código, execuções, revisão independente e redação do artigo.

O modo é voltado a pesquisas que duram dias ou semanas, exigem evidências rastreáveis e se beneficiam de limites claros de função. Não é um modo de perguntas e respostas pontuais: o Lead cria apenas as funções que a tarefa realmente precisa.

## Em resumo

| | |
| --- | --- |
| **Funções padrão** | 6: advisor, researcher, builder, runner, reviewer, writer |
| **Fluxo de trabalho** | Quadro de tarefas em primeiro lugar: criar, assumir, executar, relatar, revisar, aceitação do usuário |
| **Conclusão** | `in_review` é a última parada do agente; somente o usuário pode mover um cartão para `done` |
| **Roteamento de modelos** | Provedor, modelo e esforço de raciocínio por função, definidos em um formulário na página de Plugins |
| **Runtime** | PTC (`run_code` + SDK gerado), uma camada de subagente por membro |
| **Idioma** | Prompt de sistema em inglês; README completo em inglês e traduções completas em 11 idiomas |

## Para quem

- Projetos de pesquisa que combinam revisão de literatura, implementação, experimentos e produção do artigo.
- Equipes que precisam de uma trilha de evidências que ligue cada afirmação à fonte, ao registro de execução ou ao log.
- Usuários que querem um advisor e um reviewer independente em vez de um único agente generalista.
- Trabalhos em que o usuário, e não o agente, deve tomar a decisão final de aceitação.

**Não indicado para:** perguntas factuais rápidas, edições em um único arquivo ou tarefas em que uma resposta única já basta. O modo orienta o Lead a responder perguntas simples diretamente e a mobilizar a equipe apenas para pesquisa substancial.

## Requisitos

O Research Team Mode é um **bundle DSH de nível de perfil**. O bundle não instala nem ativa os bundles de perfil que utiliza; o instalador de pacotes do DSH lida com dependências npm, e não com bundles de recursos. Ative as dependências no mesmo perfil primeiro.

| Capacidade | Provedor | Observações |
| --- | --- | --- |
| DSH | DeepSeek Harness `0.2.x` | Desenvolvido com base em `0.2.1-rc.5`; outras versões podem funcionar, mas não são garantidas |
| Agent Teams | `@deepseek-ai/dsh-experimental-agent-team-profile` | Fornece `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` e os serviços de Team |
| Quadro de tarefas | `dsh-taskboard` | Fornece `taskboard_*` e o quadro na Web GUI |
| Runtime PTC | `@deepseek-ai/dsh-agent-tool-presentation` e `@deepseek-ai/dsh-ptc-runtime-node` | Parte da base do DSH; habilita `run_code` |
| Git Bash (opcional, Windows) | `dsh-gitbash-shell` | Adiciona uma ferramenta `bash` para agentes que precisam dela |
| Web GUI | DSH Web/Desktop | Necessária para o formulário de configurações e o quadro de tarefas |

Se faltar uma dependência, o modo ainda pode carregar parcialmente, mas as ferramentas de equipe, o quadro ou a página de configurações ficarão indisponíveis. O gerenciador de plugins não solicita esses bundles nem os vincula automaticamente.

## Instalação

Este repositório é um bundle DSH local. A partir de um checkout:

1. **Ative os pré-requisitos** no perfil de destino:
   - Agent Teams: `@deepseek-ai/dsh-experimental-agent-team-profile`
   - Quadro de tarefas: `dsh-taskboard`
   - Opcionalmente, `dsh-gitbash-shell` no Windows.
2. **Instale este bundle** com a ação de instalação da página de Plugins ou do gerenciador de plugins, usando um link local:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   Um caminho de pasta local também funciona. Mantenha o link se você pretende atualizar a partir deste checkout; reinstale após substituir a pasta.
3. **Reinicie o DSH.** As linhas de preset e a parte cliente do bundle são carregadas na inicialização.
4. **Verifique se o bundle está ativo** no mesmo perfil.
5. **Abra uma nova sessão** e selecione **Research Team Mode** no seletor de modo.
6. Para sessões de execução do quadro de tarefas, crie cartões com `presetId=research-team` para que a execução use a mesma persona e as mesmas ferramentas.

> O modo é um bundle de nível de perfil: instalá-lo em um perfil não o ativa em outro. Repita a instalação e as etapas de pré-requisitos em cada perfil.

## Primeira execução

Peça ao Lead para verificar o ambiente e o quadro antes de começar o trabalho de verdade:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

Uma primeira tarefa típica:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Equipe padrão

| Função | Responsabilidade |
| --- | --- |
| `advisor` | Avaliação independente da direção, do enquadramento, das afirmações centrais, da suficiência das evidências e da estratégia do artigo; recomenda prosseguir / revisar / parar. Apenas consultivo, não é um ponto de bloqueio |
| `researcher` | Busca, obtenção e leitura detalhada de literatura, extração de evidências e uma tabela de evidências afirmação → fonte → localização |
| `builder` | Código, configuração, pipelines de dados, testes e pontos de entrada reproduzíveis; sem treinamentos longos |
| `runner` | Inicia e monitora treinamento/avaliação; registra ids de execução, configurações, seeds, métricas, logs, checkpoints e caminhos de artefatos |
| `reviewer` | Verificação independente de notas de literatura, código, resultados e afirmações/citações do artigo; PASS/FAIL com evidências bloqueantes |
| `writer` | Rascunho do artigo em LaTeX: texto, seções, tabelas, legendas, citações e código de figuras; não executa experimentos nem altera código/modelos |

O Lead é responsável por esclarecer o objetivo, decompor o trabalho, gerenciar o quadro, distribuir tarefas, integrar resultados, produzir resumos, montar os artefatos finais e fazer a entrega. Os membros podem usar uma camada de subagente para uma subtarefa delimitada; eles não podem criar outros membros.

## Fluxo do quadro de tarefas

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

O quadro é o único registro de tarefas. Não mantenha o acompanhamento de entregáveis apenas no chat. `team_task_*` serve para coordenação transitória, não para entregáveis.

## Configurações de modelo por função

Abra:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

Cada membro padrão ocupa uma linha:

- **Modelo**: um menu suspenso que contém os modelos de todos os provedores, com cabeçalhos de grupo de provedor não clicáveis. Selecionar um modelo define provedor e modelo ao mesmo tempo.
- **Esforço de raciocínio**: um segundo menu suspenso com os esforços oferecidos pelo modelo selecionado, além de uma opção de padrão do modelo.

Um modelo vazio significa “herdar a rota do Lead”; um esforço vazio significa “usar o padrão do modelo”. `spawn_teammate_with_model` lê o padrão por função quando `model` é omitido; um `model` explícito tem precedência. O `spawn_teammate` simples sempre herda do Lead.

O nome da linha importa: `research-team-settings` deve permanecer na **raiz do pacote** `@local/dsh-research-team-preset`. O scanner de módulos cliente do DSH só descobre `dsh.client` em linhas que são exatamente a raiz do pacote; um nome com subcaminho inicia o plugin host, mas nunca carrega a página.

### Onde as configurações são armazenadas

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

- O arquivo JSON é a fonte da verdade. O plugin host o carrega na inicialização; `getSettings()` e `modelForRole()` se atualizam a partir dele, de modo que a página e o próximo membro da equipe veem os valores mais recentes.
- Um arquivo ausente ou temporariamente ilegível mantém o último snapshot em memória válido em vez de apagá-lo.
- O arquivo de configurações **não** está neste repositório. Faça backup separadamente. Ele é por `DSH_HOME`, e não por perfil.
- Nenhuma credencial é armazenada; apenas strings de provedor/modelo/esforço.
- Salvar configurações tem efeito sem reiniciar o DSH. Reiniciar é necessário para a primeira instalação da linha de configurações/página cliente e para mudanças de preset/plugin.
- A versão 1.0.0 corrige um bug de loader em builds anteriores: o arquivo agrupa as funções sob `"roles"`, e o loader antigo passava o objeto inteiro para o normalizador de funções, o que produzia configurações totalmente vazias após reiniciar. O loader atual desembrulha `"roles"` e também aceita um mapa de funções sem wrapper, por compatibilidade.

## Referência de configuração

| Configuração | Local | Observações |
| --- | --- | --- |
| Id do preset | `cordis.patch.yml` | `research-team`; os cartões de tarefa devem usar `presetId=research-team` |
| Persona | `cordis.patch.yml` | Prompt de sistema em inglês; regras para todo o modo |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Defina como `false` para remover `spawn_teammate_with_model` e seu wrapper de serviço |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Provedores de subagente usados pela ferramenta de spawn modelada; padrões `spawn` / `fork` |
| Linha `research-team-settings` | `cordis.patch.yml` | Linha host de nível superior; mantenha o nome na raiz do pacote |
| Rotas por função | `$DSH_HOME/research-team-settings.json` | Provedor/modelo/reasoningEffort para as seis funções padrão |

## Estrutura do repositório

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
    ├── LANGUAGES.md              # Language guide
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

## Como funciona

- **Preset**: `cordis.patch.yml` declara a persona, as linhas de ferramentas, o submódulo modeled-teammates e a linha de configurações de nível superior.
- **Prompt do quadro de tarefas**: `plugin/index.js` registra uma seção de protocolo em inglês (`plugin:dsh-taskboard`) no escopo do preset e fornece `research_project` para resolver o workspace atual.
- **Roteamento por função**: `plugin/modeled-teammates.js` envolve `subagents.startActivation` com `AsyncLocalStorage` e injeta `agentOptions` apenas em uma chamada `spawn_teammate_with_model`. O pacote oficial do Agent Teams permanece intacto.
- **Configurações**: `settings/index.js` carrega e salva o arquivo JSON e serve `GET/POST /api/dsh-research-team-settings`; `client/index.js` registra o formulário de linha da página de Plugins via `plugins.row.config`.
- **Atualização**: `plugin/settings-store.js` mantém o snapshot em memória, atualiza a partir do disco em leituras e spawns e preserva o último snapshot válido se uma leitura falhar.

## Lista de verificação

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

O caminho de persistência das configurações pode ser verificado sem a interface:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## Solução de problemas

### As configurações parecem ser redefinidas após reiniciar

A versão 1.0.0 corrige a causa conhecida: o loader antigo passava o objeto `{ roles: ... }` inteiro para o normalizador de funções e produzia configurações totalmente vazias. Atualize para 1.0.0 ou mais recente, reinicie o DSH e verifique se:

- `$DSH_HOME/research-team-settings.json` existe e contém as funções salvas;
- a linha `research-team-settings` tem exatamente o nome `@local/dsh-research-team-preset`;
- o host atual está executando este checkout, e não uma cópia instalada desatualizada.

### A página de configurações não aparece em Plugins

- A linha deve ser a raiz do pacote, não `@local/dsh-research-team-preset/settings`.
- A parte cliente exige reiniciar o DSH e atualizar o navegador após a instalação.
- Verifique se o bundle está ativo no perfil.

### Faltam ferramentas de equipe

Ative `@deepseek-ai/dsh-experimental-agent-team-profile` no mesmo perfil e reinicie. O instalador não solicita esse bundle.

### Faltam ferramentas do quadro de tarefas

Ative `dsh-taskboard` no mesmo perfil e reinicie.

### `spawn_teammate_with_model` está indisponível

O submódulo envolve um serviço interno de subagente. Uma atualização do DSH pode mudar o formato da ativação. Verifique o texto da falha; se o wrapper não conseguir ser instalado, defina `research-modeled-teammates.enabled: false`, reinicie e use o `spawn_teammate` simples.

### O preset não aparece na lista

Confirme que o bundle está instalado e ativo, reinicie o DSH e abra uma nova sessão. As declarações de preset são carregadas na inicialização.

### `research_project` não consegue resolver o workspace

Abra o diretório de trabalho como um projeto/workspace do DSH na GUI ou passe um projeto conhecido; a ferramenta não adivinha.

## Limitações conhecidas

- O roteamento de modelo por função é um wrapper de serviço interno, não uma extensão oficial do Agent Teams. Atualizações do DSH podem quebrá-lo; o fallback está documentado acima.
- Dependências de nível de perfil não são instaladas nem ativadas automaticamente. Este repositório as documenta, mas não as gerencia.
- As configurações de função ficam em um arquivo JSON autônomo em `$DSH_HOME`; elas não fazem parte da exportação/backup padrão de configuração do DSH. Copie o arquivo se você trocar de máquina.
- O menu de modelos é um `<select>` nativo com grupos de provedor, não um seletor personalizado com busca.
- O modo não cria automaticamente seis membros da equipe ao iniciar a sessão. O Lead cria as funções conforme a tarefa exige.
- Os membros podem usar uma camada de subagente; a delegação mais profunda é desativada intencionalmente.

## Desenvolvimento

Este repositório é um bundle DSH local sem etapa de build para o código host. A página cliente é um módulo `window.__ModuleLoader__.load` pré-compilado em `client/index.js`.

Ciclo típico:

1. Instale o checkout como uma dependência `link:` em um perfil do DSH.
2. Edite os arquivos de host/cliente.
3. Reinicie o DSH (os módulos de preset e cliente são carregados na inicialização; o HMR pode cuidar de algumas mudanças no host).
4. Inspecione a rota de configurações e a página de Plugins.

Verificações úteis:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

Ainda não há uma suíte de testes automatizados. A rota de configurações, o catálogo de modelos, o fluxo do quadro de tarefas e a persistência após reiniciar são as verificações manuais de maior valor.

## Versionamento

Versionamento semântico. A versão atual é **1.0.0**; consulte o [CHANGELOG.md](../CHANGELOG.md). A documentação em `docs/` carrega a mesma versão.

## Licença

MIT. Consulte o arquivo [LICENSE](../LICENSE).

## Agradecimentos

Construído sobre o DeepSeek Harness e o Cordis. A integração com o quadro de tarefas usa o plugin `dsh-taskboard`; as ferramentas de equipe vêm do bundle oficial do perfil Agent Teams. Agradecemos aos autores dos plugins e a todos que testam o modo em projetos de pesquisa reais.

**Idiomas:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · **Português (Brasil)** · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Guia de idiomas](LANGUAGES.md)
