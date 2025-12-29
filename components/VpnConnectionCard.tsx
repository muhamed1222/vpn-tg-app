import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { PLANS } from '../constants';
import { Copy, Check, QrCode, Eye, EyeOff, Key } from 'lucide-react';
import { apiService } from '../services/apiService';

export const VpnConnectionCard: React.FC = () => {
  const { subscription } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [vpnKey, setVpnKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка VPN ключа из API
  useEffect(() => {
    const loadVpnKey = async () => {
      setLoadError(null);
      setLoading(true);
      try {
        const user = await apiService.getMe();
        if (user.subscription.vlessKey) {
          setVpnKey(user.subscription.vlessKey);
        } else {
          setLoadError('VPN ключ недоступен');
        }
      } catch (error) {
        console.error('Ошибка при загрузке VPN ключа:', error);
        // В режиме разработки используем моковый ключ
        if (!(window as any).Telegram?.WebApp) {
          setVpnKey('vless://outlivion-mock-key-12345@nodes.space:443?security=reality&sni=google.com&fp=chrome&pbk=xyz#Outlivion-Node');
        } else {
          setLoadError('Не удалось загрузить VPN ключ. Попробуйте обновить страницу.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadVpnKey();
  }, [subscription]);

  const maskedKey = vpnKey ? vpnKey.substring(0, 25) + '...' + vpnKey.substring(vpnKey.length - 20) : 'Загрузка...';

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!vpnKey) return;
    
    try {
      await navigator.clipboard.writeText(vpnKey);
      setCopied(true);
      setCopyError(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setCopyError('Не удалось скопировать');
      setCopied(false);
      console.error('Ошибка при копировании:', error);
    }
  };

  const handleRenew = () => {
    navigate('/pay');
  };

  // Получение названия тарифа из констант
  const getPlanName = () => {
    const plan = PLANS.find(p => p.id === subscription.planId);
    return plan ? plan.name : 'Базовый';
  };

  return (
    <>
      {/* Уведомление о статусе копирования для screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {copied && 'Ключ скопирован в буфер обмена'}
        {copyError && `Ошибка: ${copyError}`}
      </div>

      {/* Карточка "Ваше подключение" */}
      <div className="card-ref flex flex-col mb-6">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#CE3000]/10 flex items-center justify-center" aria-hidden="true">
                <Key size={20} className="text-[#CE3000]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-fg-4">Ваше подключение</h3>
                <p className="text-xs text-fg-2">VPN ключ для безопасного доступа</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.1)]"
                role="status"
                aria-label="Статус подключения: Активно"
              >
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" aria-hidden="true"></div>
                <span className="text-[11px] font-medium text-[#22C55E]">Активно</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-2 rounded-lg p-4 border border-border">
            {loadError ? (
              <div className="py-3">
                <div className="flex items-center gap-2 text-xs text-red-600 mb-2" role="alert">
                  <span>⚠️</span>
                  <span>{loadError}</span>
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    setLoadError(null);
                    const loadVpnKey = async () => {
                      try {
                        const user = await apiService.getMe();
                        if (user.subscription.vlessKey) {
                          setVpnKey(user.subscription.vlessKey);
                          setLoadError(null);
                        } else {
                          setLoadError('VPN ключ недоступен');
                        }
                      } catch (error) {
                        setLoadError('Не удалось загрузить VPN ключ. Попробуйте обновить страницу.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadVpnKey();
                  }}
                  className="text-xs text-[#CE3000] font-medium hover:underline"
                >
                  Попробовать снова
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {loading ? (
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-bg-3 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-bg-3 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : (
                    <code 
                      className="flex-1 text-xs font-mono text-fg-3 break-words break-all min-w-0 leading-relaxed select-all"
                      aria-label={keyVisible ? 'VPN ключ полностью виден' : 'VPN ключ частично скрыт'}
                    >
                      {keyVisible && vpnKey ? vpnKey : maskedKey}
                    </code>
                  )}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {!loading && vpnKey && (
                      <>
                        <button
                          onClick={() => setKeyVisible(!keyVisible)}
                          className="p-2 hover:bg-bg-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#CE3000] focus:ring-offset-2"
                          aria-label={keyVisible ? 'Скрыть VPN ключ' : 'Показать VPN ключ'}
                          aria-pressed={keyVisible}
                          title={keyVisible ? 'Скрыть ключ' : 'Показать ключ'}
                        >
                          {keyVisible ? (
                            <EyeOff size={16} className="text-fg-3" aria-hidden="true" />
                          ) : (
                            <Eye size={16} className="text-fg-3" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className={`p-2 hover:bg-bg-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#CE3000] focus:ring-offset-2 ${showQR ? 'bg-bg-3' : ''}`}
                          aria-label={showQR ? 'Скрыть QR код' : 'Показать QR код'}
                          aria-pressed={showQR}
                          title={showQR ? 'Скрыть QR код' : 'Показать QR код'}
                        >
                          <QrCode size={16} className="text-fg-3" aria-hidden="true" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-[#CE3000] text-white text-xs font-semibold rounded-lg hover:bg-[#B82A00] transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#CE3000] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
                      aria-label={copied ? 'Ключ скопирован' : 'Копировать VPN ключ в буфер обмена'}
                      disabled={copied || !vpnKey || loading}
                    >
                      {copied ? (
                        <>
                          <Check size={14} aria-hidden="true" />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} aria-hidden="true" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {copyError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600" role="alert">
                    {copyError}
                  </div>
                )}

                {showQR && vpnKey && (
                  <div className="mt-4 pt-4 border-t border-border flex justify-center" role="region" aria-label="QR код VPN ключа">
                    <div className="w-48 h-48 bg-white p-4 rounded-lg border border-border">
                      <div className="w-full h-full bg-bg-2 rounded flex items-center justify-center text-xs text-fg-2">
                        QR код будет здесь
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="text-xs">
                <span className="text-fg-2 font-medium">Тариф:</span>
                <span className="text-fg-4 font-semibold ml-1.5">{getPlanName()}</span>
              </div>
              <div className="text-xs">
                <span className="text-fg-2 font-medium">До:</span>
                <span className="text-fg-4 font-semibold ml-1.5">{subscription.activeUntil || '—'}</span>
              </div>
            </div>
            <button 
              onClick={handleRenew}
              className="btn-footer bg-fg-4 text-white hover:bg-fg-4/90 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#CE3000] focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
              aria-label="Продлить подписку"
            >
              Продлить
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

