# Research Team Mode

[![powered by dsh](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness) [![DSH 0.2.x](https://img.shields.io/badge/DSH-0.2.x-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness) [![license MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

**하나의 세션을 작고 긴밀하게 협력하는 연구 팀으로 바꾸는 DSH 에이전트 프리셋입니다.**

**버전 0.1.1** · **업데이트 2026-11-10**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <strong>한국어</strong> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.hi.md">हिन्दी</a></p>

---

## 개요

Research Team Mode는 단일 채팅이 아니라 팀으로 연구를 끝까지 수행하기 위한 DSH 에이전트 프리셋입니다. Lead는 작업을 계획하고, 작업 로그 기록(사용자 게이트는 카드 파일, 내부 단계는 INDEX 행)을 유지하며, 일을 배분하고, 결과를 통합하고, 사용자와 소통합니다. 8개 기본 역할이 자문, 문헌과 증거, 데이터 확보, 실험 설계, 코드, 실행, 독립 검토, 논문 작성을 담당합니다.

이 모드는 며칠 또는 몇 주에 걸친 연구, 추적 가능한 증거가 필요한 작업, 명확한 역할 경계가 도움이 되는 작업을 위해 만들어졌습니다. 일회성 질의응답 모드가 아닙니다. Lead는 작업에 실제로 필요한 역할만 생성합니다.

## 한눈에 보기

| | |
| --- | --- |
| **기본 역할** | 8개: advisor, designer, researcher, data, builder, runner, reviewer, writer |
| **워크플로** | 게이트 기반: 내부 단계는 작업 로그 색인 행, 사용자 게이트는 카드 파일; 생성, 인수, 실행, 보고, 검토, 사용자 승인 |
| **완료** | `in_review`가 에이전트의 마지막 지점입니다. 사용자만 카드를 `done`으로 옮길 수 있습니다 |
| **모델 라우팅** | Plugins 페이지 설정 폼에서 역할별 provider, model, 추론 강도(reasoning effort)를 지정합니다 |
| **Git** | 실질적 작업이 시작될 때 에이전트가 초기화. 파괴적 변경은 브랜치에서 진행하고 수락 후에만 병합 |
| **Worklog** | `.research/worklog/`의 JSON 저장소. `PLAN.md`와 `INDEX.md`는 생성된 보기. 재개 시 먼저 `research_state` |
| **런타임** | PTC(`run_code` + 생성된 SDK), 멤버당 하위 에이전트 계층 1개 |

## 대상 사용자

- 문헌 검토, 구현, 실험, 논문 산출을 함께 수행하는 연구 프로젝트.
- 주장에서 출처, 실행 기록, 로그까지 증거 흔적이 필요한 팀.
- 범용 에이전트 하나 대신 자문(advisor)과 독립 검토자(reviewer)를 두고 싶은 사용자.
- 최종 수락 결정을 에이전트가 아니라 사용자가 내려야 하는 작업.

**대상이 아닌 경우:** 빠른 사실 확인 질문, 단일 파일 수정, 일회성 답변으로 충분한 작업. 이 모드는 Lead에게 단순한 질문은 직접 답하고 실질적인 연구에만 팀을 동원하도록 지시합니다.

## Lead가 사용자와 소통하는 방식

Lead의 답변은 상태 피드가 아니라 과학적 커뮤니케이션이다. 주장이나 결과를 먼저 제시하고 그 근거(run id, 데이터셋, 불확실성과 표본 크기를 포함한 지표, 출처)를 붙인 뒤, 무엇이 아직 불확실한지, 마지막으로 사용자가 결정해야 할 것을 말한다. 모든 진술은 관찰된 사실, 추론, 가설, 미해결 질문 중 무엇인지 표시되며, 방법은 사용자가 따라가고 계속 배울 수 있을 만큼 설명된다.

내부 메커니즘은 내부에 남는다. 에이전트 간 인계, 재시도, 도구 오류, 작업 로그 기록, 작업 중 팀이 얻은 교훈은 결과 해석을 바꾸거나 결정을 막지 않는 한 전달되지 않는다. 구성원 보고는 그대로 붙여넣지 않고 주장·근거·한계로 번역된다.

분업은 명시적이다. 사용자가 과학적 방향을 정하고 증거를 판단하며, 팀이 검색, 구현, 실험, 검증의 부담을 진다.

당신의 질문이 이번 턴의 계약입니다. 서베이, 확장 목록, 결정을 요청하면 답변이 먼저 그것을 전달합니다. 연구 계획, 게이트, 중단 기준은 추가일 뿐 대체가 아닙니다. 답변은 질문을 순서대로 다루며 각각의 근거와 전체 내용이 있는 파일을 제시하고, 아직 답할 수 없는 것은 솔직히 말합니다.

긴 턴이 침묵의 턴은 아닙니다. 팀이 약 10분 넘게 작업하면 Lead는 짧은 중간 답변을 보냅니다. 무엇이 확정되었고 무엇을 더 모으고 있으며 다음 답변이 언제 오는지 알려 주어, 연산을 다 쓰기 전에 방향을 바꿀 수 있게 합니다.

선행 연구의 부정적 결과가 제약하는 것은 그것을 낳은 방법, 데이터, 예산이지 아이디어 자체가 아닙니다. 방향을 닫기 전에 그 아이디어의 가장 강한 버전을 쓰고 그것도 실패함을 보입니다. “주장할 수 없다”고 쓸 때는 언제나 주장할 수 있는 버전과 그것을 뒷받침할 증거를 함께 적습니다.

## 요구 사항

| 기능 | 제공자 | 비고 |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | `0.2.1-rc.5` 기준으로 개발되었습니다. 다른 릴리스에서도 동작할 수 있지만 보장되지는 않습니다 |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent`와 Team 서비스를 제공합니다. 이 프리셋은 작업을 작업 로그에 기록하고 팀 작업에는 기록하지 않습니다 |
| PTC 런타임 | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) 및 [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | DSH 기본 구성의 일부이며 `run_code`를 활성화합니다 |

**선택적 연동 플러그인.** 다른 제작자가 만든 플러그인입니다. 이 프리셋은 이들 없이도 동작하며 설치하지도 않습니다. 팀과 연동하려는 경우에만 추가하세요:

- **Zotero**(`dsh-zotero`) — 공유 라이브러리 도구(`zotero_*`)와 paper-fetch 가져오기 경로를 제공합니다. 없으면 문헌 작업은 Semantic Scholar, arXiv, 웹을 사용하며 증거 표는 주장·출처·위치를 계속 기록합니다.
- **Mnemon**(`dsh-mnemon`) — 세션 간 영구 노트(`mnemon_*`)를 제공합니다. 없으면 worklog와 `CHANGELOG.md`가 연속성을 담당합니다.

의존성이 없으면 모드는 부분적으로 로드될 수 있지만, 팀 도구, 작업 로그 또는 설정 페이지를 사용할 수 없습니다. 플러그인 관리자는 이러한 번들을 제안하지 않으며 자동으로 연결하지도 않습니다.

## 설치

이 프리셋은 DSH 번들로 배포되며 npm에 `dsh-research-team-preset`으로 게시되어 있습니다.

### DSH 플러그인 페이지에서 설치

2. **설정 → 플러그인**을 열고 **추가**를 클릭합니다.
3. 설치 소스를 붙여넣습니다: npm 패키지는 `dsh-research-team-preset@0.1.1`, 소스를 고정하려면 `github:ZhanRuiXin/dsh-research-team-preset#v0.1.1`, 로컬 체크아웃은 `link:/absolute/path/to/dsh-research-team-preset`.
4. **DSH를 재시작합니다.** 프리셋 행과 번들의 클라이언트 부분은 시작 시 로드됩니다.
5. **같은 프로필에서 번들이 활성화되어 있는지 확인**한 뒤, **새 세션을 열고** 모드 선택기에서 **Research Team Mode**를 선택합니다.

### 명령줄에서 설치

```text
dsh plugin add dsh-research-team-preset@0.1.1
```

레지스트리 대신 소스를 고정하려면:

```text
dsh plugin add github:ZhanRuiXin/dsh-research-team-preset#v0.1.1
```

> 이 모드는 프로필 수준 번들입니다. 한 프로필에 설치해도 다른 프로필에서는 활성화되지 않습니다. 프로필마다 설치와 사전 요구사항을 반복하세요.

## 첫 실행

실제 작업을 시작하기 전에 Lead에게 환경과 작업 로그를 확인하도록 요청하십시오:

```text
list_agents                    # create only the roles the task needs
research_project               # resolve the current project root
research_workspace_init        # seed .research/worklog/ and render the views if missing
```

일반적인 첫 작업:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> research_state -> research_worklog op=update (status=todo, next) + send_message
Members: research_worklog op=claim -> work -> research_worklog op=gate (evidence, next) + send_message
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (research_worklog op=update, by="user")
```

## 기본 팀

| 역할 | 책임 |
| --- | --- |
| `advisor` | 방향, 프레이밍, 핵심 주장, 증거의 충분성, 논문 전략을 독립적으로 평가한다. 기본적으로 건설적: 무엇이 성립하는지 먼저 말하고, 결과를 위협하는 소수의 문제를 제시하며, 각 문제에 최소 수정 또는 구체적 대안을 붙이고, 마지막에 proceed / revise / stop을 제시한다. 조언일 뿐 게이트가 아니다 |
| `researcher` | 문헌 검색, 확보, 정독, 증거 추출, 그리고 주장 → 출처 → 위치 증거 표. 공유 Zotero 라이브러리를 먼저 검색하고, 필요한 문헌이 없으면 PDF가 첨부된 정식 출판본 전체 논문을 가져오며, DOI/제목으로 중복을 제거하고, `zotero://` 참조를 팀과 공유합니다 |
| `data` | 외부 데이터셋 및 모델 가중치 확보. 출처 가용성과 라이선스/접근 상태 추적, 재개와 속도 제한을 처리하는 다운로드 도구, 게시자 해시 기반 무결성 검증, 압축 해제, manifest 계약, 검증된 소규모 샘플, 디스크 장부를 담당합니다. 훈련 코드를 작성하거나 평가 프로토콜을 변경하지 않습니다 |
| `designer` | 실험 설계 문서를 소유합니다: 질문과 가설, 프로토콜과 통제, 베이스라인, ablation, 지표와 통계 계획, 컴퓨트 예산, 그리고 실행이 진행 중일 때의 설계 변경 관리. 프로덕션 코드를 작성하거나 실험을 실행하지는 않습니다 |
| `builder` | 코드, 구성, 데이터 파이프라인, 테스트, 재현 가능한 진입점; 장시간 훈련 실행은 하지 않습니다 |
| `runner` | 훈련/평가를 시작하고 모니터링하며, 실행 id, 구성, 시드, 지표, 로그, 체크포인트, 산출물 경로를 기록합니다 |
| `reviewer` | 문헌 노트, 코드, 결과, 논문의 주장/인용을 독립적으로 검증하고, 차단 증거와 함께 PASS/FAIL을 판정합니다 |
| `writer` | LaTeX 논문 초안: 본문, 섹션, 표, 캡션, 인용, 그림 코드; 실험을 실행하거나 코드/모델을 변경하지 않습니다 |

Lead는 목표 명확화, 분해, 작업 로그 관리, 배정, 통합, 요약, 최종 산출물 조립, 전달을 담당합니다. 멤버는 범위가 정해진 하위 작업에 하위 에이전트 계층을 하나 사용할 수 있지만, 팀원을 만들 수는 없습니다. Lead는 자신의 도구 호출을 가볍게 유지하고, 짧은 진행 보고로 충분한 일에 도구를 더 호출하지 않으며, 깊은 작업은 담당 멤버에게 맡깁니다.

### 공유 Zotero 라이브러리

researcher는 사용자의 Zotero 라이브러리를 팀의 공유 문헌 출처로 취급합니다. 공개 웹보다 기존 컬렉션과 항목을 먼저 검색하고, 첨부된 PDF와 주석에서 발췌한 구절을 재사용하며, 빠진 논문은 정식 출판본(version of record)으로만 가져오고 이때 PDF를 첨부해 프로젝트 컬렉션에 정리합니다. 가져올 때는 DOI와 제목으로 중복을 제거하고, 사용자의 태그와 컬렉션은 그대로 두며, `zotero://` 항목 참조를 증거 표와 작업 로그 카드에 기록합니다. 그래서 모든 팀원이 같은 논문을 읽고 reviewer가 같은 페이지를 표본 확인할 수 있습니다. 전문이 유료 장벽 뒤에 있거나 메타데이터만 존재하면, researcher는 대체 문헌을 가져오지 않고 링크를 기록하며 해당 증거를 메타데이터만 있음(metadata-only)으로 표시합니다.

### 자문 리뷰

자문은 게이트키퍼가 아니라 과학적 공동 사고자다. 먼저 계획에서 무엇이 성립하는지와 그 이유를 말하고, 결과를 위협하는 정도에 따라 최대 세 가지 문제를 제시하며, 각 문제를 구체적인 단계, 주장, 숫자에 연결한다. 모든 문제에는 계획을 수용 가능하게 만드는 최소 수정 또는 절충을 명시한 구체적 대안이 따라붙는다. 거부만으로는 리뷰가 아니다. 그것은 ‘이 계획으로는 질문에 답할 수 없다’와 ‘이 계획은 작동하지만 더 약하거나 더 비싸다’를 구분하고, 어떤 조건에서 계획이 수용 가능해지는지 밝히며, proceed, revise(필수 변경 나열), stop(대신 가야 할 방향 제시)으로 끝맺는다. 프로젝트가 실제로 내건 기준으로 판단하고 그 기준을 밝히며, 가장 엄격한 기준을 가정하지 않는다. 제시된 목표에 타당한 계획은 더 강한 주장에 더 많은 증거가 필요하다는 이유로 실패가 아니다. 목표 자체가 잘못되었다면 범위 결정으로 별도로 사용자에게 돌린다. 판단에 필요한 증거가 없으면 결론을 낼 수 있는 가장 저렴한 실험이나 출처를 지목한다. 타당한 계획에는 의심을 만들어 내지 않고 명확히 지지하며, stop에는 반드시 대체 방향을 붙인다. 여전히 조언일 뿐이며, 결정은 Lead가 하고 reviewer는 독립적인 PASS/FAIL 게이트로 남는다.

상담은 매번 Lead가 준비하며 대화를 그대로 전달하지 않는다. Lead는 사용자의 질문을 advisor가 답해야 할 결정으로 번역하고, 쟁점이 되는 주장이나 계획, 현재 증거와 그 범위, 선택지, 제약, 그리고 사용자가 그 답에서 무엇을 필요로 하는지를 함께 적는다. 모호하거나 과부하된 질문은 먼저 좁히고, 사용자의 원문과 팀 내부 경위는 그대로 넘기지 않는다. 상담은 결정 지점마다 한 번만 하며, Lead가 증거로 스스로 변호할 수 있는 결론을 확인하거나 Lead 자신의 작업을 요약하는 데 쓰지 않는다. 답은 전달문이 아니라 과학적 결론으로서, 무엇이 달라지고 어떤 결정이 사용자에게 남는지의 형태로 사용자에게 전한다.

## 설계 소유권

Lead는 실험 설계를 직접 작성하지 않습니다. 설계 비중이 큰 작업에서는 designer가 프로젝트 워크스페이스의 설계 문서(`docs/design/<name>.md` 또는 프로젝트에 이미 있는 설계 위치)를 소유합니다: 질문과 가설, 프로토콜과 통제, 베이스라인, ablation, 지표와 통계 계획, 컴퓨트 예산, 그리고 실행이 진행 중일 때 이루어진 설계 변경에 대한 변경 로그입니다.

builder는 설계를 구현하고 runner는 이를 실행하며, reviewer는 제안 게이트에서 설계가 질문에 답할 수 있는지, 결과 게이트에서 실행이 설계와 일치했는지 확인합니다. advisor는 제안 게이트에서 독립적인 과학적 검토 의견을 제시합니다. Lead는 설계 문서가 존재하고 researcher와 data의 입력이 마련되었는지 확인한 뒤 해당 단계를 승인하거나 반려합니다. 구현 주도 작업에서는 builder가 설계 초안을 작성하고 advisor가 이를 한 번 검토합니다.

## 쓰기 범위

각 역할은 자기 쓰기 범위 안에서만 쓴다. advisor와 reviewer는 아무것도 쓰지 않는다. researcher는 `literature/`, `notes/`, `docs/evidence`를, data는 `data/`, `manifests/`, `scripts/` 아래 다운로드 스크립트와 `reports/`를, designer는 `docs/design/`을, builder는 `src/`, `configs/`, `tests/`를, runner는 `runs/`, `logs/`, `checkpoints/`를, writer는 `paper/`, `figures/`를 소유한다. Lead는 제한이 없다. 읽기, 검색, 카드 댓글은 모두에게 열려 있다.

범위는 선호가 아니라 계약이다. 다른 역할에 속한 변경은 잘못된 구성원이 쓰는 대신 그 소유자에게 보고한다. advisor와 reviewer는 읽기 전용으로 시작하므로 리뷰는 무엇을 바꿔야 하는지 보고할 뿐 직접 바꾸지 않는다. 범위 밖 쓰기가 정말 필요한 팀원은 작업 시작 전에 Lead의 명시적 예외를 받아 카드에 기록한다. 다른 모든 역할은 Lead의 sandbox 권한을 상속하므로, 역할이 요구하지 않는 한 팀원이 Lead보다 더 제한되지 않는다.

카드를 in_review로 옮기기 전에 소유자나 Lead가 역할과 변경 경로(또는 base와 head 커밋)를 지정해 `research_scope_check`를 실행한다. 위반은 변경을 소유 역할로 옮기거나 Lead가 승인한 예외를 기록해 해결하며, 카드 진행 중에 범위를 넓히지 않는다. 프로젝트는 `AGENTS.md`나 카드에서 범위를 좁히거나 넓힐 수 있고, 그 단계에서는 카드가 우선하며 이후 세션도 같은 규칙을 읽는다.

## 실험 착수 조건

계산 자원은 결정을 위해 쓰고, 활동량을 위해 쓰지 않는다. 단순한 스모크 테스트를 넘는 실행은 판정 규칙을 적기 전에는 시작하지 않으며, 그 규칙은 "중단"을 돌려줄 수 있어야 한다. 착수 전에 이 실행이 결판낼 질문, 가설, 지지로 볼 효과 크기를 포함한 기대 결과, 그것을 반박할 결과, 중단 기준, 넘어야 할 베이스라인, 결판낼 수 있는 최소 파일럿, 계산 예산을 설계 문서나 워크로그에 기록한다. 이 기록이 없는 실행은 승인되지 않는다.

먼저 파일럿을 돌린다. 가설을 여전히 반박할 수 있는 최소 구성(시드 1개, 분할 1개, 부분집합, 더 짧은 학습 시간)으로 실행하고, 사전 등록한 임계값과 대조해 읽은 뒤 확대할지 명시적으로 결정한다. 파일럿이 임계값에 미달하면 그 라인을 멈추고 부정적 결과를 기록해 보고한다. 차이를 평균으로 지우려고 시드나 변형을 더하지 않는다. 변수는 한 번에 하나만 바꾸고, 실행 전에 교란 요인을 밝히며, 실행 중 프로토콜 변경은 이유와 함께 기록한다. 실행은 예산, 같은 실패의 두 번째 반복, 지표가 더 이상 움직이지 않음, 이 세 가지로도 끝낸다.

Lead가 실행을 승인하고, runner는 기록이 없으면 시작을 거부하며, reviewer는 결과 게이트에서 실행이 사전 등록 규칙과 일치했는지, 중단 결정이 뒤집히지 않고 지켜졌는지 확인한다.

## 세션 연속성

세션은 대화이지 프로젝트가 아닙니다. `.research/worklog/`, git, 아키텍처 카드가 작업을 보존하고 채팅·팀·백그라운드 작업은 세션과 함께 사라집니다. 재개 시 먼저 `research_state`를 호출하고 항목과 증거를 읽으십시오.

세션은 대화이지 프로젝트가 아닙니다. `.research/worklog/`, git, 아키텍처 카드가 작업을 보존하고 채팅·팀·백그라운드 작업은 세션과 함께 사라집니다. 재개 시 먼저 `research_state`를 호출하십시오.

턴을 넘겨 계속되는 실행이나 장기 작업은 작업이나 터미널 핸들, 호스트, 시작 시각, 예상 완료, 그것이 따르는 결정 규칙을 카드 파일이나 PLAN에 남긴다. 재개 시 먼저 생존을 확인하고, 핸들이 사라졌으면 고아 실행으로 표시해 산출물을 대조한 뒤 채택·재시작·중단을 사용자에게 묻는다. 같은 작업을 조용히 두 번 실행하지 않는다. 더 이상 존재하지 않는 세션이 보유한 카드는 인수하지 않고 사용자에게 재개를 요청한다.

## 연구 사이드바

세션을 넘는 작업은 `.research/worklog/`의 JSON으로 저장합니다. `plan.json`에 목표·마일스톤·다음 단계·결정, 항목마다 `items/<id>.json`. `PLAN.md`, `INDEX.md`, 카드는 도구가 생성하며 손으로 고치지 않습니다.

아키텍처 카드는 `.research/architecture/` 아래에 JSON으로 저장되는 노드-엣지 다이어그램이며 카드마다 한 파일입니다. 에이전트는 `research_architecture` 도구로 읽고 갱신하므로 다이어그램이 슬라이드 속에서 낡지 않고 설계와 함께 움직입니다. 카드는 패널 안에서 SVG로 렌더링되고, 노드 위를 드래그해 상자로 선택할 수 있으며, 선택한 노드는 대화로 인용할 수 있고, 남길 만한 내용은 카드에 메모로 저장되어 에이전트가 답하기 전에 읽습니다. `dsh-better-sidebar`가 설치되어 있으면 이를 통해 등록하고, 아니면 네이티브 오른쪽 사이드바에 등록합니다.

패널은 현재 팀도 보여 줍니다. 각 구성원의 이름, 역할, 모델, 상태(실행 중 또는 대기 중)와 그 구성원이 맡은 작업 항목입니다.

실험 섹션은 실행을 최신순으로 보여주고 실행 중이면 경과 시간, 끝났으면 소요 시간을 표시합니다. 각 실행은 명확한 수명 주기(등록됨, 승인 대기, 승인됨, 실행 중, 완료, 중지, 실패, 거부)를 가지며 `research_experiment` 도구가 진행합니다. register는 판단 규칙, seed, 예산을 쓰고, start는 승인 없이는 거부하며, finish는 완료·중지·실패를 이유와 함께 기록합니다. 제목에는 전환(승인 필요 / 자동 승인)이 있고, 승인을 기다리는 실행은 승인·거절 버튼을 보여 그 결과를 manifest에 쓰며, 목록은 자기 상자 안에서 스크롤됩니다.

패널은 `panel/` 아래의 독립 모듈로 설정 페이지와 분리되어 있으며 따로 켜거나 끌 수 있습니다. 각 대화의 오른쪽 사이드바 탭으로 나타납니다.

방법을 설명하는 카드는 디자이너가, 구현을 설명하는 카드는 빌더가 소유하며, 어떤 그룹으로 나눌지는 프로젝트가 직접 정합니다. 어드바이저는 설계나 구현 결정을 검토하기 전에 이 카드들을 읽고, 리뷰어는 결과 게이트에서 대조합니다. 가운데 버튼으로 드래그해 캔버스를 이동하고, 도구 모음에서 확대하며, 노드 위를 드래그해 선택해 주석을 남길 수 있습니다.

## 작업 로그와 협업

상태 전이는 고정 표를 따릅니다(`todo → in_progress → in_review → done`). `blocked`와 `canceled`는 보조 상태입니다. `blocked`에는 이유가 필요하고, 게이트에는 증거가 최소 하나 필요하며, 모든 전이는 항목 기록에 남습니다.

게이트에서 담당자는 증거가 있는 체크리스트, 실행 요약, 커밋 범위, 다음 행동을 카드 파일에 쓰고, 변경된 경로에 `research_scope_check`를 실행한 뒤 상태를 `in_review`로 바꿉니다. reviewer는 증거와 함께 PASS/FAIL을 씁니다. Lead는 게이트에 도달했을 때나 사용자가 판단해야 할 때만 카드 id, 상태, 증거를 보고합니다. `done`은 사용자의 승인만 설정할 수 있습니다. `blocked`는 계속할 수 없음, `canceled`는 더 진행하지 않음입니다.

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

## Git 워크플로

파괴적이거나 위험한 변경은 기본 브랜치를 직접 수정하지 않고 단계 이름의 브랜치(예 `task/<title>+<id>`; 게이트 작업은 카드, 내부 작업은 팀 작업의 이름)에서 진행합니다. 카드 또는 팀 작업에 base와 head 커밋을 기록하고, reviewer는 `git diff <base>..<head>`를 코드 리뷰 근거로 삼고 승인 검사도 다시 실행합니다.

브랜치는 카드가 수락된 뒤에만 병합하고 그다음 삭제합니다. 데이터셋, 체크포인트, 로그, 캐시 같은 생성물은 저장소에 넣지 않습니다. git 저장소가 아니면 파일 해시 스냅샷과 카드의 증거로 리뷰합니다.

## 워크로그

세션은 대화이지 프로젝트가 아닙니다. `.research/worklog/`, git, 아키텍처 카드가 작업을 보존하고 채팅·팀·백그라운드 작업은 세션과 함께 사라집니다. 재개 시 먼저 `research_state`를 호출하고 항목과 증거를 읽으십시오.

재개 시 먼저 `research_state`, 그다음 `research_worklog op=get`으로 항목과 최신 증거를 읽습니다. 보기는 거울일 뿐이며 원본은 JSON입니다.

## 팀 모델 프로필

설정 페이지는 기본 팀원을 위한 이름 있는 모델 프로필 여러 개를 유지하며, 다음 스폰에는 선택한 프로필을 사용합니다.

여십시오:

```text
Plugins → dsh-research-team-preset → research-team-settings → Configure
```

페이지 상단의 프로필 바에서 다음을 할 수 있습니다:

- 다음 기본 팀원이 사용할 프로필(`团队配置` 드롭다운)을 **전환**합니다.
- **新建配置**는 역할 행 여덟 개가 비어 있는 프로필을 추가합니다.
- **配置名称**은 선택한 프로필의 이름을 바꿉니다. 이름은 필수이고 고유해야 하며 최대 60자입니다.
- **删除配置**는 한 번 더 확인 클릭한 뒤 선택한 프로필을 삭제합니다. 마지막으로 남은 프로필은 삭제할 수 없습니다.

각 프로필에는 기본 멤버마다 한 행이 있습니다:

- **모델**: 모든 제공자의 모델을 담은 하나의 드롭다운이며, 클릭할 수 없는 제공자 그룹 헤더가 있습니다. 모델을 선택하면 provider와 model이 함께 설정됩니다.
- **추론 강도**: 선택한 모델이 공개하는 추론 강도 목록과 모델 기본값 옵션이 있는 두 번째 드롭다운입니다.

빈 모델은 "Lead의 라우트 상속"을, 빈 강도는 "모델 기본값 사용"을 의미합니다. `spawn_teammate_with_model`은 `model`을 생략하면 선택한 프로필의 역할별 기본값을 읽으며, 명시적 `model`은 이를 덮어씁니다. 일반 `spawn_teammate`는 항상 Lead를 상속합니다.

권장 역량 등급은 규칙이 아니라 출발점입니다:

| 역할 | 권장 등급 | 이유 |
| --- | --- | --- |
| `designer` | 가장 높음 | 설계 오류는 모든 실행을 무효로 만듭니다 |
| `advisor` | 가장 높음, designer와 다른 모델 계열 | 독립적 비판에는 다른 관점이 필요합니다 |
| `builder` | 높음 | 코드 정확성과 긴 컨텍스트 |
| `reviewer` | 높음, builder 및 runner와 다른 모델 계열 | 증거 감사에는 자체적인 시각이 필요합니다 |
| `researcher` | 중간~높음 | 베이스라인과 SOTA 판단 |
| `writer` | 중간 | 검증된 증거로 정리한 작성 |
| `data` | 중간~낮음 | 도구를 활용한 절차적 확보 |
| `runner` | 중간~낮음 | 깊은 추론보다 도구 신뢰성 |

프로필 목록 전체가 한꺼번에 저장되므로, 프로필을 전환해도 다른 프로필에서 편집한 내용이 버려지지 않습니다. 페이지는 저장 전에 이름을 검증하며, 저장이 거부되면 서버의 오류 텍스트를 표시합니다.

행 이름이 중요합니다: `research-team-settings`는 **패키지 루트** `dsh-research-team-preset`에 있어야 합니다. DSH의 클라이언트 모듈 스캐너는 정확히 패키지 루트인 행에 대해서만 `dsh.client`를 탐색합니다. 하위 경로 이름을 쓰면 호스트 플러그인은 시작되지만 페이지는 절대 로드되지 않습니다.

### 설정이 저장되는 위치

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

- `activeProfileId`는 다음 팀원이 사용할 프로필을 지정합니다. 값이 없거나 알 수 없는 값이면 서버는 첫 번째 프로필로 대체합니다.
- 레거시 파일(`{ "roles": { ... } }` 또는 래핑 없는 역할 맵)은 인메모리에서 `默认配置`라는 단일 프로필로 마이그레이션되며, 파일은 다음 저장 시 프로필 형태로 다시 기록됩니다. 레거시 `POST { "roles": ... }`는 활성 프로필만 갱신하므로 이전 스크립트가 다른 프로필을 없애지 못합니다.
- JSON 파일이 기준 원본(source of truth)입니다. 호스트 플러그인은 시작 시 이 파일을 로드하며, `getSettings()`와 `modelForRole()`은 이 파일에서 값을 새로 고칩니다. 따라서 페이지와 다음 팀원은 최신 값을 봅니다.
- 파일이 없거나 일시적으로 읽을 수 없을 때는 마지막으로 정상인 인메모리 스냅샷을 지우지 않고 유지합니다.
- 설정 파일은 이 저장소에 **없습니다**. 별도로 백업하십시오. 프로필 단위가 아니라 `DSH_HOME` 단위입니다.
- 자격 증명은 저장되지 않으며 프로필 이름과 provider/model/effort 문자열만 저장됩니다.
- 설정 저장은 DSH 재시작 없이 적용됩니다. 저장소가 파일을 다시 읽고 다음 스폰에서 활성 프로필을 확인합니다. 이 플러그인의 코드 자체를 변경하려면 여전히 DSH 재시작이 필요합니다. 호스트 절반이 호스트 수준에서 WebSocket/HTTP 라우트와 Plugins 페이지 슬롯을 등록하기 때문입니다.
- 버전 0.1.0은 이전 빌드의 로더 버그를 수정합니다. 파일은 역할을 `"roles"` 아래에 감싸는데, 이전 로더는 객체 전체를 역할 정규화기(role normalizer)에 넘겨서 재시작 후 모든 설정이 비어 있었습니다. 현재 로더는 `"roles"`를 풀어내고, 이전 파일을 마이그레이션하며, 호환성을 위해 래핑 없는 역할 맵도 지원합니다.

## 구성 참조

| 설정 | 위치 | 비고 |
| --- | --- | --- |
| 프리셋 id | `cordis.patch.yml` | `research-team`; 작업 카드는 `presetId=research-team`을 사용해야 합니다 |
| 페르소나 | `cordis.patch.yml` | 영어 시스템 프롬프트; 모드 전체 규칙 |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | `false`로 설정하면 `spawn_teammate_with_model`과 해당 서비스 래퍼가 제거됩니다 |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | modeled spawn 도구가 사용하는 하위 에이전트 제공자; 기본값 `spawn` / `fork` |
| `research-team-settings` 행 | `cordis.patch.yml` | 최상위 호스트 행; 패키지 루트 이름을 유지하십시오 |
| 팀 모델 프로필 | `$DSH_HOME/research-team-settings.json` | 이름 있는 프로필; 활성 프로필이 여덟 기본 역할의 provider/model/reasoningEffort를 제공합니다 |

## 동작 방식

- **프리셋**: `cordis.patch.yml`이 페르소나, 도구 행, modeled-teammates 하위 모듈, 최상위 설정 행을 선언합니다.
- **역할별 라우팅**: `plugin/modeled-teammates.js`가 `AsyncLocalStorage`로 `subagents.startActivation`을 감싸고 `spawn_teammate_with_model` 호출에만 `agentOptions`를 주입합니다. 공식 Agent Teams 패키지는 수정되지 않습니다. Cordis는 서비스를 추적 가능한 프록시로 반환하므로, 래퍼는 메서드 동일성 대신 자체 속성 설명자를 검증합니다.
- **설정**: `settings/index.js`가 프로필 JSON 파일을 로드/저장하고 `GET/POST /api/dsh-research-team-settings`를 제공합니다. `client/index.js`는 `plugins.row.config`를 통해 Plugins 페이지의 프로필 편집기를 등록합니다.
- **새로 고침**: `plugin/settings-store.js`가 인메모리 스냅샷을 보관하고, 읽기와 spawn 시마다 활성 프로필을 확인하며, 읽기에 실패하면 마지막 정상 스냅샷을 유지합니다.

## 문제 해결

### 재시작 후 설정이 초기화되는 것처럼 보임

버전 0.1.0은 알려진 원인을 수정했습니다. 이전 로더는 `{ roles: ... }` 객체 전체를 역할 정규화기에 넘겨서 모든 설정이 비어 있었습니다. 0.1.0 이상으로 업데이트하고 DSH를 재시작한 뒤 다음을 확인하십시오:

- `$DSH_HOME/research-team-settings.json`이 존재하고 저장된 프로필을 포함하는지;
- 이전 `{ "roles": ... }` 파일은 단일 `默认配置` 프로필로 표시되며, 다음 저장 시 프로필 형태로 다시 기록되는지;
- `research-team-settings` 행의 이름이 정확히 `dsh-research-team-preset`인지;
- 현재 호스트가 오래된 설치본이 아니라 이 체크아웃을 실행 중인지.

### 모든 팀원은 Lead의 모델로 실행된다

구성원의 첫 메시지 위에 출력되는 spawn 결과를 확인한다. 설정된 또는 명시적 라우트가 적용되면 `requested=<provider>/<model> effort=<effort>`가 표시되고, 어떤 라우트도 맞지 않으면 `requested=inherit (Lead route)`와 `note:` 줄이 표시된다. `note:`가 역할을 지목한다면 해당 역할에 활성 프로필의 provider/model이 없다는 뜻이고, 이름이 표준 역할이 아니라는 안내는 팀원 이름에 역할 단어가 없었다는 뜻이다.

설정 파일과 무관한 원인이 두 가지 더 있다.

- Lead가 modeled 도구 대신 일반 `spawn_teammate`를 호출한 경우. 이는 항상 Lead를 상속한다. persona는 Lead에게 modeled 도구에 `model`을 넘기지 말고 이름이 불확실하다고 폴백하지 말라고 요구한다.

- 설정 행이 실행 중인 호스트가 읽는 것과 다른 `DSH_HOME` 아래 저장된 경우. `research_team_routes`가 출력하는 `settings file:` 줄과 `echo $DSH_HOME`을 비교한다.

### Plugins에 설정 페이지가 나타나지 않음

- 행은 `dsh-research-team-preset/settings`가 아니라 패키지 루트여야 합니다.
- 클라이언트 절반은 설치 후 DSH 재시작과 브라우저 새로 고침이 필요합니다.
- 프로필에서 번들이 활성화되어 있는지 확인하십시오.

### 팀 도구가 없음

### 작업 작업 로그 도구가 없음

작업 로그 항목은 "연구" 사이드바에 `worklog/INDEX.md`에서 표시됩니다

### `spawn_teammate_with_model`을 사용할 수 없음

이 하위 모듈은 내부 하위 에이전트 서비스를 감쌉니다. DSH 업그레이드로 활성화 형태가 바뀔 수 있습니다. 실패 메시지를 확인하고, 래퍼를 설치할 수 없으면 `research-modeled-teammates.enabled: false`로 설정하고 재시작한 뒤 일반 `spawn_teammate`를 사용하십시오.

### 프리셋이 목록에 없음

번들이 설치되고 활성화되었는지 확인하고 DSH를 재시작한 뒤 새 세션을 여십시오. 프리셋 선언은 시작 시 로드됩니다.

### `research_project`가 워크스페이스를 확인하지 못함

GUI에서 작업 디렉터리를 DSH 프로젝트/워크스페이스로 열거나 알려진 프로젝트를 전달하십시오. 이 도구는 추측하지 않습니다.

## 알려진 제한 사항

- 역할별 모델 라우팅은 공식 Agent Teams 확장이 아니라 내부 서비스 래퍼입니다. DSH 업그레이드로 깨질 수 있으며, 대체 방법은 위에 문서화되어 있습니다.
- 프로필 수준 의존성은 자동으로 설치되거나 활성화되지 않습니다. 이 저장소는 이를 문서화할 뿐 관리하지 않습니다.
- 팀 모델 프로필은 `$DSH_HOME` 아래의 독립 JSON 파일에 있으며, DSH의 표준 구성 내보내기/백업에 포함되지 않습니다. 다른 머신으로 옮길 때는 이 파일을 복사하십시오.
- 모델 메뉴는 제공자 그룹이 있는 네이티브 `<select>`이며, 검색 가능한 사용자 정의 선택기가 아닙니다.
- 이 모드는 세션 시작 시 여덟 팀원을 자동으로 생성하지 않습니다. Lead가 작업에 필요한 만큼 역할을 만듭니다.
- 이 모드는 기존 저장소 안에 저장소를 초기화하지 않으며, 워크로그나 저장소 스캐폴드를 자동으로 커밋하지도 않습니다.
- 멤버는 하위 에이전트 계층을 하나 사용할 수 있으며, 더 깊은 위임은 의도적으로 비활성화되어 있습니다.

## 라이선스

MIT. [LICENSE](../LICENSE)를 참고하십시오.

## 감사의 글

작업 로그 항목은 "연구" 사이드바에 `worklog/INDEX.md`에서 표시됩니다

기여와 내부 개발 노트는 [DEVELOPMENT.md](../DEVELOPMENT.md)에 있습니다.
