# 랜딩페이지 개선 프로젝트

이 프롬프트는 랜딩페이지의 내용 구성 및 UI 디자인을 개선하기 위한 전체 워크플로우를 실행합니다.

## 실행 방법

아래 프롬프트를 Claude Code에 입력하세요:

---

다음 순서대로 작업을 진행해주세요:

## Step 1: 분석 및 개선안 작성
`0-landing-explore` agent를 실행하여 현재 랜딩페이지를 분석하고 개선안을 작성합니다.

## Step 2: 계획 검토
`1-landing-plan-critic` agent를 실행하여 Step 1의 결과를 엄격하게 검토하고 개선합니다.

## Step 3: 구현 계획 수립
`2-landing-implement-plan` agent를 실행하여 구체적인 구현 계획을 작성합니다.

## Step 4: 구현 계획 최종 검토
`3-landing-plan-final` agent를 실행하여 구현 계획을 최종 검토하고 오류를 수정합니다.

## Step 5: 구현
Step 4에서 작성된 최종 보고서(`./agent-outputs/landing-improve/3-implement-plan-final.md`)를 정확히 구현합니다.

## Step 6: 품질 검증 (병렬 실행)
다음 4개의 agent를 **병렬로** 실행합니다:
- `4-check-ui`: UI 품질 검증
- `4-check-build`: 빌드 오류 검증
- `4-check-cleancode`: 클린코드 검증
- `4-check-i18n`: i18n 검증

각 agent는 문제가 있을 때만 `./agent-outputs/landing-improve/4-check-{name}.md` 파일을 생성합니다.

## Step 7: 개선
Step 6에서 생성된 모든 피드백 파일들을 참고하여 코드를 개선합니다.

## Step 8: 최종 검증 (병렬 실행)
다시 4개의 검증 agent를 **병렬로** 실행합니다:
- `4-check-ui`
- `4-check-build`
- `4-check-cleancode`
- `4-check-i18n`

각 agent는 문제가 있을 때만 `./agent-outputs/landing-improve/5-check-{name}.md` 파일을 생성합니다.

## 성공 기준
- [ ] claude.ai 수준의 전문적인 랜딩페이지
- [ ] 모든 빌드/타입 오류 해결
- [ ] 클린코드 원칙 준수
- [ ] 완전한 i18n 지원
- [ ] 부드러운 애니메이션
- [ ] 접근성 준수

---

## 간편 실행 프롬프트

```
랜딩페이지를 개선해주세요. 다음 순서로 진행합니다:

1. 0-landing-explore agent 실행
2. 1-landing-plan-critic agent 실행
3. 2-landing-implement-plan agent 실행
4. 3-landing-plan-final agent 실행
5. 최종 계획 구현
6. 4-check-ui, 4-check-build, 4-check-cleancode, 4-check-i18n agent를 병렬 실행
7. 피드백 반영하여 코드 개선
8. 다시 4개 검증 agent를 병렬 실행

각 단계가 완료되면 다음 단계로 진행하고, 최종적으로 claude.ai 수준의 전문적인 랜딩페이지를 완성합니다.
```

## Agent 목록

### 분석 및 계획 단계
- **0-landing-explore**: 현재 랜딩페이지 분석 및 개선안 작성
- **1-landing-plan-critic**: 개선안 검토 및 개선
- **2-landing-implement-plan**: 구체적인 구현 계획 수립
- **3-landing-plan-final**: 구현 계획 최종 검토

### 검증 단계
- **4-check-ui**: UI 품질 검증
- **4-check-build**: 빌드 오류 검증
- **4-check-cleancode**: 클린코드 검증
- **4-check-i18n**: i18n 검증

## 출력 파일

### 계획 단계 출력
- `./agent-outputs/landing-improve/0-explore.md`: 분석 및 개선안
- `./agent-outputs/landing-improve/1-plan-critic.md`: 검토된 개선안
- `./agent-outputs/landing-improve/2-implement-plan.md`: 구현 계획
- `./agent-outputs/landing-improve/3-implement-plan-final.md`: 최종 구현 계획

### 1차 검증 출력 (문제 있을 때만)
- `./agent-outputs/landing-improve/4-check-ui.md`
- `./agent-outputs/landing-improve/4-check-build.md`
- `./agent-outputs/landing-improve/4-check-cleancode.md`
- `./agent-outputs/landing-improve/4-check-i18n.md`

### 2차 검증 출력 (문제 있을 때만)
- `./agent-outputs/landing-improve/5-check-ui.md`
- `./agent-outputs/landing-improve/5-check-build.md`
- `./agent-outputs/landing-improve/5-check-cleancode.md`
- `./agent-outputs/landing-improve/5-check-i18n.md`

## 주의사항

1. **병렬 실행**: Step 6과 Step 8에서는 반드시 4개의 agent를 병렬로 실행해야 합니다.
2. **조건부 파일 생성**: 검증 agent들은 문제가 있을 때만 파일을 생성합니다.
3. **순차 실행**: Step 1~5는 반드시 순서대로 실행해야 합니다.
4. **최종 검증**: 모든 검증이 통과할 때까지 Step 7-8을 반복할 수 있습니다.

## 예상 소요 시간

- Step 1-4 (계획): 각 5-10분 = 20-40분
- Step 5 (구현): 30-60분
- Step 6 (1차 검증): 10-20분 (병렬)
- Step 7 (개선): 20-40분
- Step 8 (2차 검증): 10-20분 (병렬)

**총 예상 시간**: 1.5 - 3시간
