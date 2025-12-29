
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';

export const Docs: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const isOffer = type === 'offer';

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex justify-center py-12 md:py-20">
      <div className="w-full max-w-[800px] px-6 animate-fade">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-[rgba(10,10,10,0.3)] hover:text-[#0A0A0A] mb-10 transition-colors">
          <ArrowLeft size={16} /> Назад
        </Link>

        <div className="card-premium p-10 md:p-16">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 bg-[rgba(10,10,10,0.03)] rounded-2xl flex items-center justify-center text-[#0A0A0A]">
              <ScrollText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A0A0A]">
                {isOffer ? 'Публичная оферта' : 'Приватность'}
              </h1>
              <p className="text-[11px] font-bold text-[rgba(10,10,10,0.3)] uppercase tracking-widest mt-1">
                Последнее обновление: Январь 2025
              </p>
            </div>
          </div>

          <article className="space-y-12 text-[16px] leading-[1.65] text-[rgba(10,10,10,0.65)]">
            <section className="space-y-5">
              <h2 className="text-[14px] font-black text-[#0A0A0A] uppercase tracking-[0.1em]">1. Общие положения</h2>
              <p>
                Настоящий документ является публичной офертой Outlivion на предоставление цифровых услуг. Используя нашу платформу через Telegram или данный веб-интерфейс, пользователь полностью и безоговорочно принимает данные условия.
              </p>
              <p>
                Мы стремимся обеспечить прозрачность наших отношений с пользователями, гарантируя высокое качество сервиса и защиту ваших интересов в рамках законодательства.
              </p>
            </section>

            <section className="space-y-5">
              <h2 className="text-[14px] font-black text-[#0A0A0A] uppercase tracking-[0.1em]">2. Описание услуг</h2>
              <p>
                Outlivion предоставляет доступ к защищенному сетевому протоколу для обеспечения конфиденциальности и безопасности в сети Интернет. Мы используем современные технологии шифрования, чтобы ваш трафик оставался недоступным для третьих лиц.
              </p>
              <p>
                Важно отметить, что мы строго придерживаемся политики отсутствия логов (no-logs policy). Это означает, что мы не собираем и не храним информацию о вашей активности в сети, посещенных сайтах или передаваемых данных.
              </p>
            </section>

            <section className="space-y-5">
              <h2 className="text-[14px] font-black text-[#0A0A0A] uppercase tracking-[0.1em]">3. Условия оплаты и возврата</h2>
              <p>
                Подписки оплачиваются разово на выбранный период. Мы не используем автоматические рекуррентные платежи без вашего явного согласия. Срок действия подписки прибавляется к текущему, если вы продлеваете активный тариф.
              </p>
              <p>
                Возврат средств возможен в течение первых 48 часов после оплаты, если сервис не работает по техническим причинам, которые мы не смогли устранить в разумный срок.
              </p>
            </section>

            <div className="pt-12 border-t border-[rgba(10,10,10,0.05)] mt-12 text-center">
              <p className="text-[12px] text-[rgba(10,10,10,0.4)] font-medium">
                Если у вас возникли вопросы по документам, пожалуйста, напишите нам: <a href="mailto:support@outlivion.space" className="text-[#0A0A0A] font-bold hover:text-[#CE3000] border-b border-[#0A0A0A] hover:border-[#CE3000] transition-colors pb-0.5">support@outlivion.space</a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
