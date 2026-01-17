# Исправление: Транзакции не отображаются в мини-приложении

**Дата:** 17 января 2025  
**Проблема:** Транзакции не отображались в мини-приложении  
**Статус:** ✅ Исправлено

## Проблема

Пользователи не видели свои транзакции в мини-приложении, хотя заказы были созданы и оплачены.

## Причина

Система использует две отдельные базы данных:
1. **База API** (`/opt/outlivion-api/data/db.sqlite`) — хранит заказы, созданные через мини-приложение
2. **База бота** (`/root/vpn_bot/data/database.sqlite`) — хранит заказы, созданные через Telegram бота

Эндпоинт `/v1/payments/history` читал заказы **только из базы API**, поэтому заказы, созданные через бота, не отображались.

## Решение

Модифицирован эндпоинт `/v1/payments/history` в файле `vpn_api/src/routes/v1/payments.ts`:

### Изменения:

1. **Чтение из обеих баз:**
   - Читает заказы из базы API (как раньше)
   - Дополнительно читает заказы из базы бота через `ATTACH DATABASE`

2. **Объединение данных:**
   - Объединяет заказы из обеих баз
   - Удаляет дубликаты (по `order_id`)
   - Оставляет последнюю версию заказа при дублировании

3. **Нормализация статусов:**
   - Преобразует статусы из базы бота (`COMPLETED` → `completed`)
   - Унифицирует формат данных

### Код изменений:

```typescript
// Получаем заказы из базы API
const apiOrders = ordersRepo.getOrdersByUser(userRef);

// Получаем заказы из базы бота
const botDbPath = process.env.BOT_DATABASE_PATH || '/root/vpn_bot/data/database.sqlite';
if (fs.existsSync(botDbPath)) {
  // ATTACH базу бота и читаем заказы
  db.prepare('ATTACH DATABASE ? AS bot_db').run(botDbPath);
  const botOrdersRows = db.prepare(`
    SELECT id, plan_id, status, amount, currency, created_at
    FROM bot_db.orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC
    LIMIT 50
  `).all(tgId);
  // ...
}

// Объединяем и удаляем дубликаты
const uniqueOrders = new Map();
// ...
```

## Файлы изменены

- `vpn_api/src/routes/v1/payments.ts` — добавлено чтение из базы бота

## Деплой

✅ Изменения задеплоены на сервер:
- Файл скопирован на сервер
- TypeScript компиляция прошла успешно
- Сервис `outlivion-api` перезапущен

## Результат

Теперь транзакции отображаются в мини-приложении **независимо от того, где был создан заказ:**
- ✅ Заказы из мини-приложения — отображаются
- ✅ Заказы из Telegram бота — отображаются
- ✅ Дубликаты автоматически удаляются
- ✅ Правильная сортировка по дате

## Проверка

Для проверки можно использовать:
```bash
# Проверить заказы в базе бота
sqlite3 /root/vpn_bot/data/database.sqlite \
  "SELECT id, status, user_id, plan_id FROM orders WHERE user_id = 782245481 LIMIT 5;"

# Проверить заказы в базе API
sqlite3 /opt/outlivion-api/data/db.sqlite \
  "SELECT order_id, status, user_ref, plan_id FROM orders WHERE user_ref = 'tg_782245481' LIMIT 5;"
```

## Примечания

- Если база бота недоступна, эндпоинт продолжает работать с данными из базы API
- Ошибки чтения базы бота логируются, но не прерывают работу эндпоинта
- Лимит заказов из базы бота: 50 (как и из базы API)
