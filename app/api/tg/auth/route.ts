import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram-validation';
import { serverConfig } from '@/lib/config';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vpn.outlivion.space';

/**
 * API Route для авторизации через Telegram WebApp
 * 
 * Проксирует запрос на бэкенд API для получения данных пользователя и подписки
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем initData из заголовков
    const initData = request.headers.get('X-Telegram-Init-Data') || 
                     request.headers.get('Authorization');

    if (!initData) {
      return NextResponse.json(
        { error: 'Missing Telegram initData' },
        { status: 401 }
      );
    }

    // Валидируем подпись initData на стороне Next.js для безопасности
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

    // Проксируем запрос на бэкенд API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/me`, {
      method: 'GET',
      headers: {
        'Authorization': initData,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Backend API error' },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    // Преобразуем формат ответа для совместимости с фронтендом
    const isActive = backendData.subscription?.is_active && 
                     backendData.subscription?.expires_at && 
                     backendData.subscription.expires_at > Date.now();
    
    const isExpired = backendData.subscription?.expires_at && 
                      backendData.subscription.expires_at <= Date.now();

    return NextResponse.json({
      user: {
        id: backendData.id,
        firstName: backendData.firstName,
        username: undefined,
      },
      subscription: {
        status: isActive ? 'active' as const : isExpired ? 'expired' as const : 'none' as const,
        expiresAt: backendData.subscription?.expires_at 
          ? new Date(backendData.subscription.expires_at).toISOString().split('T')[0]
          : undefined,
      },
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

