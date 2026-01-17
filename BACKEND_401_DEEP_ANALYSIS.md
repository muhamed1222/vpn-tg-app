# 🔍 Глубокий анализ проблемы 401 Unauthorized

**Проблема:** Backend API возвращает 401 для `/v1/admin/contest/participants` даже с правильным ключом

---

## 🔍 Результаты тестирования

### Тест 1: `/v1/contest/active` (работает!)
```bash
curl "https://api.outlivion.space/v1/contest/active" \
  -H "x-admin-api-key: A246123b"
```

**Результат:** `{"error":"Not Found","message":"No active contest found"}`

**Вывод:** ✅ Авторизация работает! (иначе было бы 401)

### Тест 2: `/v1/admin/contest/participants` (не работает)
```bash
curl "https://api.outlivion.space/v1/admin/contest/participants?contest_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "x-admin-api-key: A246123b"
```

**Результат:** `{"error":"Unauthorized","message":"Authentication required"}`

**Вывод:** ❌ Авторизация не проходит

---

## 🔍 Анализ кода

### 1. `/v1/contest/active` использует только `verifyAuth`:
```typescript
fastify.get('/active', { preHandler: verifyAuth }, async (request, reply) => {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  // ...
});
```

### 2. `/v1/admin/contest/participants` использует `verifyAuth` + `verifyAdmin`:
```typescript
fastify.get('/contest/participants', {
  preHandler: [verifyAuth, verifyAdmin]
}, async (request, reply) => {
  // ...
});
```

### 3. `verifyAdmin` проверяет:
```typescript
function verifyAdmin(request: any, reply: any): void {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Проверяем через isAdmin флаг (для Admin API Key)
  if (request.user.isAdmin) {
    return;
  }

  // Проверяем через Telegram ID
  if (isAdminUser(request.user.tgId)) {
    return;
  }

  return reply.status(403).send({
    error: 'Forbidden',
    message: 'Admin access required'
  });
}
```

---

## 🔍 Проблема

`verifyAuth` устанавливает `request.user = { isAdmin: true, tgId: 0 }` при использовании `x-admin-api-key`.

Но `verifyAdmin` проверяет `request.user.isAdmin` - это должно работать!

**Возможные причины:**
1. `request.user` не устанавливается правильно
2. `request.user.isAdmin` не равен `true`
3. Порядок выполнения middleware неправильный

---

## ✅ Решение

### Вариант 1: Проверить логи Backend API

```bash
ssh root@72.56.93.135
journalctl -u outlivion-api -n 100 | grep -i "admin\|auth\|401"
```

### Вариант 2: Добавить логирование в Backend API

Добавить логирование в `verifyAuth` и `verifyAdmin` для отладки.

### Вариант 3: Проверить, что `adminApiKey` правильно передается

Убедиться, что `fastify.adminApiKey` содержит правильное значение.

---

## 🎯 Следующие шаги

1. **Проверить логи Backend API:**
   ```bash
   ssh root@72.56.93.135
   journalctl -u outlivion-api -n 100
   ```

2. **Проверить, что сервис перезапущен:**
   ```bash
   systemctl restart outlivion-api
   systemctl status outlivion-api
   ```

3. **Добавить временное логирование в Backend API** для отладки

---

**Статус:** Требуется проверка логов Backend API и возможное добавление логирования
