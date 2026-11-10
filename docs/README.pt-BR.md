# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**Um preset de agente do DSH que transforma uma sessão em uma pequena equipe de pesquisa coordenada.**

**Versão 0.1.1** · **Atualizado 2026-11-10**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <strong>Português (Brasil)</strong> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## Visão geral

Research Team Mode é um preset de agente do DSH para conduzir pesquisa de ponta a ponta como uma equipe, em vez de um único chat. O Lead planeja o trabalho, mantém os dois registros (cartões do quadro para os gates do usuário, tarefas de equipe para as etapas internas), distribui o trabalho, integra os resultados e conversa com o usuário. Oito especialistas padrão cobrem revisão consultiva, literatura e evidências, obtenção de dados, design experimental, código, execuções, revisão independente e redação do artigo.

O modo é voltado a pesquisas que duram dias ou semanas, exigem evidências rastreáveis e se beneficiam de limites claros de função. Não é um modo de perguntas e respostas pontuais: o Lead cria apenas as funções que a tarefa realmente precisa.

## Em resumo

| | |
| --- | --- |
| **Funções padrão** | 8: advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **Fluxo de trabalho** | Baseado em gates: etapas internas em `team_task_*`, gates do usuário no quadro; criar, assumir, executar, relatar, revisar, aceitação do usuário |
| **Conclusão** | `in_review` é a última parada do agente; somente o usuário pode mover um cartão para `done` |
| **Roteamento de modelos** | Provedor, modelo e esforço de raciocínio por função, definidos em um formulário na página de Plugins |
| **Git** | Inicializado pelo agente quando o trabalho substantivo começa; mudanças destrutivas em uma branch; mesclagem somente após a aceitação |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + um arquivo limitado por cartão com gate; ao retomar, ler PLAN e INDEX primeiro |
| **Runtime** | PTC (`run_code` + SDK gerado), uma camada de subagente por membro |

## Para quem

- Projetos de pesquisa que combinam revisão de literatura, implementação, experimentos e produção do artigo.
- Equipes que precisam de uma trilha de evidências que ligue cada afirmação à fonte, ao registro de execução ou ao log.
- Usuários que querem um advisor e um reviewer independente em vez de um único agente generalista.
- Trabalhos em que o usuário, e não o agente, deve tomar a decisão final de aceitação.

**Não indicado para:** perguntas factuais rápidas, edições em um único arquivo ou tarefas em que uma resposta única já basta. O modo orienta o Lead a responder perguntas simples diretamente e a mobilizar a equipe apenas para pesquisa substancial.

## Como o Lead fala com você

As respostas do Lead são comunicação científica, não um feed de status: primeiro a afirmação ou o resultado, com a evidência por trás (run id, conjunto de dados, métrica com incerteza e tamanho da amostra, fonte), depois o que permanece incerto e, por fim, o que você precisa decidir. Cada afirmação é rotulada como fato observado, inferência, hipótese ou questão aberta, e o método é explicado até o ponto de você conseguir acompanhar e continuar aprendendo.

A mecânica interna fica interna. Handoffs entre agentes, retentativas, erros de ferramentas, escrituração do quadro e o que a equipe aprendeu trabalhando não são repassados, a menos que mudem a leitura de um resultado ou bloqueiem uma decisão. Relatórios dos membros são traduzidos em afirmação, evidência e limites, não colados.

A divisão de trabalho é explícita: você define a direção científica e julga a evidência, e a equipe carrega a carga de busca, implementação, experimentação e verificação.

Suas perguntas são o contrato deste turno. Se você pede um panorama, uma lista de extensões ou uma decisão, a resposta entrega isso; um programa de pesquisa, um portão ou um critério de parada é adicional e nunca substituto. A resposta percorre suas perguntas na ordem, responde cada uma com sua evidência e o arquivo onde está o detalhe completo, e diz com clareza quando alguma ainda não pode ser respondida.

Um turno longo não é um turno silencioso. Se a equipe está trabalhando há mais de cerca de dez minutos, o Lead envia uma resposta intermediária curta: o que está decidido, o que ainda está sendo levantado e quando vem a próxima resposta, para você poder redirecionar antes que o compute seja gasto.

Um resultado negativo anterior restringe o método, os dados e o orçamento que o produziram, não a ideia. Antes de fechar uma direção, sua versão mais forte é enunciada e mostrada como falha; cada «não se pode afirmar» vem com a versão que poderia ser afirmada e a evidência que a sustentaria.

## Requisitos

O Research Team Mode é um **bundle DSH de nível de perfil**. O bundle não instala nem ativa os bundles de perfil que utiliza; o instalador de pacotes do DSH lida com dependências npm, e não com bundles de recursos. Ative as dependências no mesmo perfil primeiro.

| Capacidade | Provedor | Observações |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | Desenvolvido com base em `0.2.1-rc.5`; outras versões podem funcionar, mas não são garantidas |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | Fornece `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent`, `team_task_*` e os serviços de Team |
| Runtime PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) e [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | Parte da base do DSH; habilita `run_code` |

**Integrações opcionais.** Esses plugins são de outros autores. O preset funciona sem eles e não instala nenhum; adicione um apenas para ligar a equipe a ele:

- **Quadro de tarefas** ([`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)) — `taskboard_*`, cartões para o usuário, listas de aceite e sessões de execução `presetId=research-team`. Sem ele, o worklog (`PLAN.md`, `INDEX.md`, arquivos de cartão) é o registro durável.
- **Zotero** (`dsh-zotero`) — as ferramentas da biblioteca compartilhada (`zotero_*`) e o caminho de importação do paper-fetch. Sem ele, o trabalho bibliográfico usa Semantic Scholar, arXiv e a web, e a tabela de evidências continua registrando afirmação, fonte e localização.
- **Mnemon** (`dsh-mnemon`) — notas duráveis entre sessões (`mnemon_*`). Sem ele, o worklog e o `CHANGELOG.md` carregam a continuidade.

Se faltar uma dependência, o modo ainda pode carregar parcialmente, mas as ferramentas de equipe, o quadro ou a página de configurações ficarão indisponíveis. O gerenciador de plugins não solicita esses bundles nem os vincula automaticamente.

## Instalação

Este preset é distribuído como bundle DSH e publicado no npm como `dsh-research-team-preset`.

### Instalar pela página de Plugins do DSH

1. **Ative os bundles obrigatórios** no perfil de destino: Agent Teams [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness). As integrações opcionais acima podem ser adicionadas agora ou depois.
2. Abra **Configurações → Plugins** e clique em **Adicionar**.
3. Cole a origem de instalação: `dsh-research-team-preset@0.1.1` para o pacote npm, `github:ZhanRuiXin/dsh-research-team-preset#v0.1.1` para fixar o código-fonte, ou `link:/absolute/path/to/dsh-research-team-preset` para um checkout local.
4. **Reinicie o DSH.** As linhas do preset e a metade cliente do bundle carregam na inicialização.
5. **Verifique se o bundle está habilitado** no mesmo perfil, depois **abra uma nova sessão** e escolha **Research Team Mode** no seletor de modo.

### Instalar pela linha de comando

```text
dsh plugin add dsh-research-team-preset@0.1.1
```

Para fixar o código-fonte em vez do registro:

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.1.1
```

Para sessões de execução do quadro de tarefas, crie cartões com `presetId=research-team` para que a execução use a mesma persona e ferramentas.

> O modo é um bundle no nível do perfil: instalá-lo em um perfil não o habilita em outro. Repita a instalação e os pré-requisitos em cada perfil.

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
Lead: research_project -> taskboard_create only at user gates -> team_task_create -> send_message
Members: team_task_update (claim) -> work -> complete + send_message; gated steps also claim the card
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## Equipe padrão

| Função | Responsabilidade |
| --- | --- |
| `advisor` | Avaliação independente da direção, do enquadramento, das afirmações centrais, da suficiência das evidências e da estratégia do paper. Construtivo por padrão: o que se sustenta, os poucos problemas que ameaçam o resultado, o menor reparo ou uma alternativa concreta para cada um, e então proceed / revise / stop. Apenas aconselhamento, não é um gate |
| `researcher` | Busca, obtenção e leitura detalhada de literatura, extração de evidências e uma tabela de evidências afirmação → fonte → localização. Primeiro busca na biblioteca compartilhada do Zotero, importa o artigo completo em sua versão formal com o PDF anexado quando falta uma obra necessária, remove duplicatas por DOI e título e compartilha as referências `zotero://` com a equipe |
| `data` | Obtenção de conjuntos de dados e pesos de modelos externos, incluindo disponibilidade da fonte e status de licença/acesso, ferramentas de download com retomada e tratamento de limites de taxa, verificação de integridade contra hashes do publicador, descompactação, contrato de manifesto, amostra pequena validada e registro de disco. Não escreve código de treinamento nem altera o protocolo de avaliação |
| `designer` | É responsável pelo documento de design do experimento: perguntas e hipóteses, protocolo e controles, linhas de base, ablações, métricas e plano estatístico, orçamento de computação e controle de mudanças de design enquanto as execuções estão em andamento; não escreve código de produção nem executa experimentos |
| `builder` | Código, configuração, pipelines de dados, testes e pontos de entrada reproduzíveis; sem treinamentos longos |
| `runner` | Inicia e monitora treinamento/avaliação; registra ids de execução, configurações, seeds, métricas, logs, checkpoints e caminhos de artefatos |
| `reviewer` | Verificação independente de notas de literatura, código, resultados e afirmações/citações do artigo; PASS/FAIL com evidências bloqueantes |
| `writer` | Rascunho do artigo em LaTeX: texto, seções, tabelas, legendas, citações e código de figuras; não executa experimentos nem altera código/modelos |

O Lead é responsável por esclarecer o objetivo, decompor o trabalho, gerenciar o quadro, distribuir tarefas, integrar resultados, produzir resumos, montar os artefatos finais e fazer a entrega. Os membros podem usar uma camada de subagente para uma subtarefa delimitada; eles não podem criar outros membros. O Lead mantém leve o próprio uso de ferramentas, prefere uma breve atualização ao usuário a outra chamada rotineira e deixa o trabalho profundo para o membro responsável.

### Biblioteca compartilhada do Zotero

O researcher considera a biblioteca Zotero do usuário como a fonte de literatura compartilhada da equipe. Busca nas coleções e nos itens existentes antes da web aberta, reutiliza os PDFs anexados e os trechos de anotação e importa um artigo ausente apenas em sua versão formal de registro, com o PDF anexado e arquivado em uma coleção do projeto. As importações removem duplicatas por DOI e título, não mexem nas etiquetas nem nas coleções do usuário e registram a referência de item `zotero://` na tabela de evidências e no cartão do quadro, para que cada colega leia o mesmo artigo e o reviewer possa conferir por amostragem as mesmas páginas. Quando o texto completo está atrás de um paywall ou só existem metadados, o researcher registra o link e marca a evidência como somente metadados, em vez de importar um substituto.

### Revisão consultiva

O advisor é um co-pensador científico, não um guardião. Primeiro nomeia o que se sustenta no plano e por quê, depois no máximo três problemas ordenados pelo quanto ameaçam o resultado, cada um ligado a um passo, uma afirmação ou um número específicos. Cada problema vem com o menor reparo que tornaria o plano aceitável, ou uma alternativa concreta com seu trade-off; uma rejeição seca não é uma revisão. Ele separa “isto não consegue responder à pergunta” de “isto funciona, mas é mais fraco ou mais caro”, declara a condição sob a qual o plano passa a ser aceitável e termina com proceed, revise com as mudanças necessárias ou stop com a direção a seguir em vez dela. Julga pelo padrão ao qual o projeto realmente se comprometeu e o nomeia, em vez de supor o mais exigente: um plano sólido para o objetivo declarado não é um fracasso porque uma afirmação mais forte exigiria mais evidência, e um alvo errado é levado à parte como decisão de escopo para você. Quando falta a evidência necessária para julgar, nomeia o teste ou a fonte mais barata que resolveria a questão. Um plano sólido recebe endosso claro em vez de objeções fabricadas, e um stop sempre traz uma direção substituta. Continua sendo aconselhamento: o Lead decide e o reviewer permanece o gate independente PASS/FAIL.

Cada consulta é preparada pelo Lead em vez de repassar a conversa. O Lead traduz o que o usuário perguntou na decisão que o advisor deve responder, com a afirmação ou o plano em questão, a evidência atual e seu alcance, as opções na mesa, as restrições e o que o usuário precisa da resposta; uma pergunta vaga ou sobrecarregada é afinada primeiro, e a mensagem original do usuário e o histórico interno da equipe não são repassados. O advisor é consultado uma vez por ponto de decisão, não para confirmar o que o Lead já consegue defender com evidência nem para resumir o próprio trabalho do Lead, e a resposta chega ao usuário como conclusão científica e como a decisão que ela deixa em aberto, não como texto repassado.

## Propriedade do design

O Lead não redige o design do experimento. No trabalho com forte ênfase em design, o designer é responsável por um documento de design no espaço de trabalho do projeto (`docs/design/<name>.md` ou o local de design já existente no projeto): a pergunta e as hipóteses, o protocolo e os controles, as linhas de base, as ablações, as métricas e o plano estatístico, o orçamento de computação e um registro de mudanças de design feitas enquanto as execuções estão em andamento.

O builder implementa o design, o runner o executa e o reviewer verifica, no gate de proposta, se o design consegue responder à pergunta e, no gate de resultados, se a execução correspondeu a ele. O advisor dá uma leitura científica independente no gate de proposta. O Lead confirma que o documento de design existe e que as entradas do researcher e de data estão prontas, e então admite ou devolve a etapa. No trabalho liderado pela implementação, o builder redige o design e o advisor o revisa uma vez.

## Escopo de escrita

Cada papel escreve apenas dentro do seu próprio escopo. Advisor e reviewer não escrevem nada; researcher possui `literature/`, `notes/` e `docs/evidence`; data possui `data/`, `manifests/`, scripts de download em `scripts/` e `reports/`; designer possui `docs/design/`; builder possui `src/`, `configs/` e `tests/`; runner possui `runs/`, `logs/` e `checkpoints/`; writer possui `paper/` e `figures/`; o Lead não tem restrição. Ler, buscar e comentar cartões continua aberto a todos.

O escopo é um contrato, não uma preferência: uma mudança que pertence a outro papel é reportada ao seu dono em vez de ser escrita pelo membro errado. Advisor e reviewer iniciam em somente leitura, então uma revisão relata o que precisa mudar em vez de mudar; um companheiro que realmente precise escrever fora do seu escopo recebe uma exceção explícita do Lead, registrada no cartão antes do trabalho começar. Todos os outros papéis herdam a permissão de sandbox do Lead, então um companheiro nunca fica mais restrito que o Lead, a menos que seu papel exija.

Antes de um cartão ir para in_review, o dono ou o Lead executa `research_scope_check` com o papel e os caminhos alterados ou os commits base e head. Uma violação é corrigida movendo a mudança para o papel responsável ou registrando a exceção aprovada pelo Lead, nunca ampliando o escopo no meio do cartão. Um projeto pode restringir ou ampliar um escopo em `AGENTS.md` ou no cartão; para essa etapa o cartão prevalece, para que uma sessão posterior leia a mesma regra.

## Admissão de experimentos

O poder de computação é gasto em uma decisão, não em atividade. Nenhuma execução além de um teste de fumaça trivial começa antes de sua regra de decisão ser escrita, e a regra precisa poder responder "parar". Antes do lançamento, registra-se no documento de design ou no worklog: a pergunta que a execução resolve, a hipótese, o resultado esperado e o tamanho de efeito que contaria como apoio, o resultado que a refutaria, o critério de parada, a linha de base a superar, o piloto mais barato capaz de resolver e o orçamento de computação. Uma execução sem esse registro não é admitida.

Primeiro o piloto: a menor configuração que ainda possa refutar a hipótese (um seed, um split, um subconjunto, um horizonte mais curto), lida contra o limite pré-registrado, e só então uma decisão explícita de escalar. Se o piloto não atingir o limite, a linha para, o resultado negativo é registrado e reportado, e não se acrescentam seeds nem variantes para diluir a diferença. Muda-se uma variável por vez, o confundidor é declarado antes da execução e qualquer mudança de protocolo no meio da execução é registrada com o motivo. A execução também é limitada pelo orçamento, pela repetição da mesma falha duas vezes e por uma métrica que parou de se mover.

O Lead admite a execução, o runner se recusa a iniciá-la sem o registro prévio e o reviewer verifica no portão de resultados se a execução correspondeu à regra pré-registrada e se uma decisão de parada foi respeitada em vez de anulada.

## Continuidade entre sessões

Uma sessão é uma conversa, não o projeto: o worklog, o quadro e o git carregam o trabalho, enquanto o chat, o time e os jobs em segundo plano não sobrevivem à sessão. Num projeto que já tem `worklog/PLAN.md`, antes da primeira ação substancial o agente lê PLAN e INDEX e então o bloco de estado do cartão atual, antes de planejar ou gastar computação.

O worklog fica na raiz do projeto retornada por `research_project`, não num subdiretório da sessão, para que todas as sessões do projeto compartilhem um PLAN e um INDEX. PLAN, INDEX, os arquivos de cartão, o quadro, o git e a memória são duráveis; entradas `team_task_*`, conversas com colegas e jobs em segundo plano existem apenas na sessão. O que uma sessão posterior precisa saber é escrito em PLAN ou no arquivo do cartão antes do fim da sessão.

Uma execução ou job longo que sobrevive ao turno deixa seu identificador de job ou terminal, host, hora de início, conclusão esperada e a regra de decisão que serve no arquivo do cartão ou no PLAN. Ao retomar, o agente verifica a vitalidade primeiro; uma execução órfã é reconciliada e apresentada ao usuário como adotar, reiniciar ou parar, em vez de rodar duas vezes em silêncio. Um cartão mantido por uma sessão que não existe mais é reportado ao usuário para reabertura, nunca assumido.

## Barra lateral de pesquisa

O preset adiciona uma aba Pesquisa à barra lateral direita. Ela responde o que a equipe está fazendo agora, onde está bloqueada e qual é o próximo passo: o objetivo e o marco do `worklog/PLAN.md`, os cartões ativos do `worklog/INDEX.md`, as execuções recentes, os documentos de design e os cartões de arquitetura.

Os cartões de arquitetura são diagramas de nós e arestas armazenados como JSON em `.research/architecture/`, um arquivo por cartão. O agente os lê e atualiza com a ferramenta `research_architecture`, para que o diagrama acompanhe o design em vez de ficar desatualizado num slide. Um cartão é renderizado em SVG dentro do painel; arrastar uma caixa sobre os nós os seleciona, e a nota que você escreve é salva no cartão como anotação que o agente lê antes de responder. A aba se registra via `dsh-better-sidebar` quando esse plugin está instalado e, caso contrário, na barra lateral direita nativa.

O painel é um módulo próprio em `panel/`, separado do formulário de configurações, e pode ser ativado ou desativado isoladamente. Ele aparece como entrada na barra esquerda e como aba na barra lateral direita.

## Fluxo do quadro de tarefas

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or final review
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

Só etapas que aguardam revisão ou aceite do usuário recebem um cartão do quadro: marcos de entregável, decisões de escopo que o usuário precisa confirmar, mudanças de risco e a entrega final. Etapas internas, subtarefas autoaprovadas e passagens entre membros são acompanhadas em `team_task_*` e ficam fora do quadro; ao chegar ao gate, o cartão guarda o entregável, suas evidências e o veredito de revisão. Os membros da equipe se coordenam internamente em inglês; as respostas ao usuário, os cartões e os entregáveis seguem o idioma do usuário. Quando uma decisão ou informação faltante for do usuário, o Lead pergunta diretamente com `ask_user_question` em vez de deixar um estado de espera no cartão. Se a pergunta expirar, o Lead pede uma recomendação independente ao advisor, registra-a e segue o trabalho.

## Fluxo de trabalho com Git

O modo inicializa o rastreamento durável quando o trabalho substantivo começa, e o agente decide se uma solicitação é trabalho real ou uma pergunta simples. Em um espaço de trabalho que ainda não está dentro de um repositório, o agente chama `research_workspace_init`, que cria `worklog/PLAN.md` e `worklog/INDEX.md` e executa `git init`. Ele nunca cria um repositório aninhado nem faz commit do andaime.

Mudanças destrutivas ou de risco acontecem em uma branch nomeada pela etapa, por exemplo `task/<title>+<id>` (o cartão para o trabalho com gate, a tarefa de equipe para o trabalho interno), em vez de editar a branch padrão. O cartão ou a tarefa de equipe registra os commits base e head, e o reviewer lê `git diff <base>..<head>` como base da revisão de código e executa novamente as verificações de aceitação.

Uma branch só é mesclada depois que o cartão é aceito, e então é removida. Artefatos gerados, como conjuntos de dados, checkpoints, logs e caches, ficam fora do repositório. Se o projeto não for um repositório git, a revisão recorre a um snapshot de hashes de arquivos e às evidências registradas no cartão.

## Worklog

O trabalho que pode abranger várias sessões mantém um registro pequeno e limitado ao lado do código. `worklog/PLAN.md` contém o objetivo, o marco atual, os cartões ativos, os bloqueios e as decisões datadas; `worklog/INDEX.md` contém uma linha por cartão ativo. Cada cartão recebe `worklog/<task-id>.md` com um bloco de estado atual no topo e entradas curtas apenas de acréscimo abaixo.

Ao retomar, o agente lê primeiro PLAN e INDEX e depois apenas o bloco de estado e o final do cartão alvo, nunca o arquivo inteiro nem o diretório inteiro. PLAN fica abaixo de cerca de 100 linhas, os arquivos de cartão abaixo de cerca de 200, e os cartões concluídos são retirados do índice. Modelos compactos dos três arquivos ficam na persona do preset, então qualquer sessão pode criá-los ou atualizá-los sem ler este repositório.

## Perfis de modelo da equipe

A página de configurações mantém vários perfis de modelo nomeados para os membros padrão da equipe e usa o selecionado no próximo spawn.

Abra:

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

A barra de perfis no topo da página:

- **Alternar** o perfil (menu suspenso `团队配置`) que o próximo membro padrão da equipe usará.
- **新建配置** acrescenta um perfil com oito linhas de função vazias.
- **配置名称** renomeia o perfil selecionado. Os nomes são obrigatórios, exclusivos e têm no máximo 60 caracteres.
- **删除配置** exclui o perfil selecionado após um segundo clique de confirmação. O último perfil restante não pode ser excluído.

Cada perfil tem uma linha por membro padrão:

- **Modelo**: um menu suspenso que contém os modelos de todos os provedores, com cabeçalhos de grupo de provedor não clicáveis. Selecionar um modelo define provedor e modelo ao mesmo tempo.
- **Esforço de raciocínio**: um segundo menu suspenso com os esforços oferecidos pelo modelo selecionado, além de uma opção de padrão do modelo.

Um modelo vazio significa “herdar a rota do Lead”; um esforço vazio significa “usar o padrão do modelo”. `spawn_teammate_with_model` lê o padrão por função do perfil selecionado quando `model` é omitido; um `model` explícito tem precedência. O `spawn_teammate` simples sempre herda do Lead.

Níveis de capacidade sugeridos, como ponto de partida e não como regra:

| Função | Nível sugerido | Por quê |
| --- | --- | --- |
| `designer` | O mais alto | Um erro de design invalida todas as execuções |
| `advisor` | O mais alto, de família diferente do designer | A crítica independente precisa de uma perspectiva diferente |
| `builder` | Alto | Correção de código e contexto longo |
| `reviewer` | Alto, de família diferente do builder e do runner | A auditoria de evidências precisa de sua própria lente |
| `researcher` | Médio-alto | Julgamento sobre linhas de base e SOTA |
| `writer` | Médio | Redação organizada a partir de evidências verificadas |
| `data` | Médio-baixo | Obtenção procedural com ferramentas |
| `runner` | Médio-baixo | Confiabilidade de ferramentas mais que raciocínio profundo |

A lista completa de perfis é salva em conjunto, então alternar entre perfis não descarta edições feitas em outro. A página valida os nomes antes de salvar e mostra o texto de erro do servidor quando um salvamento é rejeitado.

O nome da linha importa: `research-team-settings` deve permanecer na **raiz do pacote** `dsh-research-team-preset`. O scanner de módulos cliente do DSH só descobre `dsh.client` em linhas que são exatamente a raiz do pacote; um nome com subcaminho inicia o plugin host, mas nunca carrega a página.

### Onde as configurações são armazenadas

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

- `activeProfileId` indica o perfil usado pelo próximo membro da equipe. O servidor recorre ao primeiro perfil quando ele está ausente ou é desconhecido.
- Um arquivo legado (`{ "roles": { ... } }` ou um mapa de funções sem wrapper) é migrado em memória para um único perfil chamado `默认配置`; o arquivo é reescrito no formato de perfis no próximo salvamento. Um `POST { "roles": ... }` legado atualiza apenas o perfil ativo, então scripts antigos não podem remover os outros perfis.
- O arquivo JSON é a fonte da verdade. O plugin host o carrega na inicialização; `getSettings()` e `modelForRole()` se atualizam a partir dele, de modo que a página e o próximo membro da equipe veem os valores mais recentes.
- Um arquivo ausente ou temporariamente ilegível mantém o último snapshot em memória válido em vez de apagá-lo.
- O arquivo de configurações **não** está neste repositório. Faça backup separadamente. Ele é por `DSH_HOME`, e não por perfil.
- Nenhuma credencial é armazenada; apenas nomes de perfil e strings de provedor/modelo/esforço.
- Salvar configurações tem efeito sem reiniciar o DSH: o armazenamento relê o arquivo e o próximo spawn resolve o perfil ativo. Alterar o código deste plugin ainda exige reiniciar o DSH, porque a metade host registra uma rota WebSocket/HTTP e um slot da página de Plugins no nível host.
- A versão 0.1.0 corrige um bug de loader em builds anteriores: o arquivo agrupa as funções sob `"roles"`, e o loader antigo passava o objeto inteiro para o normalizador de funções, o que produzia configurações totalmente vazias após reiniciar. O loader atual desembrulha `"roles"`, migra arquivos antigos e também aceita um mapa de funções sem wrapper, por compatibilidade.

## Referência de configuração

| Configuração | Local | Observações |
| --- | --- | --- |
| Id do preset | `cordis.patch.yml` | `research-team`; os cartões de tarefa devem usar `presetId=research-team` |
| Persona | `cordis.patch.yml` | Prompt de sistema em inglês; regras para todo o modo |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | Defina como `false` para remover `spawn_teammate_with_model` e seu wrapper de serviço |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | Provedores de subagente usados pela ferramenta de spawn modelada; padrões `spawn` / `fork` |
| Linha `research-team-settings` | `cordis.patch.yml` | Linha host de nível superior; mantenha o nome na raiz do pacote |
| Perfis de modelo da equipe | `$DSH_HOME/research-team-settings.json` | Perfis nomeados; o perfil ativo fornece provider/model/reasoningEffort para as oito funções padrão |

## Como funciona

- **Preset**: `cordis.patch.yml` declara a persona, as linhas de ferramentas, o submódulo modeled-teammates e a linha de configurações de nível superior.
- **Prompt do quadro de tarefas**: `plugin/index.js` registra uma seção de protocolo em inglês (`plugin:dsh-taskboard`) no escopo do preset e fornece `research_project` para resolver o workspace atual.
- **Roteamento por função**: `plugin/modeled-teammates.js` envolve `subagents.startActivation` com `AsyncLocalStorage` e injeta `agentOptions` apenas em uma chamada `spawn_teammate_with_model`. O pacote oficial do Agent Teams permanece intacto. O Cordis expõe serviços como um proxy rastreável, então o wrapper verifica seu próprio descritor de propriedade em vez da identidade do método.
- **Configurações**: `settings/index.js` carrega e salva o arquivo JSON de perfis e serve `GET/POST /api/dsh-research-team-settings`; `client/index.js` registra o editor de perfis da página de Plugins via `plugins.row.config`.
- **Atualização**: `plugin/settings-store.js` mantém o snapshot em memória, resolve o perfil ativo em cada leitura e spawn e preserva o último snapshot válido se uma leitura falhar.

## Solução de problemas

### As configurações parecem ser redefinidas após reiniciar

A versão 0.1.0 corrige a causa conhecida: o loader antigo passava o objeto `{ roles: ... }` inteiro para o normalizador de funções e produzia configurações totalmente vazias. Atualize para 0.1.0 ou mais recente, reinicie o DSH e verifique se:

- `$DSH_HOME/research-team-settings.json` existe e contém os perfis salvos;
- arquivos antigos `{ "roles": ... }` são mostrados como um único perfil `默认配置` e são reescritos no formato de perfis no próximo salvamento;
- a linha `research-team-settings` tem exatamente o nome `dsh-research-team-preset`;
- o host atual está executando este checkout, e não uma cópia instalada desatualizada.

### Cada colega roda no modelo do Lead

Veja a saída do spawn impressa acima da primeira mensagem do membro. Ela mostra `requested=<provider>/<model> effort=<effort>` quando uma rota configurada ou explícita foi aplicada, e `requested=inherit (Lead route)` com uma linha `note:` quando nenhuma rota correspondeu. Uma `note:` que nomeia um papel significa que esse papel não tem provider/model no perfil ativo; uma nota dizendo que o nome não é um papel padrão significa que o nome do colega não continha nenhuma palavra de papel.

Outras duas causas não têm a ver com o arquivo de configurações:

- o Lead chamou o `spawn_teammate` simples em vez do `spawn_teammate_with_model`, que sempre herda do Lead. A persona diz ao Lead para não passar `model` à ferramenta modeled e nunca recuar por incerteza sobre nomes;

- a linha de configurações foi salva sob um `DSH_HOME` diferente do que o host em execução lê. Compare a linha `settings file:` impressa por `research_team_routes` com `echo $DSH_HOME`.

### A página de configurações não aparece em Plugins

- A linha deve ser a raiz do pacote, não `dsh-research-team-preset/settings`.
- A parte cliente exige reiniciar o DSH e atualizar o navegador após a instalação.
- Verifique se o bundle está ativo no perfil.

### Faltam ferramentas de equipe

Ative [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) no mesmo perfil e reinicie. O instalador não solicita esse bundle.

### Faltam ferramentas do quadro de tarefas

Ative [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) no mesmo perfil e reinicie.

### `spawn_teammate_with_model` está indisponível

O submódulo envolve um serviço interno de subagente. Uma atualização do DSH pode mudar o formato da ativação. Verifique o texto da falha; se o wrapper não conseguir ser instalado, defina `research-modeled-teammates.enabled: false`, reinicie e use o `spawn_teammate` simples.

### O preset não aparece na lista

Confirme que o bundle está instalado e ativo, reinicie o DSH e abra uma nova sessão. As declarações de preset são carregadas na inicialização.

### `research_project` não consegue resolver o workspace

Abra o diretório de trabalho como um projeto/workspace do DSH na GUI ou passe um projeto conhecido; a ferramenta não adivinha.

## Limitações conhecidas

- O roteamento de modelo por função é um wrapper de serviço interno, não uma extensão oficial do Agent Teams. Atualizações do DSH podem quebrá-lo; o fallback está documentado acima.
- Dependências de nível de perfil não são instaladas nem ativadas automaticamente. Este repositório as documenta, mas não as gerencia.
- Os perfis de modelo da equipe ficam em um arquivo JSON autônomo em `$DSH_HOME`; eles não fazem parte da exportação/backup padrão de configuração do DSH. Copie o arquivo se você trocar de máquina.
- O menu de modelos é um `<select>` nativo com grupos de provedor, não um seletor personalizado com busca.
- O modo não cria automaticamente oito membros da equipe ao iniciar a sessão. O Lead cria as funções conforme a tarefa exige.
- O modo nunca inicializa um repositório dentro de um repositório existente e nunca faz commit por conta própria do worklog nem do andaime do repositório.
- Os membros podem usar uma camada de subagente; a delegação mais profunda é desativada intencionalmente.

## Licença

MIT. Consulte o arquivo [LICENSE](../LICENSE).

## Agradecimentos

Construído sobre o [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) e o [Cordis](https://github.com/cordiverse/cordis). A integração com o quadro de tarefas usa o plugin [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard); as ferramentas de equipe vêm do bundle oficial do perfil Agent Teams. Agradecemos aos autores dos plugins e a todos que testam o modo em projetos de pesquisa reais.

As notas de contribuição e desenvolvimento interno estão em [DEVELOPMENT.md](../DEVELOPMENT.md).
