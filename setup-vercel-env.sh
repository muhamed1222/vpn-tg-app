#!/bin/bash
# Скрипт для настройки переменных окружения на Vercel
# Запустите после авторизации: vercel login

echo "🔧 Настройка переменных окружения для проекта outlivion-miniapp на Vercel..."
echo ""

# Проверка авторизации
if ! vercel whoami &>/dev/null; then
    echo "❌ Вы не авторизованы в Vercel CLI"
    echo "   Запустите: vercel login"
    exit 1
fi

# Связывание проекта (если еще не связан)
if [ ! -f ".vercel/project.json" ]; then
    echo "📎 Связывание проекта с Vercel..."
    vercel link --yes --project=outlivion-miniapp --scope=muhameds-projects-9d998835
fi

echo ""
echo "📝 Добавление переменных окружения..."
echo ""

# Обязательные переменные
echo "1. TELEGRAM_BOT_TOKEN..."
echo "8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g" | vercel env add TELEGRAM_BOT_TOKEN production
echo "8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g" | vercel env add TELEGRAM_BOT_TOKEN preview
echo "8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g" | vercel env add TELEGRAM_BOT_TOKEN development

echo "2. NEXT_PUBLIC_API_BASE_URL..."
echo "https://api.outlivion.space" | vercel env add NEXT_PUBLIC_API_BASE_URL production
echo "https://api.outlivion.space" | vercel env add NEXT_PUBLIC_API_BASE_URL preview
echo "https://api.outlivion.space" | vercel env add NEXT_PUBLIC_API_BASE_URL development

echo "3. NEXT_PUBLIC_PAYMENT_REDIRECT_URL..."
echo "(оставьте пустым, если не используется редирект)" | vercel env add NEXT_PUBLIC_PAYMENT_REDIRECT_URL production
echo "(оставьте пустым, если не используется редирект)" | vercel env add NEXT_PUBLIC_PAYMENT_REDIRECT_URL preview
echo "(оставьте пустым, если не используется редирект)" | vercel env add NEXT_PUBLIC_PAYMENT_REDIRECT_URL development

echo "4. NEXT_PUBLIC_SUBSCRIPTION_BASE_URL..."
echo "https://vpn.outlivion.space" | vercel env add NEXT_PUBLIC_SUBSCRIPTION_BASE_URL production
echo "https://vpn.outlivion.space" | vercel env add NEXT_PUBLIC_SUBSCRIPTION_BASE_URL preview
echo "https://vpn.outlivion.space" | vercel env add NEXT_PUBLIC_SUBSCRIPTION_BASE_URL development

echo "5. NEXT_PUBLIC_SUPPORT_TELEGRAM_URL..."
echo "https://t.me/outlivion_support" | vercel env add NEXT_PUBLIC_SUPPORT_TELEGRAM_URL production
echo "https://t.me/outlivion_support" | vercel env add NEXT_PUBLIC_SUPPORT_TELEGRAM_URL preview
echo "https://t.me/outlivion_support" | vercel env add NEXT_PUBLIC_SUPPORT_TELEGRAM_URL development

echo "6. NEXT_PUBLIC_HELP_BASE_URL..."
echo "https://help.outlivion.space" | vercel env add NEXT_PUBLIC_HELP_BASE_URL production
echo "https://help.outlivion.space" | vercel env add NEXT_PUBLIC_HELP_BASE_URL preview
echo "https://help.outlivion.space" | vercel env add NEXT_PUBLIC_HELP_BASE_URL development

echo ""
echo "✅ Переменные окружения настроены!"
echo ""
echo "📋 Проверка переменных:"
vercel env ls

echo ""
echo "🚀 После настройки переменных перезапустите деплой на Vercel"
