import { NextRequest, NextResponse } from 'next/server';
import { proxyGet } from '@/lib/utils/api-proxy';
import { validateApiRequest } from '@/lib/utils/api-validation';

/**
 * API Route для получения сводки по конкурсу и реферальной программе
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

  if (!contestId) {
    return NextResponse.json(
      { error: 'Missing contest_id parameter' },
      { status: 400 }
    );
  }

  // Проксируем запрос на бэкенд API с query параметрами
  const response = await proxyGet(request, '/v1/referral/summary', {
    requireAuth: true,
    queryParams: { contest_id: contestId },
    logContext: {
      page: 'api',
      action: 'getReferralSummary',
      endpoint: '/api/referral/summary',
    },
  });

  // Если ошибка, возвращаем стандартный формат
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, summary: null, error: data.error || 'Не удалось загрузить данные. Попробуйте позже.' },
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
      summary: data.summary || null,
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