# 🔧 Исправление 401 Unauthorized от Backend API

**Проблема:** Backend API возвращает 401 даже с правильным `x-admin-api-key: A246123b`

---

## 🔍 Диагностика

### Логи показывают:
```json
{
  "status": 401,
  "error": { "error": "Unauthorized", "message": "Authentication required" },
  "hasAdminSession": true,
  "hasAdminApiKey": true,
  "contestId": "contest-20260117"
}
```

### Проблемы:
1. ✅ `hasAdminApiKey: true` - ключ есть на Frontend
2. ❌ Backend API все равно возвращает 401
3. ⚠️ Используется старый ID конкурса `contest-20260117`

---

## 🔍 Проверка Backend API

### Тест 1: Проверка активного конкурса
```bash
curl "https://api.outlivion.space/v1/contest/active" \
  -H "x-admin-api-key: A246123b"
```

**Результат:** `{"error":"Not Found","message":"No active contest found"}`

### Тест 2: Проверка участников конкурса
```bash
curl "https://api.outlivion.space/v1/admin/contest/participants?contest_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "x-admin-api-key: A246123b"
```

**Результат:** `{"error":"Unauthorized","message":"Authentication required"}`

---

## 🔍 Причина проблемы

Backend API в `admin.ts` использует:
```typescript
const adminApiKey = process.env.ADMIN_API_KEY || '';
```

Но на Backend сервере переменная называется `ADMIN_API_KEY=A246123b` (мы проверили ранее).

**Проблема:** Возможно, Backend API не получает правильный `ADMIN_API_KEY` из переменных окружения, или проверка не работает.

---

## ✅ Решение

### Шаг 1: Проверить переменные окружения на Backend

```bash
ssh root@72.56.93.135
cat /opt/outlivion-api/.env | grep ADMIN_API_KEY
```

**Ожидаемый результат:**
```
ADMIN_API_KEY=A246123b
```

### Шаг 2: Проверить, что сервис перезапущен

```bash
systemctl restart outlivion-api
systemctl status outlivion-api
```

### Шаг 3: Проверить логи Backend API

```bash
journalctl -u outlivion-api -n 50 | grep -i "admin\|api\|key"
```

---

## ⚠️ Дополнительная проблема: Старый ID конкурса

В логах видно `contestId: 'contest-20260117'` - это старый деактивированный конкурс.

**Причина:** Возможно, Frontend кеширует старый ответ от `/api/contest/active`.

**Решение:** 
1. Очистить кеш браузера
2. Проверить, что Backend API возвращает правильный конкурс

---

## 🎯 Следующие шаги

1. **Проверить переменные окружения на Backend:**
   ```bash
   ssh root@72.56.93.135
   cat /opt/outlivion-api/.env | grep ADMIN_API_KEY
   ```

2. **Перезапустить Backend API:**
   ```bash
   systemctl restart outlivion-api
   ```

3. **Проверить логи Backend API:**
   ```bash
   journalctl -u outlivion-api -n 50
   ```

4. **Проверить, что Backend API принимает ключ:**
   ```bash
   curl "https://api.outlivion.space/v1/admin/contest/participants?contest_id=550e8400-e29b-41d4-a716-446655440000" \
     -H "x-admin-api-key: A246123b"
   ```

---

**Статус:** Требуется проверка Backend API переменных окружения и перезапуск сервиса
