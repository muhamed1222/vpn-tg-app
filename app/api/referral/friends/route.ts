import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram-validation';
import { serverConfig } from '@/lib/config';
import { logError } from '@/lib/utils/logging';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.outlivion.space';

/**
 * API Route для получения списка друзей в конкурсе
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

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contest_id');
    const limit = searchParams.get('limit') || '50';

    if (!contestId) {
      return NextResponse.json(
        { error: 'Missing contest_id parameter' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/v1/referral/friends?contest_id=${contestId}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': initData,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { ok: false, friends: [], error: errorData.error || 'Failed to fetch friends' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({
      ok: true,
      friends: data.friends || [],
    });
  } catch (error) {
    logError('Referral friends API error', error, {
      page: 'api',
      action: 'getReferralFriends',
      endpoint: '/api/referral/friends'
    });
    return NextResponse.json(
      { ok: false, friends: [], error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}