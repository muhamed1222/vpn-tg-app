# 🔧 Требуемые исправления для интеграции проектов

## ✅ Что уже исправлено в vpnwebsite

1. ✅ Роуты обновлены для обращения к правильным эндпоинтам vpn_api:
   - `/api/me` → `/v1/auth/telegram` + `/v1/auth/me`
   - `/api/user/config` → `/v1/user/config`
   - `/api/user/status` → `/v1/user/status`
   - `/api/billing` → `/v1/user/billing`
   - `/api/tariffs` → `/v1/tariffs`

2. ✅ Добавлена авторизация через `/v1/auth/telegram` для получения cookie

## ⚠️ Проблема: Cookie не работают между доменами

Текущее решение пытается передавать cookie через заголовок, но это не работает между разными доменами (Vercel и api.outlivion.space).

## 🔧 Что нужно исправить в vpn_api

### 1. Добавить поддержку initData в Authorization header

**Файл:** `/Users/kelemetovmuhamed/Documents/vpn_api/src/auth/verifyAuth.ts`

Нужно модифицировать `createVerifyAuth` чтобы он поддерживал оба способа авторизации:

```typescript
export interface VerifyAuthOptions {
  jwtSecret: string;
  cookieName: string;
  botToken?: string; // Добавить botToken
}

export function createVerifyAuth(options: VerifyAuthOptions) {
  const { jwtSecret, cookieName, botToken } = options;

  return async function verifyAuth(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Вариант 1: Cookie-based auth (для vpn_bot)
    const token = request.cookies[cookieName];
    if (token) {
      const payload = verifyToken({ token, secret: jwtSecret });
      if (payload) {
        request.user = {
          tgId: payload.tgId,
          username: payload.username,
          firstName: payload.firstName,
        };
        return;
      }
    }

    // Вариант 2: initData в Authorization header (для vpnwebsite)
    const initData = request.headers.authorization;
    if (initData && botToken) {
      const { verifyTelegramInitData } = await import('./telegram.js');
      const verifyResult = verifyTelegramInitData({
        initData,
        botToken,
      });
      
      if (verifyResult.valid && verifyResult.user) {
        request.user = {
          tgId: verifyResult.user.id,
          username: verifyResult.user.username,
          firstName: verifyResult.user.first_name,
        };
        return;
      }
    }

    // Если ни один способ не сработал
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  };
}
```

**И обновить вызовы в роутах:**

```typescript
const verifyAuth = createVerifyAuth({
  jwtSecret,
  cookieName,
  botToken: fastify.telegramBotToken, // Добавить botToken
});
```

### 2. Добавить роут `/v1/tariffs`

**Файл:** `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/tariffs.ts` (создать новый)

```typescript
import { FastifyInstance } from 'fastify';
import { PLAN_PRICES } from '../../config/plans.js';

export async function tariffsRoutes(fastify: FastifyInstance) {
  fastify.get('/tariffs', async (request, reply) => {
    // Преобразуем PLAN_PRICES в формат для фронтенда
    const tariffs = Object.entries(PLAN_PRICES).map(([id, price]) => {
      const days = parseInt(id.replace('plan_', ''), 10);
      const priceStars = Math.round(parseFloat(price.value) * 10); // Конвертируем в stars
      
      return {
        id,
        name: `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`,
        days,
        price_stars: priceStars,
      };
    });
    
    return reply.send(tariffs);
  });
}
```

**И зарегистрировать в `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/index.ts`:**

```typescript
import { tariffsRoutes } from './tariffs.js';

export async function v1Routes(fastify: FastifyInstance) {
  // ... существующий код ...
  
  // Добавить регистрацию tariffs routes
  await fastify.register(tariffsRoutes, { prefix: '/tariffs' });
}
```

### 3. Добавить роут `/v1/user/billing`

**Файл:** `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/user.ts`

Добавить в функцию `userRoutes`:

```typescript
/**
 * GET /v1/user/billing
 * Статистика использования трафика
 */
fastify.get('/billing', { preHandler: verifyAuth }, async (request, reply) => {
  if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });
  
  const status = await marzbanService.getUserStatus(request.user.tgId);
  
  if (!status) {
    return reply.send({
      usedBytes: 0,
      limitBytes: null,
      averagePerDayBytes: 0,
      planId: null,
      planName: null,
      period: { start: null, end: null },
    });
  }
  
  const usedBytes = status.used_traffic || 0;
  const dataLimit = status.data_limit || null;
  const expire = status.expire || null;
  const now = Math.floor(Date.now() / 1000);
  
  let averagePerDayBytes = 0;
  if (expire && expire > now) {
    const daysActive = Math.ceil((expire - now) / 86400);
    if (daysActive > 0) {
      averagePerDayBytes = Math.floor(usedBytes / daysActive);
    }
  }
  
  return reply.send({
    usedBytes,
    limitBytes: dataLimit,
    averagePerDayBytes,
    planId: null,
    planName: null,
    period: {
      start: null,
      end: expire ? expire * 1000 : null, // Конвертируем в миллисекунды
    },
  });
});
```

### 4. Обновить роут `/v1/auth/me` для возврата данных с подпиской

**Файл:** `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/auth.ts`

Изменить роут `/v1/auth/me` чтобы он возвращал данные пользователя с подпиской:

```typescript
fastify.get(
  '/me',
  {
    preHandler: verifyAuth,
  },
  async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    const marzbanService = fastify.marzbanService;
    const status = await marzbanService.getUserStatus(request.user.tgId);
    const config = await marzbanService.getUserConfig(request.user.tgId);
    
    const now = Math.floor(Date.now() / 1000);
    const isActive = status && status.status === 'active' && 
                     status.expire && status.expire > now;
    
    return reply.send({
      id: request.user.tgId,
      firstName: request.user.firstName || '',
      subscription: {
        is_active: isActive,
        expires_at: status?.expire ? status.expire * 1000 : null, // Конвертируем в миллисекунды
        vless_key: config || undefined,
      },
    });
  }
);
```

## 📋 Чеклист исправлений

### В vpn_api:

- [ ] Модифицировать `verifyAuth.ts` для поддержки initData в Authorization header
- [ ] Обновить все вызовы `createVerifyAuth` с добавлением `botToken`
- [ ] Создать роут `/v1/tariffs`
- [ ] Добавить роут `/v1/user/billing`
- [ ] Обновить роут `/v1/auth/me` для возврата данных с подпиской

### В vpnwebsite (уже сделано):

- [x] Исправить `/app/api/me/route.ts`
- [x] Исправить `/app/api/user/config/route.ts`
- [x] Исправить `/app/api/user/status/route.ts`
- [x] Исправить `/app/api/billing/route.ts`
- [x] Исправить `/app/api/tariffs/route.ts`

## ⚠️ Временное решение

Пока vpn_api не поддерживает initData в Authorization header, можно использовать временное решение:

1. vpnwebsite делает POST на `/v1/auth/telegram` с initData в body
2. Получает cookie из ответа
3. Использует cookie для последующих запросов

**Но это не работает между разными доменами!**

Поэтому **критично** добавить поддержку initData в Authorization header в vpn_api.

## 🎯 После исправлений

После того как все исправления будут внесены в vpn_api, нужно будет обновить роуты в vpnwebsite, чтобы они напрямую использовали initData в Authorization header без промежуточной авторизации через cookie.

