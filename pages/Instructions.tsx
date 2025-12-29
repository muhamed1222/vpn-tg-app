import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PLATFORMS } from '../constants';
import { Copy, Check, Download, ExternalLink, Smartphone, Laptop, Monitor, Apple, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { apiService } from '../services/apiService';

const PlatformIcon = ({ id, size = 20 }: { id: string, size?: number }) => {
  switch (id) {
    case 'ios': return <Smartphone size={size} />;
    case 'android': return <Smartphone size={size} />;
    case 'windows': return <Monitor size={size} />;
    case 'macos': return <Apple size={size} />;
    default: return <Laptop size={size} />;
  }
};

// Ссылки на скачивание приложений для разных платформ
const DOWNLOAD_LINKS: Record<string, { url: string; name: string }> = {
  ios: { url: 'https://apps.apple.com/app/v2rayng/id1538861777', name: 'App Store' },
  android: { url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang', name: 'Google Play' },
  windows: { url: 'https://github.com/2dust/v2rayN/releases', name: 'GitHub Releases' },
  macos: { url: 'https://github.com/yanue/V2rayU/releases', name: 'GitHub Releases' },
};

export const Instructions: React.FC = () => {
  const { subscription } = useAuth();
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [vpnKey, setVpnKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
          setLoadError('VPN ключ недоступен. Убедитесь, что у вас активная подписка.');
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

  const handleCopy = async () => {
    if (!vpnKey) {
      setCopyError('VPN ключ недоступен');
      return;
    }

    setCopyError(null);
    try {
      await navigator.clipboard.writeText(vpnKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      setCopyError('Не удалось скопировать ключ. Попробуйте выделить и скопировать вручную.');
    }
  };

  const downloadLink = DOWNLOAD_LINKS[activePlatform];

  return (
    <div className="max-w-[800px] mx-auto space-y-10 animate-fade">
      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-[rgba(10,10,10,0.06)] overflow-x-auto no-scrollbar shadow-sm">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2.5 ${
              activePlatform === p.id 
                ? 'bg-[#0A0A0A] text-white shadow-lg' 
                : 'text-[rgba(10,10,10,0.4)] hover:text-[#0A0A0A] hover:bg-gray-50'
            }`}
          >
            <PlatformIcon id={p.id} size={16} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card-premium p-8 md:p-12 space-y-12">
        <div className="space-y-12">
          <Step 
            number="1" 
            title="Установка клиента"
            description={`Загрузите и установите официальное приложение для ${PLATFORMS.find(p => p.id === activePlatform)?.name}.`}
            action={
              downloadLink ? (
                <a
                  href={downloadLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-[#0A0A0A] text-white px-6 py-3 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-[#0A0A0A]/90"
                >
                  <Download size={16} /> Скачать из {downloadLink.name}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <button 
                  disabled
                  className="flex items-center gap-2.5 bg-[#0A0A0A]/50 text-white px-6 py-3 rounded-xl text-[13px] font-bold cursor-not-allowed"
                >
                  <Download size={16} /> Скачать приложение
                </button>
              )
            }
          />
          <Step 
            number="2" 
            title="Копирование ключа"
            description="Ваш уникальный идентификатор для безопасного туннеля."
            action={
              <div className="flex flex-col gap-3">
                {loadError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2" role="alert">
                    <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-red-800 font-medium mb-1">{loadError}</p>
                      <Link 
                        to="/account" 
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Перейти в аккаунт →
                      </Link>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="bg-[rgba(10,10,10,0.02)] border border-[rgba(10,10,10,0.06)] p-4 rounded-xl flex items-center gap-3">
                    <Loader2 size={16} className="text-fg-3 animate-spin" />
                    <span className="text-xs text-fg-2 font-medium">Загрузка VPN ключа...</span>
                  </div>
                ) : vpnKey ? (
                  <>
                    <div className="bg-[rgba(10,10,10,0.02)] border border-[rgba(10,10,10,0.06)] p-4 rounded-xl font-mono text-[11px] break-all text-[rgba(10,10,10,0.6)] select-all">
                      {keyVisible ? vpnKey : maskedKey}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={handleCopy}
                        disabled={copied}
                        className="flex items-center gap-2.5 bg-white border border-[rgba(10,10,10,0.1)] text-[#0A0A0A] px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {copied ? (
                          <>
                            <Check size={16} className="text-green-600" />
                            Скопировано
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Копировать ключ
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setKeyVisible(!keyVisible)}
                        className="flex items-center gap-2.5 bg-white border border-[rgba(10,10,10,0.1)] text-[#0A0A0A] px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-all"
                        aria-label={keyVisible ? 'Скрыть ключ' : 'Показать ключ'}
                      >
                        {keyVisible ? (
                          <>
                            <EyeOff size={16} />
                            Скрыть
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Показать
                          </>
                        )}
                      </button>
                    </div>
                    {copyError && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2" role="alert">
                        <AlertCircle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-yellow-800">{copyError}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-bg-2 border border-border rounded-xl">
                    <p className="text-xs text-fg-2">VPN ключ недоступен</p>
                  </div>
                )}
              </div>
            }
          />
          <Step 
            number="3" 
            title="Подключение"
            description="Запустите приложение, выберите «Импорт из буфера» и нажмите кнопку подключения."
          />
        </div>

        <div className="pt-10 border-t border-[rgba(10,10,10,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[rgba(10,10,10,0.4)] font-medium">Нужна помощь с конфигурацией?</p>
          <Link 
            to="/support" 
            className="flex items-center gap-2 text-[13px] font-bold text-[#CE3000] hover:translate-x-1 transition-transform"
          >
            Связаться с инженером <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ number: string; title: string; description: string; action?: React.ReactNode }> = ({ number, title, description, action }) => (
  <div className="flex gap-8 group">
    <div className="w-10 h-10 rounded-full bg-[rgba(10,10,10,0.03)] border border-[rgba(10,10,10,0.06)] text-[#0A0A0A] flex items-center justify-center text-[15px] font-black shrink-0 transition-colors group-hover:bg-[#0A0A0A] group-hover:text-white group-hover:border-[#0A0A0A]">
      {number}
    </div>
    <div className="flex-1 space-y-5">
      <div>
        <h4 className="text-lg font-bold text-[#0A0A0A] tracking-tight">{title}</h4>
        <p className="text-[15px] text-[rgba(10,10,10,0.5)] leading-relaxed mt-1">{description}</p>
      </div>
      {action && <div className="animate-fade">{action}</div>}
    </div>
  </div>
);