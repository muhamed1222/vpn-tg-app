# Настройка тестового бота

## Токен бота

Токен тестового бота сохранен в `TEST_BOT_TOKEN.txt`

**⚠️ ВАЖНО:** Не коммитьте токен в git! Файл уже добавлен в `.gitignore`

## Быстрая настройка

### Вариант 1: Автоматическая настройка

```bash
./SETUP_TEST_BOT.sh
```

Скрипт автоматически:
- Обновит токен в `.env` бота
- Настроит polling режим
- Настроит CORS для localhost

### Вариант 2: Ручная настройка

1. **Настройте бота** (`/Users/kelemetovmuhamed/Desktop/vpn_bot/.env`):
   ```env
   TELEGRAM_BOT_TOKEN=8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g
   TELEGRAM_USE_POLLING=1
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org
   PORT=3000
   ```

2. **Настройте сайт** (создайте `.env.local`):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Запуск

1. **Запустите бота:**
   ```bash
   cd /Users/kelemetovmuhamed/Desktop/vpn_bot
   npm run dev
   ```

2. **Запустите сайт:**
   ```bash
   cd /Users/kelemetovmuhamed/Documents/vpnwebsite
   npm run dev
   ```

3. **Откройте тестового бота в Telegram** и используйте WebApp

## Проверка

- ✅ Бот запущен: `http://localhost:3000/health` должен вернуть `OK`
- ✅ Сайт запущен: `http://localhost:5173`
- ✅ CORS настроен в боте
- ✅ API URL указан в `.env.local`

## Отладка

Если что-то не работает:

1. Проверьте логи бота в консоли
2. Откройте консоль браузера (F12) и проверьте ошибки
3. Убедитесь, что сайт открыт через Telegram (не в обычном браузере)
4. Проверьте, что `initData` загружается в консоли

