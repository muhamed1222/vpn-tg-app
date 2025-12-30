import React, { useState, useMemo } from 'react';
import { MessageCircle, Mail, ChevronRight, HelpCircle, ArrowRight, Search, X, Clock } from 'lucide-react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_CATEGORIES = ['Все', 'Платежи', 'Настройка', 'Технические', 'Подписка'];

const ALL_FAQS: FAQ[] = [
  // Платежи
  { 
    id: '1', 
    category: 'Платежи', 
    question: "Мой платеж не прошел", 
    answer: "Проверьте лимиты вашего банка на онлайн-транзакции. Если деньги списались, но подписка не обновилась, свяжитесь с поддержкой в Telegram, приложив скриншот или ID инвойса. Обычно платежи обрабатываются в течение 5-10 минут." 
  },
  { 
    id: '2', 
    category: 'Платежи', 
    question: "Как вернуть деньги?", 
    answer: "Возврат средств возможен в течение 14 дней с момента покупки при условии, что подписка не была использована. Для возврата напишите в поддержку с указанием номера заказа и причины возврата." 
  },
  { 
    id: '3', 
    category: 'Платежи', 
    question: "Какие способы оплаты доступны?", 
    answer: "Мы принимаем оплату через Telegram Stars, банковские карты (Visa, MasterCard, МИР), а также криптовалюту. Все платежи защищены и зашифрованы." 
  },
  
  // Настройка
  { 
    id: '4', 
    category: 'Настройка', 
    question: "Как настроить VPN на моем устройстве?", 
    answer: "Перейдите в раздел 'Настройка' и следуйте пошаговым инструкциям для вашей платформы. Мы поддерживаем iOS, Android, Windows и macOS. Если возникнут проблемы, наша поддержка поможет вам." 
  },
  { 
    id: '5', 
    category: 'Настройка', 
    question: "Где найти VPN ключ?", 
    answer: "VPN ключ доступен в разделе 'Аккаунт' → 'Основное'. Вы можете скопировать его или отсканировать QR-код для быстрой настройки." 
  },
  { 
    id: '6', 
    category: 'Настройка', 
    question: "Нужно ли устанавливать дополнительное ПО?", 
    answer: "Да, вам нужно установить VPN-клиент. Мы рекомендуем официальные приложения: v2rayNG для мобильных устройств и v2rayN для Windows. Ссылки на скачивание доступны в разделе 'Настройка'." 
  },
  
  // Технические
  { 
    id: '7', 
    category: 'Технические', 
    question: "Сколько устройств можно использовать?", 
    answer: "Каждая подписка Outlivion позволяет использовать до 5 одновременных подключений на разных устройствах без потери скорости. Вы можете подключить телефон, планшет, ноутбук и другие устройства одновременно." 
  },
  { 
    id: '8', 
    category: 'Технические', 
    question: "Соединение слишком медленное", 
    answer: "Попробуйте сменить узел в приложении или переключиться между мобильным интернетом и Wi-Fi. Наши серверы оптимизированы для минимальных задержек. Также проверьте, не используете ли вы VPN на нескольких устройствах одновременно (лимит 5 устройств)." 
  },
  { 
    id: '9', 
    category: 'Технические', 
    question: "VPN не подключается", 
    answer: "Убедитесь, что у вас активная подписка и правильный VPN ключ. Проверьте интернет-соединение и попробуйте перезапустить приложение. Если проблема сохраняется, свяжитесь с поддержкой." 
  },
  { 
    id: '10', 
    category: 'Технические', 
    question: "Какой протокол используется?", 
    answer: "Мы используем протокол VLESS с Reality для максимальной безопасности и скорости. Этот протокол обеспечивает обход блокировок и защиту ваших данных." 
  },
  
  // Подписка
  { 
    id: '11', 
    category: 'Подписка', 
    question: "Как продлить подписку?", 
    answer: "Перейдите в раздел 'Аккаунт' → 'Биллинг' и нажмите 'Продлить' или 'Обновить'. Вы можете выбрать любой доступный тариф. Подписка продлевается автоматически при оплате." 
  },
  { 
    id: '12', 
    category: 'Подписка', 
    question: "Что происходит после окончания подписки?", 
    answer: "После окончания подписки доступ к VPN будет приостановлен. Вы сможете продлить подписку в любое время, и доступ восстановится сразу после оплаты. Ваши настройки и история сохранятся." 
  },
  { 
    id: '13', 
    category: 'Подписка', 
    question: "Можно ли изменить тариф?", 
    answer: "Да, вы можете изменить тариф в любое время. При переходе на более дорогой тариф разница доплачивается пропорционально оставшемуся времени. При переходе на более дешевый тариф разница засчитывается в счет следующего периода." 
  },
];

export const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Фильтрация FAQ по категории и поисковому запросу
  const filteredFaqs = useMemo(() => {
    let filtered = ALL_FAQS;

    // Фильтр по категории
    if (selectedCategory !== 'Все') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleFaqToggle = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-12 animate-fade">

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ContactCard 
          href="https://t.me/outlivion_support"
          icon={<MessageCircle size={32} />}
          title="Telegram Чат"
          label="Ответ за 5-10 минут"
          description="Быстрая помощь в реальном времени"
          primary
        />
        <ContactCard 
          href="mailto:support@outlivion.space"
          icon={<Mail size={32} />}
          title="Email"
          label="Для официальных запросов"
          description="Ответ в течение 24 часов"
        />
      </div>

      {/* Support Info */}
      <div className="card-premium p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
              <Clock size={20} className="text-[var(--success-text)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg-4">Время работы поддержки</p>
              <p className="text-xs text-fg-2">24/7, без выходных</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--success-bg)] rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--success-text)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--success-text)]">Онлайн</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card-premium p-8 md:p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <HelpCircle size={22} className="text-[var(--primary)]" />
            Частые вопросы
          </h2>
          <span className="text-sm text-fg-2 font-medium">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'вопрос' : filteredFaqs.length < 5 ? 'вопроса' : 'вопросов'}
          </span>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-2" />
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-bg-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-3 rounded-lg transition-colors"
                aria-label="Очистить поиск"
              >
                <X size={16} className="text-fg-2" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FAQ_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-[var(--contrast-bg)] text-[var(--contrast-text)]'
                  : 'bg-bg-2 text-fg-3 hover:bg-bg-3 hover:text-fg-4'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center">
            <HelpCircle size={48} className="mx-auto text-fg-1 mb-4" />
            <p className="text-sm text-fg-2 font-medium mb-1">Ничего не найдено</p>
            <p className="text-xs text-fg-1">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`border border-border rounded-xl overflow-hidden transition-all ${
                  openFaqId === faq.id ? 'bg-bg-2' : 'bg-[var(--background)] hover:bg-bg-2'
                }`}
              >
                <button
                  onClick={() => handleFaqToggle(faq.id)}
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-xl"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold uppercase">
                        {faq.category}
                      </span>
                    </div>
                    <span className="text-[15px] font-bold text-fg-4 block">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center transition-transform shrink-0 ${
                    openFaqId === faq.id ? 'rotate-90' : ''
                  }`}>
                    <ChevronRight size={16} className="text-fg-3" />
                  </div>
                </button>
                {openFaqId === faq.id && (
                  <div className="px-4 pb-4 animate-fade">
                    <p className="text-[14px] text-fg-3 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContactCard: React.FC<{ 
  href: string, 
  icon: React.ReactNode, 
  title: string, 
  label: string, 
  description?: string,
  primary?: boolean 
}> = ({ href, icon, title, label, description, primary }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className={`p-5 rounded-[28px] flex flex-col gap-6 transition-all group hover:-translate-y-1 border ${
      primary 
        ? 'bg-[var(--contrast-bg)] text-[var(--contrast-text)] border-transparent' 
        : 'bg-[var(--background)] text-fg-4 border-border'
    }`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
      primary ? 'bg-[var(--contrast-bg-soft)] text-[var(--contrast-text)]' : 'bg-bg-2 text-fg-4'
    }`}>
      {icon}
    </div>
    <div className="flex justify-between items-end">
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${primary ? 'text-[var(--contrast-text-muted)]' : 'text-fg-1'}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs ${primary ? 'text-[var(--contrast-text-muted)]' : 'text-fg-2'}`}>
            {description}
          </p>
        )}
      </div>
      <ArrowRight 
        size={22} 
        className={`shrink-0 ${primary ? 'text-[var(--contrast-text-muted)] group-hover:text-[var(--contrast-text)] transition-colors' : 'text-fg-1 group-hover:text-[var(--primary)] transition-colors'}`} 
      />
    </div>
  </a>
);
