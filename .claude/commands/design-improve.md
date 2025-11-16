다음 순서대로 작업을 진행해주세요.
주어진 페이지가 여러개인 경우, 순차적으로 각 페이지에 대해 아래 절차를 반복 수행합니다.:

## 개요

- 작업할 페이지: $1
- 보고서 경로: `./agent-outputs/$2/`

## Step 1: 분석 및 개선안 작성

`0-explore` agent를 실행하여 $1 페이지를 분석하고 개선안을 작성합니다.

## Step 2: 계획 검토

`1-plan-critic` agent를 실행하여 Step 1의 결과를 엄격하게 검토하고 개선합니다.

## Step 3: 구현 계획 수립

`2-implement-plan` agent를 실행하여 구체적인 구현 계획을 작성합니다.

## Step 4: 구현 계획 최종 검토

`3-plan-final` agent를 실행하여 구현 계획을 최종 검토하고 오류를 수정합니다.

## Step 5: 구현

Step 4에서 작성된 최종 보고서(`./agent-outputs/$2/3-implement-plan-final.md`)를 정확히 구현합니다.

## Step 6: 품질 검증 (병렬 실행)

다음 4개의 agent를 **병렬로** 실행합니다:

- `4-check-ui`: UI 품질 검증
- `4-check-build`: 빌드 오류 검증
- `4-check-cleancode`: 클린코드 검증
- `4-check-i18n`: i18n 검증

각 agent는 문제가 있을 때만 `./agent-outputs/$2/4-check-{name}.md` 파일을 생성합니다.

## Step 7: 개선

Step 6에서 생성된 모든 피드백 파일들을 참고하여 코드를 개선합니다.

## Step 8: 최종 검증 (병렬 실행)

다시 4개의 검증 agent를 **병렬로** 실행합니다:

- `4-check-ui`
- `4-check-build`
- `4-check-cleancode`
- `4-check-i18n`

각 agent는 문제가 있을 때만 `./agent-outputs/$2/5-check-{name}.md` 파일을 생성합니다.

## Step 9: commit

변경된 코드를 적절한 메세지로 commit 합니다.

## 성공 기준

- [ ] 전문적인 수준의 UI/UX 디자인
- [ ] 모든 빌드/타입 오류 해결
- [ ] 클린코드 원칙 준수
- [ ] 완전한 i18n 지원
- [ ] 부드러운 애니메이션
- [ ] 접근성 준수

## Agent 목록

### 분석 및 계획 단계

- **0-explore**: 현재 $1 페이지 분석 및 개선안 작성
- **1-plan-critic**: 개선안 검토 및 개선
- **2-implement-plan**: 구체적인 구현 계획 수립
- **3-plan-final**: 구현 계획 최종 검토

### 검증 단계

- **4-check-ui**: UI 품질 검증
- **4-check-build**: 빌드 오류 검증
- **4-check-cleancode**: 클린코드 검증
- **4-check-i18n**: i18n 검증

## 출력 파일

### 계획 단계 출력

- `./agent-outputs/$2/0-explore.md`: 분석 및 개선안
- `./agent-outputs/$2/1-plan-critic.md`: 검토된 개선안
- `./agent-outputs/$2/2-implement-plan.md`: 구현 계획
- `./agent-outputs/$2/3-implement-plan-final.md`: 최종 구현 계획

### 1차 검증 출력 (문제 있을 때만)

- `./agent-outputs/$2/4-check-ui.md`
- `./agent-outputs/$2/4-check-build.md`
- `./agent-outputs/$2/4-check-cleancode.md`
- `./agent-outputs/$2/4-check-i18n.md`

### 2차 검증 출력 (문제 있을 때만)

- `./agent-outputs/$2/5-check-ui.md`
- `./agent-outputs/$2/5-check-build.md`
- `./agent-outputs/$2/5-check-cleancode.md`
- `./agent-outputs/$2/5-check-i18n.md`

## 주의사항

1. **병렬 실행**: Step 6과 Step 8에서는 반드시 4개의 agent를 병렬로 실행해야 합니다.
2. **조건부 파일 생성**: 검증 agent들은 문제가 있을 때만 파일을 생성합니다.
3. **순차 실행**: Step 1~5는 반드시 순서대로 실행해야 합니다.
4. **최종 검증**: 모든 검증이 통과할 때까지 Step 7-8을 반복할 수 있습니다.
