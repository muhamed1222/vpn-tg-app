# 🔗 План интеграции проектов

## Текущая проблема

**vpn_api** использует cookie-based auth (JWT в cookie), но **vpnwebsite** отправляет initData в Authorization header.

## Решение

### Шаг 1: Модифицировать vpn_api для поддержки initData в Authorization header

Нужно обновить `/Users/kelemetovmuhamed/Documents/vpn_api/src/auth/verifyAuth.ts`:

```typescript
// Добавить поддержку initData в Authorization header
export function createVerifyAuth(options: VerifyAuthOptions & { botToken?: string }) {
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

### Шаг 2: Добавить недостающие роуты в vpn_api

#### 2.1. Добавить `/v1/tariffs` в `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/index.ts`:

```typescript
// Добавить в v1Routes
await fastify.register(tariffsRoutes, { prefix: '/tariffs' });
```

#### 2.2. Создать `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/tariffs.ts`:

```typescript
import { FastifyInstance } from 'fastify';
import { PLAN_PRICES } from '../../config/plans.js';

export async function tariffsRoutes(fastify: FastifyInstance) {
  fastify.get('/tariffs', async (request, reply) => {
    // Преобразуем PLAN_PRICES в формат для фронтенда
    const tariffs = Object.entries(PLAN_PRICES).map(([id, price]) => {
      // Извлекаем дни из planId (plan_7 = 7 дней, plan_30 = 30 дней и т.д.)
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

#### 2.3. Добавить `/v1/user/billing` в `/Users/kelemetovmuhamed/Documents/vpn_api/src/routes/v1/user.ts`:

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
  
  // Вычисляем средний трафик в день
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
    planId: null, // Можно добавить позже
    planName: null,
    period: {
      start: null, // Можно добавить позже
      end: expire ? expire * 1000 : null, // Конвертируем в миллисекунды
    },
  });
});
```

### Шаг 3: Исправить роуты в vpnwebsite

#### 3.1. Исправить `/app/api/me/route.ts`:

```typescript
// Изменить URL с /api/me на /v1/auth/telegram
const backendResponse = await fetch(`${BACKEND_API_URL}/v1/auth/telegram`, {
  method: 'POST',
  headers: {
    'Authorization': initData,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ initData }),
});
```

Или лучше создать отдельный роут `/app/api/auth/telegram/route.ts` для авторизации, а `/app/api/me/route.ts` использовать для получения данных после авторизации.

#### 3.2. Исправить `/app/api/tariffs/route.ts`:

```typescript
// Изменить URL на /v1/tariffs
const backendResponse = await fetch(`${BACKEND_API_URL}/v1/tariffs`, {
  method: 'GET',
  headers: {
    'Authorization': initData,
    'Content-Type': 'application/json',
  },
});
```

#### 3.3. Исправить `/app/api/billing/route.ts`:

```typescript
// Изменить URL на /v1/user/billing
const backendResponse = await fetch(`${BACKEND_API_URL}/v1/user/billing`, {
  method: 'GET',
  headers: {
    'Authorization': initData,
    'Content-Type': 'application/json',
  },
});
```

#### 3.4. Исправить `/app/api/user/config/route.ts` и `/app/api/user/status/route.ts`:

```typescript
// Изменить URL на /v1/user/config и /v1/user/status
const backendResponse = await fetch(`${BACKEND_API_URL}/v1/user/config`, {
  method: 'GET',
  headers: {
    'Authorization': initData,
    'Content-Type': 'application/json',
  },
});
```

## Текущее состояние

### vpn_api роуты:
- ✅ `/v1/auth/telegram` - POST, принимает initData в body
- ✅ `/v1/auth/me` - GET, требует cookie
- ✅ `/v1/user/config` - GET, требует cookie
- ✅ `/v1/user/status` - GET, требует cookie
- ❌ `/v1/tariffs` - НЕТ (нужно добавить)
- ❌ `/v1/user/billing` - НЕТ (нужно добавить)

### vpnwebsite роуты:
- `/api/me` → должен обращаться к `/v1/auth/telegram` или `/v1/auth/me`
- `/api/tariffs` → должен обращаться к `/v1/tariffs`
- `/api/billing` → должен обращаться к `/v1/user/billing`
- `/api/user/config` → должен обращаться к `/v1/user/config` ✅
- `/api/user/status` → должен обращаться к `/v1/user/status` ✅

## Приоритет исправлений

1. **Критично:** Модифицировать verifyAuth в vpn_api для поддержки initData
2. **Важно:** Добавить роуты `/v1/tariffs` и `/v1/user/billing` в vpn_api
3. **Важно:** Исправить URL в роутах vpnwebsite

