# Быстрый старт с тестовым ботом

## Автоматическая настройка

Запустите скрипт настройки:
```bash
cd /Users/kelemetovmuhamed/Documents/vpnwebsite
./SETUP_TEST_BOT.sh
```

## Ручная настройка

### 1. Настройка бота

В файле `.env` бота (`/Users/kelemetovmuhamed/Desktop/vpn_bot/.env`) установите:

```env
TELEGRAM_BOT_TOKEN=8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g
TELEGRAM_USE_POLLING=1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
```

### 2. Запуск бота локально

```bash
cd /Users/kelemetovmuhamed/Desktop/vpn_bot
npm run dev
```

Бот будет доступен на `http://localhost:3000`

## 2. Настройка сайта

Создайте файл `.env.local` в корне проекта `vpnwebsite`:

```env
VITE_API_URL=http://localhost:3000
```

## 3. Запуск сайта

```bash
cd /Users/kelemetovmuhamed/Documents/vpnwebsite
npm run dev
```

Сайт будет доступен на `http://localhost:5173`

## 4. Настройка CORS в боте

В файле `.env` бота добавьте:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
TELEGRAM_USE_POLLING=1
```

## 5. Тестирование

1. Откройте тестового бота в Telegram
2. Отправьте `/start`
3. Бот должен предложить открыть WebApp
4. Откройте WebApp и проверьте работу

## Проверка

- ✅ Бот запущен на порту 3000
- ✅ Сайт запущен на порту 5173
- ✅ CORS настроен в боте
- ✅ `.env.local` создан с правильным API URL

## Отладка

Откройте консоль браузера (F12) и проверьте:
- Нет ли ошибок CORS
- Загружается ли `initData` из Telegram WebApp
- Работают ли запросы к API

