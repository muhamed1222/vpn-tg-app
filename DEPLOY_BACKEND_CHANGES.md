# 📤 Развертывание изменений Backend API

**Измененные файлы:**
- `vpn_api/src/routes/v1/admin.ts` - добавлено логирование для отладки 401 ошибки

---

## ✅ Способ 1: Через Git (рекомендуется)

Если Backend API находится в Git репозитории:

### 1. Закоммитить изменения:
```bash
cd /Users/kelemetovmuhamed/Documents/Outlivion\ baza/vpn_api
git add src/routes/v1/admin.ts
git commit -m "Add: логирование для отладки 401 ошибки в admin routes"
git push
```

### 2. На сервере - обновить и пересобрать:
```bash
ssh root@72.56.93.135
cd /opt/outlivion-api
git pull
npm run build
systemctl restart outlivion-api
systemctl status outlivion-api
```

---

## ✅ Способ 2: Через SCP (если нет Git)

### 1. Отправить файл на сервер:
```bash
scp /Users/kelemetovmuhamed/Documents/Outlivion\ baza/vpn_api/src/routes/v1/admin.ts \
  root@72.56.93.135:/opt/outlivion-api/src/routes/v1/admin.ts
```

### 2. На сервере - пересобрать и перезапустить:
```bash
ssh root@72.56.93.135
cd /opt/outlivion-api
npm run build
systemctl restart outlivion-api
systemctl status outlivion-api
```

---

## ✅ Способ 3: Через SSH и редактирование (если нужно быстро)

### 1. Подключиться к серверу:
```bash
ssh root@72.56.93.135
cd /opt/outlivion-api
```

### 2. Отредактировать файл:
```bash
nano src/routes/v1/admin.ts
```

Или скопировать содержимое измененного файла.

### 3. Пересобрать и перезапустить:
```bash
npm run build
systemctl restart outlivion-api
systemctl status outlivion-api
```

---

## 🔍 Проверка после развертывания

### 1. Проверить логи при старте:
```bash
journalctl -u outlivion-api -n 50 | grep -i "admin\|registered"
```

**Ожидаемый результат:**
```
[Admin] Admin routes registered { hasAdminApiKey: true, adminApiKeyLength: 9, adminApiKeyPreview: 'A24...' }
```

### 2. Сделать тестовый запрос:
```bash
curl "https://api.outlivion.space/v1/admin/contest/participants?contest_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "x-admin-api-key: A246123b"
```

### 3. Проверить логи запроса:
```bash
journalctl -u outlivion-api -n 20 | grep -i "admin\|verify"
```

**Ожидаемые логи:**
- `[Admin] verifyAdmin check` - с информацией о `request.user`
- `[Admin] Access granted via isAdmin flag` - если авторизация прошла
- `[Admin] No user in request` - если `request.user` не установлен

---

## ⚠️ Важно

1. **Всегда пересобирайте** после изменения TypeScript файлов:
   ```bash
   npm run build
   ```

2. **Всегда перезапускайте** сервис после пересборки:
   ```bash
   systemctl restart outlivion-api
   ```

3. **Проверяйте статус** сервиса:
   ```bash
   systemctl status outlivion-api
   ```

---

## 🎯 Что изменилось

В файле `admin.ts` добавлено:
- Логирование при регистрации роутов (проверка `adminApiKey`)
- Логирование в `verifyAdmin` (проверка `request.user`, `isAdmin`, заголовки)
- Это поможет понять, почему возникает 401 ошибка

---

**Статус:** Требуется отправка файла на сервер и пересборка
