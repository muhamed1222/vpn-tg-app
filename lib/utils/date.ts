/**
 * Утилиты для форматирования дат
 */

/**
 * Форматирует timestamp в читаемый формат на русском языке
 * Пример: 1704067200000 -> "1 января 2024"
 * 
 * @param timestamp - Временная метка в миллисекундах
 * @returns Отформатированная строка даты на русском языке
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Форматирует дату в формате YYYY-MM-DD в читаемый формат на русском языке
 * Пример: "2025-12-05" -> "5 декабря 2025"
 * 
 * @param dateString - Дата в формате ISO (YYYY-MM-DD) или ISO string
 * @returns Отформатированная строка даты на русском языке
 */
export function formatExpirationDate(dateString?: string): string {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Форматирует дату в полном формате для отображения в карточках
 * Пример: "2025-12-05T10:30:00Z" -> "5 декабря 2025"
 * 
 * @param dateString - Дата в формате ISO string
 * @returns Отформатированная строка даты на русском языке
 */
export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('ru-RU', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Форматирует дату с временем для истории событий
 * Пример: "2025-01-10T10:30:00Z" -> "10 янв, 10:30" или "Сегодня, 10:30"
 * 
 * @param dateString - Дата в формате ISO string
 * @returns Отформатированная строка даты и времени
 */
export function formatDateWithTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ticketDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = today.getTime() - ticketDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const day = date.getDate();
  const month = date.toLocaleDateString('ru-RU', { month: 'short' });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (diffDays === 0) {
    return `Сегодня, ${hours}:${minutes}`;
  } else if (diffDays === 1) {
    return `Вчера, ${hours}:${minutes}`;
  } else if (diffDays < 7) {
    return `${day} ${month}, ${hours}:${minutes}`;
  } else {
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }
}
