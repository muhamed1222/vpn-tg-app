'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Промежуточная страница для редиректа на deep link iOS приложения
 * Telegram не может открывать custom URL schemes напрямую, поэтому используем HTTPS страницу
 */
export default function IOSAuthRedirectPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      return;
    }

    // Формируем deep link
    const deepLink = `outlivion://auth?token=${encodeURIComponent(token)}`;
    
    console.log('[iOS Auth Redirect] Redirecting to deep link:', deepLink.substring(0, 100) + '...');
    
    // Пытаемся открыть deep link
    // В Safari это откроет приложение, если оно установлено
    window.location.href = deepLink;
    
    // Fallback: если не сработало, показываем инструкции
    setTimeout(() => {
      // Если через 1 секунду мы все еще на странице, значит редирект не сработал
      // (Но на самом деле мы уже ушли, так что этот код не выполнится)
    }, 1000);
  }, [token]);

  if (!token) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: '#181818',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px', color: '#ff4444' }}>Ошибка</div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>Токен авторизации не найден</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: '#181818',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '18px', marginBottom: '20px' }}>Перенаправление...</div>
      <div style={{ fontSize: '14px', opacity: 0.7 }}>Открытие приложения Outlivion</div>
    </div>
  );
}
