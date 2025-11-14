import type { Hono } from 'hono';
import { respondWithDomain } from '@/backend/http/mapper';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { ExampleParamsSchema } from '@/features/example/backend/schema';
import { getExampleById } from './service';
import { exampleErrorCodes } from './error';

export const registerExampleRoutes = (app: Hono<AppEnv>) => {
  app.get('/example/:id', async (c) => {
    // 1. 요청 파싱 & 검증 (Presentation Layer 책임)
    const parsedParams = ExampleParamsSchema.safeParse({ id: c.req.param('id') });

    if (!parsedParams.success) {
      return c.json(
        {
          error: {
            code: 'INVALID_EXAMPLE_PARAMS',
            message: 'The provided example id is invalid.',
            details: parsedParams.error.format(),
          },
        },
        400,
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // 2. 비즈니스 로직 실행 (도메인 결과만 받음)
    const result = await getExampleById(supabase, parsedParams.data.id);

    // 3. 도메인 에러에 따른 로깅
    if (!result.ok) {
      const errorResult = result as { ok: false; error: { code: string; message: string } };
      if (errorResult.error.code === exampleErrorCodes.fetchError) {
        logger.error('Failed to fetch example', errorResult.error.message);
      }
    }

    // 4. 도메인 결과 → HTTP 응답 변환 (Presentation Layer 책임)
    //    ✅ HTTP 상태 코드 결정은 여기서만 발생
    return respondWithDomain(c, result);
  });
};
