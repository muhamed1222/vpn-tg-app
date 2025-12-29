# Настройка тестового бота

## Шаг 1: Настройка тестового бота

Токен тестового бота уже получен:
```
8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g
```

### Настройка бота:

1. Перейдите в папку с ботом:
   ```bash
   cd /Users/kelemetovmuhamed/Desktop/vpn_bot
   ```

2. Создайте или обновите файл `.env`:
   ```env
   # Токен тестового бота
   TELEGRAM_BOT_TOKEN=8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g
   
   # Для локальной разработки используйте polling
   TELEGRAM_USE_POLLING=1
   
   # Порт для бота
   PORT=3000
   
   # CORS - разрешаем запросы с localhost
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
   
   # Остальные настройки из вашего .env
   ```

## Шаг 2: Настройка бота

### Вариант A: Локальная разработка

1. Убедитесь, что бот запущен локально на порту 3000:
   ```bash
   cd /path/to/vpn_bot
   npm run dev
   ```

2. В файле `.env` бота установите:
   ```env
   TELEGRAM_USE_POLLING=1
   PORT=3000
   ```

3. В файле `.env.local` сайта установите:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Вариант B: Тестовый сервер

1. Разверните бота на тестовом сервере
2. В файле `.env.local` сайта установите:
   ```env
   VITE_API_URL=https://test-vpn.outlivion.space
   ```

## Шаг 3: Настройка CORS

В боте (`server.ts`) убедитесь, что CORS разрешает запросы с вашего домена:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['https://web.telegram.org', 'https://webk.telegram.org', 'https://webz.telegram.org'];
```

Для локальной разработки добавьте:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Шаг 4: Запуск сайта

```bash
cd /path/to/vpnwebsite
npm run dev
```

Сайт будет доступен на `http://localhost:5173`

## Шаг 5: Тестирование

1. Откройте тестового бота в Telegram
2. Отправьте команду `/start`
3. Бот должен отправить ссылку на WebApp или кнопку для открытия
4. Откройте WebApp и проверьте авторизацию

## Проверка работы

1. Откройте консоль браузера (F12)
2. Проверьте, что нет ошибок
3. Нажмите кнопку "Продолжить с Telegram"
4. Должна произойти авторизация через Telegram WebApp

## Troubleshooting

### Ошибка "Telegram WebApp не инициализирован"

- Убедитесь, что сайт открыт через Telegram бота (не в обычном браузере)
- Проверьте, что скрипт Telegram WebApp загружен в `index.html`

### Ошибка CORS

- Проверьте настройки `ALLOWED_ORIGINS` в боте
- Убедитесь, что домен сайта добавлен в разрешенные

### API не отвечает

- Проверьте, что бот запущен и доступен по указанному URL
- Проверьте логи бота на наличие ошибок
- Убедитесь, что порт 3000 не занят другим приложением

