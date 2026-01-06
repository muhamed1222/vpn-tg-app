# 🔧 Исправление интеграции между проектами

## Проблема

1. **vpn_api** использует cookie-based auth (JWT в cookie)
2. **vpnwebsite** отправляет initData в Authorization header
3. Несоответствие роутов:
   - vpnwebsite: `/api/me` → должен быть `/v1/auth/telegram` или `/v1/auth/me`
   - vpnwebsite: `/api/tariffs` → такого роута нет в vpn_api
   - vpnwebsite: `/api/billing` → такого роута нет в vpn_api

## Решение

### Вариант 1: Добавить поддержку initData в Authorization header в vpn_api (рекомендуется)

Нужно модифицировать `verifyAuth.ts` чтобы он поддерживал оба способа:
- Cookie-based (для vpn_bot)
- initData в Authorization header (для vpnwebsite)

### Вариант 2: Изменить vpnwebsite для использования cookie-based auth

vpnwebsite должен:
1. Сначала вызвать `/v1/auth/telegram` с initData в body
2. Получить cookie
3. Использовать cookie для последующих запросов

## Текущее состояние роутов

### vpn_api имеет:
- ✅ `/v1/auth/telegram` - POST, принимает initData в body
- ✅ `/v1/auth/me` - GET, требует cookie
- ✅ `/v1/user/config` - GET, требует cookie
- ✅ `/v1/user/status` - GET, требует cookie
- ❌ `/v1/tariffs` - НЕТ
- ❌ `/v1/user/billing` - НЕТ

### vpnwebsite пытается обращаться к:
- `/api/me` → должен быть `/v1/auth/telegram` или `/v1/auth/me`
- `/api/tariffs` → нужно добавить в vpn_api
- `/api/billing` → нужно добавить в vpn_api
- `/api/user/config` → `/v1/user/config` ✅
- `/api/user/status` → `/v1/user/status` ✅

## План исправления

1. Добавить поддержку initData в Authorization header в vpn_api
2. Добавить роут `/v1/tariffs` в vpn_api
3. Добавить роут `/v1/user/billing` в vpn_api
4. Исправить роуты в vpnwebsite для правильного обращения к vpn_api

