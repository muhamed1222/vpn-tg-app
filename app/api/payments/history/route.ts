import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/utils/api-proxy';
import { validateApiRequest } from '@/lib/utils/api-validation';

// Отключаем кеширование на уровне Next.js и Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route для получения истории платежей
 * 
 * Проксирует GET запрос на бэкенд API /v1/payments/history
 */
export async function GET(request: NextRequest) {
  // Валидируем запрос
  const validationError = validateApiRequest(request, true);
  if (validationError) {
    return validationError;
  }

  // Проксируем запрос на бэкенд API
  const response = await proxyGet(request, '/v1/payments/history', {
    requireAuth: true,
    logContext: {
      page: 'api',
      action: 'getPaymentsHistory',
      endpoint: '/api/payments/history',
    },
  });

  // Добавляем запрет кеширования
  if (response.ok) {
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }

  return response;
}

