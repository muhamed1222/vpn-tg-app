import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { logger } from '../utils/logger';

export const Home: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    logger.debug('[Home] Кнопка нажата');
    setLoading(true);
    setError(null);
    
    try {
      logger.debug('[Home] Вызов функции login...');
      await login();
      logger.debug('[Home] Login завершен, выполняется редирект...');
      // Небольшая задержка перед редиректом для обновления состояния
      await new Promise(resolve => setTimeout(resolve, 100));
      // Редирект сразу после успешной авторизации
      navigate('/account');
    } catch (err) {
      console.error('[Home] Ошибка при авторизации:', err);
      const message = err instanceof Error ? err.message : 'Не удалось войти. Попробуйте еще раз.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Background World Map Pattern (Simplified) */}
      <div className="absolute bottom-0 w-full h-[300px] opacity-[0.08] pointer-events-none z-0">
         <svg viewBox="0 0 1000 300" className="w-full h-full">
            <path d="M0,150 Q250,50 500,150 T1000,150" fill="none" stroke="currentColor" strokeWidth="1" />
         </svg>
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-8 animate-fade z-10 relative">
        <Logo className="w-10 h-10 text-fg-4" />
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-fg-4">Вход в Outlivion</h1>
          <p className="text-[14px] text-fg-2 font-medium">Простой и красивый VPN-дашборд.</p>
        </div>

        <div className="w-full space-y-3 relative z-10">
          {error && (
            <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-lg">
              <p className="text-xs text-[var(--danger-text)] text-center">{error}</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              logger.debug('[Home] onClick вызван', e);
              e.preventDefault();
              e.stopPropagation();
              handleLogin(e).catch((err) => {
                console.error('[Home] Необработанная ошибка в handleLogin:', err);
              });
            }}
            onMouseDown={() => {
              logger.debug('[Home] onMouseDown вызван');
            }}
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold text-[14px] transition-all hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer relative z-10"
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Вход...</span>
              </>
            ) : (
              'Продолжить с Telegram'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
