import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram-validation';
import { serverConfig } from '@/lib/config';
import { logError } from '@/lib/utils/logging';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.outlivion.space';

/**
 * API Route для получения сводки по конкурсу и реферальной программе
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

    if (!contestId) {
      return NextResponse.json(
        { error: 'Missing contest_id parameter' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_API_URL}/v1/referral/summary?contest_id=${contestId}`,
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
        { ok: false, summary: null, error: errorData.error || 'Failed to fetch summary' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({
      ok: true,
      summary: data.summary,
    });
  } catch (error) {
    logError('Referral summary API error', error, {
      page: 'api',
      action: 'getReferralSummary',
      endpoint: '/api/referral/summary'
    });
    return NextResponse.json(
      { ok: false, summary: null, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}