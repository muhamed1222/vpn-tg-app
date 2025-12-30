#!/bin/bash

# Скрипт для быстрой настройки тестового бота

BOT_DIR="/Users/kelemetovmuhamed/Desktop/vpn_bot"
BOT_TOKEN="${BOT_TOKEN:-}"

echo "🔧 Настройка тестового бота..."
echo ""

# Проверяем наличие токена
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Не задан токен бота."
    echo "Укажите его через переменную окружения:"
    echo "export BOT_TOKEN=ваш_токен_бота"
    exit 1
fi

# Проверяем существование директории бота
if [ ! -d "$BOT_DIR" ]; then
    echo "❌ Директория бота не найдена: $BOT_DIR"
    exit 1
fi

# Переходим в директорию бота
cd "$BOT_DIR" || exit 1

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cp TEST_ENV_EXAMPLE .env 2>/dev/null || touch .env
fi

# Обновляем токен в .env
echo "🔑 Обновление токена бота..."
if grep -q "TELEGRAM_BOT_TOKEN=" .env; then
    sed -i '' "s|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$BOT_TOKEN|" .env
else
    echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> .env
fi

# Устанавливаем polling режим
if grep -q "TELEGRAM_USE_POLLING=" .env; then
    sed -i '' "s|TELEGRAM_USE_POLLING=.*|TELEGRAM_USE_POLLING=1|" .env
else
    echo "TELEGRAM_USE_POLLING=1" >> .env
fi

# Настраиваем CORS
if grep -q "ALLOWED_ORIGINS=" .env; then
    sed -i '' "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org|" .env
else
    echo "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://web.telegram.org" >> .env
fi

echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Запустите бота: cd $BOT_DIR && npm run dev"
echo "2. Запустите сайт: cd /Users/kelemetovmuhamed/Documents/vpnwebsite && npm run dev"
echo "3. Откройте тестового бота в Telegram и используйте WebApp"
