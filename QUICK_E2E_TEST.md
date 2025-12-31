# Быстрый E2E тест

## Пошаговая инструкция

### 1. Откройте кабинет
```
https://my.outlivion.space
```

### 2. Перейдите на страницу оплаты
- Нажмите кнопку "Купить" или перейдите на `/pay`
- Выберите план (например, "test-10" на 10 рублей)
- Выберите "ЮKassa" как способ оплаты

### 3. Нажмите "Оплатить сейчас"

**Что проверить в DevTools (F12):**

**Console:**
- Не должно быть ошибок JavaScript

**Network:**
- Должен быть запрос: `POST https://api.outlivion.space/v1/orders/create`
- Ответ: `{ orderId: "...", paymentUrl: "..." }`

**Application → Local Storage:**
- Должен появиться ключ `lastOrderId` со значением (orderId)

**Ожидаемый результат:**
- Редирект на страницу YooKassa (URL вида `https://yoomoney.ru/checkout/...`)

---

### 4. Оплатите в YooKassa

- Выполните тестовый/реальный платеж
- После оплаты YooKassa вернет вас на return URL

**Ожидаемый результат:**
- Редирект на `https://my.outlivion.space/#/pay/return` (или `/pay/return`)

---

### 5. Страница возврата

**Что должно произойти:**

1. **Сразу после возврата:**
   - Заголовок: "Проверяем оплату..."
   - Индикатор загрузки (спиннер)
   - Текст: "Ожидаем подтверждение от платёжной системы..."

2. **В DevTools → Network:**
   - Каждые 2-3 секунды запрос: `GET https://api.outlivion.space/v1/orders/:orderId`
   - Первые запросы возвращают: `{ status: "pending" }`

3. **После обработки webhook (обычно 5-30 секунд):**
   - Запрос возвращает: `{ status: "paid", key: "DUMMY_KEY_..." }`
   - Страница автоматически обновляется

4. **Успешный результат:**
   - Заголовок: "Оплата подтверждена!"
   - Отображается VPN ключ
   - Кнопка "Скопировать" работает
   - В Local Storage `lastOrderId` удален

---

## Быстрая проверка в Console

Откройте DevTools → Console и выполните:

```javascript
// Проверить сохраненный orderId
localStorage.getItem('lastOrderId')

// Проверить текущий URL
window.location.href

// Симулировать проверку статуса (если знаете orderId)
fetch('https://api.outlivion.space/v1/orders/YOUR_ORDER_ID')
  .then(r => r.json())
  .then(console.log)
```

---

## Если что-то не работает

### Редирект не происходит
- Проверьте Console на ошибки
- Проверьте Network → запрос к `/v1/orders/create` должен быть успешным
- Проверьте, что `paymentUrl` получен в ответе

### Страница возврата не находит orderId
- Проверьте Local Storage → должен быть `lastOrderId`
- Проверьте URL → должен быть `/pay/return` или `/#/pay/return`
- Если используется HashRouter, URL будет с `#`

### Статус не меняется на paid
- Проверьте Network → запросы к `/v1/orders/:orderId` должны выполняться
- Проверьте логи на сервере: `journalctl -u outlivion-api -f`
- Убедитесь, что webhook настроен в ЛК YooKassa

---

## Успешный тест = все работает! ✅


