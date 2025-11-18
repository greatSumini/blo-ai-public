# 구독 기능 설정 가이드

본 문서는 토스페이먼츠 구독 결제 기능을 활성화하기 위한 설정 가이드입니다.

## 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# TossPayments API Keys
TOSS_SECRET_KEY=test_sk_... # 테스트 환경: test_sk_로 시작, 프로덕션: live_sk_로 시작
TOSS_CLIENT_KEY=test_ck_... # 테스트 환경: test_ck_로 시작, 프로덕션: live_ck_로 시작

# Cron Secret Token (안전한 랜덤 문자열 생성)
CRON_SECRET_TOKEN=your-secure-random-token-here
```

### 토스페이먼츠 API 키 발급 방법

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 로그인
3. 대시보드 > API 키 메뉴에서 발급
   - **테스트 키**: 개발/테스트 환경용
   - **라이브 키**: 프로덕션 배포용

### CRON_SECRET_TOKEN 생성

다음 명령어로 안전한 랜덤 토큰을 생성하세요:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Supabase 마이그레이션 실행

### 2.1 마이그레이션 적용

프로젝트의 모든 마이그레이션을 Supabase에 적용합니다:

```bash
# Supabase CLI를 통한 마이그레이션 (로컬 개발 시)
supabase db push

# 또는 Supabase 대시보드에서 SQL Editor를 통해 직접 실행
# 1. Supabase 대시보드 > SQL Editor
# 2. supabase/migrations/0013_create_subscription_tables.sql 내용 복사 & 실행
# 3. supabase/migrations/0014_setup_billing_cron.sql 내용 복사 & 실행
```

### 2.2 필수 Supabase Extensions 활성화

Supabase 대시보드에서 다음 확장 기능을 활성화하세요:

1. **pg_net 확장 (HTTP 요청용)**
   - Database > Extensions 메뉴
   - "pg_net" 검색 후 Enable 클릭

2. **pg_cron 확장 (스케줄링용)**
   - Database > Extensions 메�무
   - "pg_cron" 검색 후 Enable 클릭

## 3. Supabase Vault 설정

Supabase Vault에 API 엔드포인트 정보를 저장합니다:

### 3.1 Vault Secrets 추가

Supabase 대시보드 > Settings > Vault에서 다음 시크릿을 추가하세요:

```sql
-- 1) API Base URL 설정
INSERT INTO vault.secrets (name, secret)
VALUES (
  'app.settings.api_base_url',
  'https://your-production-domain.com'  -- 프로덕션 도메인으로 변경
);

-- 2) Cron Secret Token 설정
INSERT INTO vault.secrets (name, secret)
VALUES (
  'app.settings.cron_secret',
  'your-secure-random-token-here'  -- .env.local의 CRON_SECRET_TOKEN과 동일한 값
);
```

또는 Supabase 대시보드 UI를 통해:

1. Settings > Vault 메뉴
2. "New Secret" 버튼 클릭
3. 각각의 시크릿 추가:
   - Name: `app.settings.api_base_url`, Value: `https://your-domain.com`
   - Name: `app.settings.cron_secret`, Value: `your-cron-secret-token`

## 4. Cron Job 검증

### 4.1 Cron Job 등록 확인

다음 SQL을 실행하여 cron job이 정상적으로 등록되었는지 확인하세요:

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-subscription-billing';
```

예상 결과:
```
jobid | schedule    | command                               | nodename  | ...
------|-------------|---------------------------------------|-----------|----
1     | 0 17 * * *  | SELECT trigger_billing_cron()         | localhost | ...
```

### 4.2 수동 테스트 실행

Cron 함수를 수동으로 실행하여 정상 작동을 확인하세요:

```sql
-- 수동 실행
SELECT trigger_billing_cron();

-- 로그 확인
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-subscription-billing')
ORDER BY start_time DESC
LIMIT 10;
```

### 4.3 Next.js API 로그 확인

로컬 개발 서버를 실행한 상태에서 수동 테스트를 실행하면, Next.js 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:

```
[Cron] Processing billing for 5 organizations...
[Cron] Successfully processed 3 payments
[Cron] Failed 0 payments
[Cron] Skipped 2 organizations (no billing key)
```

## 5. 프로덕션 배포 체크리스트

프로덕션 환경에 배포하기 전 다음 사항을 확인하세요:

### 5.1 환경 변수
- [ ] `TOSS_SECRET_KEY`: **live_sk_**로 시작하는 프로덕션 키 사용
- [ ] `TOSS_CLIENT_KEY`: **live_ck_**로 시작하는 프로덕션 키 사용
- [ ] `CRON_SECRET_TOKEN`: 안전한 랜덤 토큰 생성 및 설정

### 5.2 Supabase 설정
- [ ] 모든 마이그레이션 파일 실행 완료
- [ ] `pg_net` 확장 활성화
- [ ] `pg_cron` 확장 활성화
- [ ] Vault에 프로덕션 API Base URL 설정
- [ ] Vault에 Cron Secret Token 설정
- [ ] Cron Job 등록 확인 (`cron.job` 테이블 조회)

### 5.3 토스페이먼츠 설정
- [ ] 토스페이먼츠 대시보드에서 Webhook URL 설정
  - URL: `https://your-domain.com/api/webhooks/toss`
  - Event: `BILLING_DELETED` (결제수단 삭제 시 알림)
- [ ] 토스페이먼츠 정책 확인
  - 빌링키 유효기간
  - 결제 실패 시 재시도 정책

### 5.4 테스트
- [ ] 로컬에서 구독 업그레이드 플로우 테스트
- [ ] 로컬에서 구독 취소 플로우 테스트
- [ ] 로컬에서 Cron 수동 실행 테스트
- [ ] Vercel/배포 환경에서 전체 플로우 테스트

## 6. 문제 해결 (Troubleshooting)

### Cron이 실행되지 않을 때

1. **Extensions 확인**
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
   ```

2. **Cron Job 재등록**
   ```sql
   -- 기존 Job 삭제
   SELECT cron.unschedule('daily-subscription-billing');

   -- 재등록
   SELECT cron.schedule(
     'daily-subscription-billing',
     '0 17 * * *',
     $$SELECT trigger_billing_cron()$$
   );
   ```

3. **Vault Secrets 확인**
   ```sql
   SELECT name FROM vault.secrets
   WHERE name LIKE 'app.settings.%';
   ```

### 결제 실패 시

1. **토스페이먼츠 대시보드 확인**
   - 결제 > 거래 내역에서 상세 오류 메시지 확인

2. **Next.js 로그 확인**
   - Vercel Logs 또는 서버 콘솔에서 에러 메시지 확인

3. **Supabase 로그 확인**
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE status = 'failed'
   ORDER BY start_time DESC
   LIMIT 10;
   ```

## 7. 주요 파일 위치

구독 기능과 관련된 주요 파일들의 위치입니다:

### 데이터베이스
- `supabase/migrations/0013_create_subscription_tables.sql` - 구독 테이블 생성
- `supabase/migrations/0014_setup_billing_cron.sql` - Cron 설정

### 백엔드 (API)
- `src/features/subscription/backend/route.ts` - 구독 API 라우터
- `src/features/subscription/backend/service.ts` - 비즈니스 로직
- `src/features/subscription/backend/toss-client.ts` - 토스페이먼츠 클라이언트
- `src/app/api/cron/billing/route.ts` - Cron 엔드포인트
- `src/app/api/webhooks/toss/route.ts` - Webhook 핸들러

### 프론트엔드
- `src/features/subscription/hooks/use-subscription.ts` - React Query 훅
- `src/features/subscription/components/` - UI 컴포넌트
- `src/app/[locale]/(protected)/org/[orgId]/subscription/page.tsx` - 구독 관리 페이지

## 8. 참고 자료

- [토스페이먼츠 개발 가이드](https://docs.tosspayments.com/)
- [토스페이먼츠 빌링키 API](https://docs.tosspayments.com/reference/billing-key)
- [Supabase Extensions](https://supabase.com/docs/guides/database/extensions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [pg_net Documentation](https://github.com/supabase/pg_net)

---

**문의사항이나 이슈가 있다면 개발팀에 문의해주세요.**
