import { NextRequest, NextResponse } from 'next/server';
import { proxyGet } from '@/lib/utils/api-proxy';
import { validateApiRequest } from '@/lib/utils/api-validation';

// Отключаем кеширование на уровне Next.js и Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route для получения списка друзей в конкурсе
 */
export async function GET(request: NextRequest) {
  // Валидируем запрос
  const validationError = validateApiRequest(request, true);
  if (validationError) {
    return validationError;
  }

  // Получаем query параметры
  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get('contest_id');
  const limit = searchParams.get('limit') || '50';

  if (!contestId) {
    return NextResponse.json(
      { error: 'Missing contest_id parameter' },
      { status: 400 }
    );
  }

  // Проксируем запрос на бэкенд API с query параметрами
  const response = await proxyGet(request, '/v1/referral/friends', {
    requireAuth: true,
    queryParams: { contest_id: contestId, limit },
    logContext: {
      page: 'api',
      action: 'getReferralFriends',
      endpoint: '/api/referral/friends',
    },
  });

  // Если ошибка, возвращаем стандартный формат
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, friends: [], error: data.error || 'Не удалось загрузить список друзей. Попробуйте позже.' },
      { 
        status: response.status,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }

  // Парсим успешный ответ и нормализуем формат
  const data = await response.json().catch(() => ({}));
  return new NextResponse(
    JSON.stringify({
      ok: true,
      friends: data.friends || [],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}