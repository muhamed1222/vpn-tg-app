# Инструкция по реорганизации проекта

## Что нужно сделать:

1. **Создать папку `old`** для старого проекта
2. **Переместить все старые файлы** в `old` (кроме `outlivion-miniapp`)
3. **Скопировать содержимое `outlivion-miniapp`** в корень
4. **Удалить папку `outlivion-miniapp`**

## Команды для выполнения:

```bash
cd /Users/kelemetovmuhamed/Documents/vpnwebsite

# 1. Создать папку old
mkdir -p old

# 2. Переместить старые файлы и папки в old
mv App.tsx components constants.tsx context dist e2e fonts hooks index.css index.html index.tsx pages public services test utils vite.config.ts tsconfig.json types.ts eslint.config.js favicon.svg metadata.json playwright.config.ts prettier.config.cjs tailwind.config.cjs vpnwebsite old/

# 3. Переместить документацию и скрипты
mv *.md *.sh *.txt *.cjs old/ 2>/dev/null

# 4. Переместить package.json
mv package.json package-lock.json old/

# 5. Скопировать содержимое outlivion-miniapp в корень
cp -r outlivion-miniapp/* .
cp outlivion-miniapp/.eslintrc* . 2>/dev/null

# 6. Удалить папку outlivion-miniapp
rm -rf outlivion-miniapp

# 7. Удалить временные скрипты
rm -f reorganize.sh reorganize_final.py REORGANIZE_INSTRUCTIONS.md
```

## Проверка результата:

После выполнения команд проверьте:

```bash
# Должен быть новый package.json с "outlivion-miniapp"
cat package.json | grep "outlivion-miniapp"

# Должна быть папка app
ls -d app

# Должна быть папка old со старыми файлами
ls old/
```

## Итоговая структура:

```
vpnwebsite/
├── app/                    # Новый проект (Next.js)
├── components/             # Новый проект
├── lib/                    # Новый проект
├── store/                  # Новый проект
├── package.json            # Новый проект
├── next.config.ts          # Новый проект
└── old/                    # Старый проект
    ├── App.tsx
    ├── components/
    ├── pages/
    ├── package.json
    └── ...
```

