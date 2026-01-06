# 🔧 Настройка переменных окружения на Vercel

## Через веб-интерфейс (рекомендуется)

1. Откройте https://vercel.com/dashboard
2. Выберите проект **outlivion-miniapp**
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные для **Production**, **Preview** и **Development**:

### Обязательные переменные:

```
TELEGRAM_BOT_TOKEN=8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g
NEXT_PUBLIC_API_BASE_URL=https://api.outlivion.space
```

### Дополнительные переменные:

```
NEXT_PUBLIC_PAYMENT_REDIRECT_URL= (оставьте пустым, если не используется редирект)
NEXT_PUBLIC_SUBSCRIPTION_BASE_URL=https://vpn.outlivion.space
NEXT_PUBLIC_SUPPORT_TELEGRAM_URL=https://t.me/outlivion_support
NEXT_PUBLIC_HELP_BASE_URL=https://help.outlivion.space
```

**Примечание:**
- `NEXT_PUBLIC_SUBSCRIPTION_BASE_URL` - это URL сервера Marzban, где проксируются подписки через `/api/sub/:token`
- `NEXT_PUBLIC_PAYMENT_REDIRECT_URL` - используется только если нужен редирект для deep link (обычно не требуется)

## Через Vercel CLI

Если проект уже связан с Vercel:

```bash
# Связать проект (если еще не связан)
vercel link

# Добавить переменные окружения
vercel env add TELEGRAM_BOT_TOKEN production
# Введите: 8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g

vercel env add NEXT_PUBLIC_API_BASE_URL production
# Введите: https://api.outlivion.space

# И так далее для остальных переменных...
```

## Через Vercel API (программно)

Можно использовать Vercel REST API для автоматической настройки:

```bash
# Получить токен доступа из https://vercel.com/account/tokens
export VERCEL_TOKEN="your_token_here"

# Установить переменную окружения
curl -X POST "https://api.vercel.com/v10/projects/prj_b8QAs8IR7cOlC6dCJjxNmmngaWVT/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "TELEGRAM_BOT_TOKEN",
    "value": "8285323424:AAFslafbTjNMZ0f4TYCRoKBHGbow809KV1g",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'
```

## Важно

⚠️ **TELEGRAM_BOT_TOKEN** - критически важная переменная для валидации Telegram WebApp initData. Без неё приложение не сможет авторизовать пользователей.

После добавления переменных окружения нужно **перезапустить деплой** на Vercel, чтобы изменения вступили в силу.

