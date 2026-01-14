import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram-validation';
import { serverConfig } from '@/lib/config';
import { logError } from '@/lib/utils/logging';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.outlivion.space';

/**
 * API Route для получения активного конкурса
 */
export async function GET(request: NextRequest) {
  try {
    const initData = request.headers.get('X-Telegram-Init-Data') || 
                     request.headers.get('Authorization');

    if (!initData) {
      return NextResponse.json(
        { error: 'Missing Telegram initData' },
        { status: 401 }
      );
    }

    if (serverConfig.telegram.botToken) {
      const isValid = validateTelegramInitData(
        initData,
        serverConfig.telegram.botToken
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid Telegram initData signature' },
          { status: 401 }
        );
      }
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/contest/active`, {
      method: 'GET',
      headers: {
        'Authorization': initData,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Кешируем на 1 минуту
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      // Не логируем ожидаемые ошибки (404, 401, 400)
      const isExpectedError = backendResponse.status === 404 || 
                              backendResponse.status === 401 || 
                              backendResponse.status === 400;
      
      if (!isExpectedError) {
        logError('Active contest API error', new Error(`Backend returned ${backendResponse.status}`), {
          page: 'api',
          action: 'getActiveContest',
          endpoint: '/api/contest/active',
          status: backendResponse.status
        });
      }
      
      return NextResponse.json(
        { ok: false, contest: null, error: errorData.error || 'Failed to fetch active contest' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({
      ok: true,
      contest: data.contest || null,
    });
  } catch (error) {
    // Логируем только неожиданные ошибки (не связанные с отсутствием эндпоинтов)
    const isExpectedError = error instanceof Error && (
      error.message.includes('404') ||
      error.message.includes('401') ||
      error.message.includes('fetch failed')
    );
    
    if (!isExpectedError) {
      logError('Active contest API error', error, {
        page: 'api',
        action: 'getActiveContest',
        endpoint: '/api/contest/active'
      });
    }
    
    return NextResponse.json(
      { ok: false, contest: null, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}