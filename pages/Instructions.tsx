import React, { useState } from 'react';
import { PLATFORMS } from '../constants.tsx';
import { Copy, Check, Download, ExternalLink, Smartphone, Laptop, Monitor, Apple } from 'lucide-react';

const PlatformIcon = ({ id, size = 20 }: { id: string, size?: number }) => {
  switch (id) {
    case 'ios': return <Smartphone size={size} />;
    case 'android': return <Smartphone size={size} />;
    case 'windows': return <Monitor size={size} />;
    case 'macos': return <Apple size={size} />;
    default: return <Laptop size={size} />;
  }
};

export const Instructions: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('vless://outlivion-mock-key-12345@nodes.space:443?security=reality&sni=google.com&fp=chrome&pbk=xyz#Outlivion-Node');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10 animate-fade">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight text-[#0A0A0A]">Настройка</h1>
        <p className="text-[rgba(10,10,10,0.5)] font-medium mt-2">Активация доступа в три простых шага</p>
      </div>

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
              <button className="flex items-center gap-2.5 bg-[#0A0A0A] text-white px-6 py-3 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Download size={16} /> Скачать приложение
              </button>
            }
          />
          <Step 
            number="2" 
            title="Копирование ключа"
            description="Ваш уникальный идентификатор для безопасного туннеля."
            action={
              <div className="flex flex-col gap-3">
                <div className="bg-[rgba(10,10,10,0.02)] border border-[rgba(10,10,10,0.06)] p-4 rounded-xl font-mono text-[11px] break-all text-[rgba(10,10,10,0.6)]">
                  vless://outlivion-mock-key-12345@nodes.space:443...
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center self-start gap-2.5 bg-white border border-[rgba(10,10,10,0.1)] text-[#0A0A0A] px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-all"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied ? 'Скопировано' : 'Копировать ключ'}
                </button>
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
          <a 
            href="#/support" 
            className="flex items-center gap-2 text-[13px] font-bold text-[#CE3000] hover:translate-x-1 transition-transform"
          >
            Связаться с инженером <ExternalLink size={14} />
          </a>
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