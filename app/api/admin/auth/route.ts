import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

/**
 * POST /api/admin/auth
 * Авторизация админа по паролю
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Пароль не указан' },
        { status: 400 }
      );
    }

    // Проверяем пароль
    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      // Создаем простую сессию (можно улучшить с JWT)
      const sessionToken = Buffer.from(`admin_${Date.now()}_${Math.random()}`).toString('base64');
      
      // Устанавливаем cookie с сессией (httpOnly для безопасности)
      const response = NextResponse.json({ success: true });
      
      // Сохраняем сессию в cookie
      // В production на Vercel всегда используем secure: true (HTTPS)
      const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: isProduction, // true для production (HTTPS), false для localhost
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 часа
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Неверный пароль' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth
 * Проверка существующей сессии
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session || !session.value) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    // Проверяем формат сессии (должна начинаться с "admin_")
    const sessionValue = session.value;
    try {
      const decoded = Buffer.from(sessionValue, 'base64').toString('utf-8');
      
      // Проверяем, что сессия имеет правильный формат: "admin_TIMESTAMP_RANDOM"
      if (!decoded.startsWith('admin_')) {
        return NextResponse.json({ success: false, authenticated: false });
      }

      // Извлекаем timestamp из сессии
      const parts = decoded.split('_');
      if (parts.length < 2) {
        return NextResponse.json({ success: false, authenticated: false });
      }

      const timestamp = parseInt(parts[1], 10);
      if (isNaN(timestamp)) {
        return NextResponse.json({ success: false, authenticated: false });
      }

      // Проверяем, что сессия не старше 24 часов (86400000 мс)
      const now = Date.now();
      const maxAge = 60 * 60 * 24 * 1000; // 24 часа
      if (now - timestamp > maxAge) {
        return NextResponse.json({ success: false, authenticated: false });
      }

      // Сессия валидна
      return NextResponse.json({ success: true, authenticated: true });
    } catch (decodeError) {
      // Если не удалось декодировать - сессия невалидна
      return NextResponse.json({ success: false, authenticated: false });
    }
  } catch (error) {
    return NextResponse.json({ success: false, authenticated: false });
  }
}
