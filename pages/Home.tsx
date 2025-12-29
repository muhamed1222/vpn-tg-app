import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Logo } from '../components/Logo';

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
    
    console.log('[Home] Кнопка нажата');
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Home] Вызов функции login...');
      await login();
      console.log('[Home] Login завершен, выполняется редирект...');
      // Небольшая задержка перед редиректом для обновления состояния
      await new Promise(resolve => setTimeout(resolve, 100));
      // Редирект сразу после успешной авторизации
      navigate('/account');
    } catch (err: any) {
      console.error('[Home] Ошибка при авторизации:', err);
      setError(err.message || 'Не удалось войти. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      {/* Background World Map Pattern (Simplified) */}
      <div className="absolute bottom-0 w-full h-[300px] opacity-[0.05] pointer-events-none z-0">
         <svg viewBox="0 0 1000 300" className="w-full h-full">
            <path d="M0,150 Q250,50 500,150 T1000,150" fill="none" stroke="currentColor" strokeWidth="1" />
         </svg>
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-8 animate-fade z-10 relative">
        <Logo className="w-10 h-10 text-[#0A0A0A]" />
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Вход в Outlivion</h1>
          <p className="text-[14px] text-[rgba(0,0,0,0.45)] font-medium">Простой и красивый VPN-дашборд.</p>
        </div>

        <div className="w-full space-y-3 relative z-10">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              console.log('[Home] onClick вызван', e);
              e.preventDefault();
              e.stopPropagation();
              handleLogin(e).catch((err) => {
                console.error('[Home] Необработанная ошибка в handleLogin:', err);
              });
            }}
            onMouseDown={(e) => {
              console.log('[Home] onMouseDown вызван');
            }}
            disabled={loading}
            className="w-full bg-[#998DFF]/20 text-[#998DFF] py-3.5 rounded-xl font-bold text-[14px] transition-all hover:bg-[#998DFF]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer relative z-10"
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#998DFF]/30 border-t-[#998DFF] rounded-full animate-spin" />
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
