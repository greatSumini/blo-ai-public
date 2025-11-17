import { type NextRequest } from 'next/server';

// 단순 타입 해결용 채팅 라우트 스텁입니다.
// 현재 글 작성 기능은 /api/articles/generate 경로를 사용합니다.

export async function POST(_req: NextRequest): Promise<Response> {
  return new Response(
    JSON.stringify({
      error: {
        message: 'This chat endpoint is not implemented. Use /api/articles/generate instead.',
      },
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

