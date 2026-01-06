#!/bin/bash
# Скрипт для реорганизации проекта
# Перемещает старый проект в папку old и делает outlivion-miniapp главным

set -e

cd "/Users/kelemetovmuhamed/Documents/vpnwebsite"

echo "=========================================="
echo "РЕОРГАНИЗАЦИЯ ПРОЕКТА"
echo "=========================================="

# 1. Создать папку old
echo ""
echo "1. Создаю папку old..."
mkdir -p old
echo "   ✓ Папка создана"

# 2. Переместить старые файлы
echo ""
echo "2. Перемещаю старые файлы в old..."

# Файлы
for file in App.tsx constants.tsx eslint.config.js favicon.svg index.css index.html index.tsx metadata.json playwright.config.ts prettier.config.cjs tailwind.config.cjs tsconfig.json types.ts vite.config.ts; do
    if [ -f "$file" ]; then
        mv "$file" old/ && echo "   ✓ $file" || echo "   ✗ $file (ошибка)"
    fi
done

# Папки
for dir in components context dist e2e fonts hooks pages public services test test-results utils vpnwebsite; do
    if [ -d "$dir" ]; then
        mv "$dir" old/ && echo "   ✓ $dir/" || echo "   ✗ $dir/ (ошибка)"
    fi
done

# Документация и скрипты
for file in *.md *.sh *.txt *.cjs 2>/dev/null; do
    if [ -f "$file" ] && [ "$file" != "DO_REORGANIZE.sh" ]; then
        mv "$file" old/ && echo "   ✓ $file" || echo "   ✗ $file (ошибка)"
    fi
done

# package.json
if [ -f "package.json" ]; then
    mv package.json package-lock.json old/ && echo "   ✓ package.json" || echo "   ✗ package.json (ошибка)"
fi

# 3. Копировать содержимое outlivion-miniapp
echo ""
echo "3. Копирую содержимое outlivion-miniapp в корень..."

if [ ! -d "outlivion-miniapp" ]; then
    echo "   ✗ Папка outlivion-miniapp не найдена!"
    exit 1
fi

cd outlivion-miniapp
for item in * .[!.]*; do
    if [ -e "$item" ] && [ "$item" != "." ] && [ "$item" != ".." ]; then
        if [ -d "$item" ]; then
            cp -r "$item" ../ && echo "   ✓ $item/" || echo "   ✗ $item/ (ошибка)"
        else
            cp "$item" ../ && echo "   ✓ $item" || echo "   ✗ $item (ошибка)"
        fi
    fi
done
cd ..

# 4. Удалить outlivion-miniapp
echo ""
echo "4. Удаляю папку outlivion-miniapp..."
rm -rf outlivion-miniapp
echo "   ✓ Папка удалена"

# 5. Удалить временные скрипты
echo ""
echo "5. Удаляю временные скрипты..."
rm -f reorganize.sh reorganize_final.py REORGANIZE_INSTRUCTIONS.md
echo "   ✓ Временные файлы удалены"

# Проверка
echo ""
echo "=========================================="
echo "ПРОВЕРКА РЕЗУЛЬТАТА"
echo "=========================================="

if [ -f "package.json" ]; then
    if grep -q "outlivion-miniapp" package.json; then
        echo "✓ package.json - новый проект"
    else
        echo "✗ package.json - старый проект"
    fi
else
    echo "✗ package.json не найден"
fi

if [ -d "app" ]; then
    echo "✓ Папка app найдена"
else
    echo "✗ Папка app не найдена"
fi

if [ -d "old" ]; then
    count=$(ls -1 old/ | wc -l)
    echo "✓ Папка old создана ($count элементов)"
else
    echo "✗ Папка old не создана"
fi

echo ""
echo "=========================================="
echo "ГОТОВО!"
echo "=========================================="

