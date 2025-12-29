
import React from 'react';
import { MessageCircle, Mail, FileText, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';

export const Support: React.FC = () => {
  const faqs = [
    { q: "Мой платеж не прошел", a: "Проверьте лимиты вашего банка на онлайн-транзакции. Если деньги списались, но подписка не обновилась, свяжитесь с поддержкой в Telegram, приложив скриншот или ID инвойса." },
    { q: "Сколько устройств можно использовать?", a: "Каждая подписка Outlivion позволяет использовать до 5 одновременных подключений на разных устройствах без потери скорости." },
    { q: "Соединение слишком медленное", a: "Попробуйте сменить узел в приложении или переключиться между мобильным интернетом и Wi-Fi. Наши серверы оптимизированы для минимальных задержек." }
  ];

  return (
    <div className="max-w-[800px] mx-auto space-y-12 animate-fade">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0A0A]">Центр поддержки</h1>
        <p className="text-[rgba(10,10,10,0.5)] font-medium mt-1 text-lg leading-relaxed">Мы ответим на ваши вопросы и поможем с настройкой.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ContactCard 
          href="https://t.me/outlivion_support"
          icon={<MessageCircle size={32} />}
          title="Telegram Чат"
          label="Ответ за 5-10 минут"
          primary
        />
        <ContactCard 
          href="mailto:support@outlivion.space"
          icon={<Mail size={32} />}
          title="Email"
          label="Для официальных запросов"
        />
      </div>

      <div className="card-premium p-8 md:p-10">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
          <HelpCircle size={22} className="text-[#CE3000]" />
          Частые вопросы
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group border-b border-[rgba(10,10,10,0.04)] pb-6 last:border-0 last:pb-0">
              <summary className="flex justify-between items-center cursor-pointer list-none focus:outline-none">
                <span className="text-[16px] font-bold text-[#0A0A0A] group-hover:text-[#CE3000] transition-colors pr-4">{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-[rgba(10,10,10,0.03)] flex items-center justify-center transition-all group-open:rotate-90 shrink-0">
                   <ChevronRight size={16} />
                </div>
              </summary>
              <p className="mt-4 text-[15px] text-[rgba(10,10,10,0.55)] leading-[1.6] max-w-2xl">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContactCard: React.FC<{ href: string, icon: React.ReactNode, title: string, label: string, primary?: boolean }> = ({ href, icon, title, label, primary }) => (
  <a href={href} target="_blank" className={`p-8 rounded-[28px] flex flex-col gap-6 transition-all group hover:-translate-y-1 border shadow-sm ${
    primary 
      ? 'bg-[#0A0A0A] text-white border-transparent' 
      : 'bg-white text-[#0A0A0A] border-[rgba(10,10,10,0.06)]'
  }`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
      primary ? 'bg-white/10 text-white' : 'bg-[rgba(10,10,10,0.03)] text-[#0A0A0A]'
    }`}>
      {icon}
    </div>
    <div className="flex justify-between items-end">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${primary ? 'text-white/40' : 'text-[rgba(10,10,10,0.3)]'}`}>
          {label}
        </p>
      </div>
      <ArrowRight size={22} className={primary ? 'text-white/20 group-hover:text-white transition-colors' : 'text-[rgba(10,10,10,0.1)] group-hover:text-[#CE3000] transition-colors'} />
    </div>
  </a>
);
