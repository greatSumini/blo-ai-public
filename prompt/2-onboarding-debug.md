http://localhost:3000/dashboard 페이지에 접속하면, 자동으로 /auth/onboarding 페이지로 이동하고 있다. 

참고로 온보딩은 이미 마쳤으며 supabase에 style_guides 데이터도 해당 유저에 대해 존재하는 상태이다.

온보딩을 마친 경우 대시보드에 접속할 수 있어야하며,
/auth/onboarding 페이지에 접속하더라도 자동으로 /dashboard 페이지로 리다이렉트 되어야 한다.

어떤 코드로 인해 문제가 발생하는지 디버깅하고,
해당 문제를 해결하는 최소한의 코드 수정작업을 진행하라.

---

실행 시 다음과 같은 에러가 발생한다. 수정하라.

```
⨯ Error: Clerk: auth() was called but Clerk can't
detect usage of clerkMiddleware(). Please ensure
the following:
- Your Middleware exists at
./src/middleware.(ts|js)
- clerkMiddleware() is used in your Next.js
Middleware.
- Your Middleware matcher is configured to match
this route or page.
- If you are using the src directory, make sure the
Middleware file is inside of it.
``` 

---

/auth/onboarding 페이지에서 '최종 검토' 단계에 진입하면,
바로 버튼이 '처리중 ...' 상태로 변경되며 잠깐 뒤 화면이 새로고침되는 버그가 있다.

이러한 자동 제출 버그가 발생할 수 있는 경우의 수를 생각해보고, 현재 코드베이스에 어떤 문제가 있는지 정확히 파악해서 수정하라.

---

여전히 자동 제출되고 있습니다.
  다시 한번 확인해주세요.

  또, 자동 제출되더라도 페이지가
  새로고침되는 것은 이상합니다.
  기능 플로우적으로도 버그가
  있는 것 같은데, 관련 코드들을
  전부 탐색해서 버그가 없는지
  하나하나 확인해주세요. 

  ---

  이제 자동제출은 해결된 것 같습니다.
  그런데 대시보드 페이지로 이동하지 않고, /dashboard로 직접 접속해도 /auth/onboarding으로 리다이렉트 되는 문제가 있습니다.
  이 문제도 해결해주세요.

---

여전히 대시보드 페이지로 이동하지 못하고있다.
디버깅을 위한 자세한 로그들을 추가하라. 
재현한 뒤 해당 로그들을 첨부하여 ai에게 다시 디버깅해달라고 요청할 것이다. 