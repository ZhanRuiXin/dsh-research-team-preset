# Research Team Mode — 한국어

**버전:** 1.0.0 · **업데이트:** 2026-10-31

**언어:** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · **한국어** · [Deutsch](README.de.md) · [Français](README.fr.md) · [Español](README.es.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md)

## 개요

Research Team Mode는 하나의 세션을 작고 협력적인 연구 팀으로 바꾸는 DSH 에이전트 프리셋입니다. Lead가 목표 정리, 작업 분해, 작업 보드 관리, 배정, 결과 통합, 사용자와의 소통을 맡고, 여섯 명의 기본 멤버가 자문 평가, 문헌과 증거, 코드, 실행, 독립 검토, 논문 작성을 담당합니다.

며칠에서 몇 주에 걸친 연구, 추적 가능한 증거와 명확한 역할 경계가 필요한 작업에 적합합니다. 일회성 질문이나 작은 수정에는 적합하지 않습니다.

## 대상

- 문헌 검토, 구현, 실험, 논문 작성을 함께 수행하는 연구 프로젝트.
- 주장을 논문, 로그, 실행 기록까지 추적하려는 팀.
- 범용 에이전트 하나 대신 자문과 독립 검토자를 두고 싶은 사용자.
- 최종 수락 결정을 에이전트가 아니라 사용자가 내려야 하는 작업.

## 주요 기능

- **여섯 명의 기본 멤버**: advisor(학술 자문), researcher(자료 담당), builder(코드 구축), runner(훈련과 실행), reviewer(검토), writer(논문 작성).
- **작업 보드 우선**: Lead가 카드를 만들고, 멤버가 카드를 가져가 실행하고 실행 보고서를 제출하며, reviewer가 독립적으로 확인합니다.
- **역할별 모델**: 플러그인 설정 페이지에서 멤버별 provider, model, 추론 강도를 선택할 수 있습니다.
- **완료는 사용자만**: 에이전트는 카드를 `in_review`까지 옮길 수 있지만, `done`은 GUI에서 사용자만 확정할 수 있습니다.
- **PTC 런타임**: `run_code`와 생성된 SDK로 일괄 작업을 처리해 왕복을 줄입니다.
- **추적 가능성**: 증거, 실행 기록, 결정은 작업 카드 댓글에 남깁니다.

## 빠른 시작

1. 같은 DSH profile에서 Agent Teams(`@deepseek-ai/dsh-experimental-agent-team-profile`)와 `dsh-taskboard`를 활성화합니다.
2. 이 bundle을 로컬 경로 또는 `link:`로 설치하고 DSH를 재시작합니다.
3. 새 세션을 열고 "Research Team Mode"를 선택합니다. 작업 카드에는 `presetId=research-team`을 설정합니다.
4. "Plugins → @local/dsh-research-team-preset → research-team-settings → Configure"에서 기본 모델을 설정합니다.

설치, 설정, 작업 보드, 알려진 문제의 자세한 내용은 [English README](../README.md)를 참고하세요. 이 페이지는 AI 지원 번역이며 수정을 환영합니다.
