# Быстрый старт с тестовым ботом

## Автоматическая настройка

Запустите скрипт настройки:
```bash
cd /Users/kelemetovmuhamed/Documents/vpnwebsite
BOT_TOKEN=ваш_токен_бота ./SETUP_TEST_BOT.sh
```

## Ручная настройка

### Шаг 1. Настройка бота

В файле `.env` бота (`/Users/kelemetovmuhamed/Desktop/vpn_bot/.env`) установите:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_USE_POLLING=1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
```

### Шаг 2. Запуск бота локально

```bash
cd /Users/kelemetovmuhamed/Desktop/vpn_bot
npm run dev
```

Бот будет доступен на `http://localhost:3000`.

### Шаг 3. Настройка сайта

Создайте файл `.env.local` в корне проекта `vpnwebsite`:

```env
VITE_API_URL=http://localhost:3000
```

### Шаг 4. Запуск сайта

```bash
cd /Users/kelemetovmuhamed/Documents/vpnwebsite
npm run dev
```

Сайт будет доступен на `http://localhost:5173`.

### Шаг 5. Настройка CORS в боте

В файле `.env` бота добавьте:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
TELEGRAM_USE_POLLING=1
```

### Шаг 6. Тестирование

1. Откройте тестового бота в Telegram
2. Отправьте `/start`
3. Бот должен предложить открыть WebApp
4. Откройте WebApp и проверьте работу

## Проверка

- [x] Бот запущен на порту 3000
- [x] Сайт запущен на порту 5173
- [x] CORS настроен в боте
- [x] `.env.local` создан с правильным API URL

## Отладка

Откройте консоль браузера (F12) и проверьте:
- Нет ли ошибок CORS
- Загружается ли `initData` из Telegram WebApp
- Работают ли запросы к API
