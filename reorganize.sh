#!/bin/bash
set -e

cd "/Users/kelemetovmuhamed/Documents/vpnwebsite"

echo "📦 Создаю папку old..."
mkdir -p old

echo "📋 Перемещаю старые файлы в old..."
# Перемещаем файлы
for file in App.tsx constants.tsx eslint.config.js favicon.svg index.css index.html index.tsx metadata.json playwright.config.ts prettier.config.cjs tailwind.config.cjs tsconfig.json types.ts vite.config.ts; do
    if [ -f "$file" ]; then
        mv "$file" old/ 2>/dev/null && echo "  ✅ $file" || echo "  ⚠️  $file (уже перемещен)"
    fi
done

# Перемещаем папки
for dir in components context dist e2e fonts hooks pages public services test test-results utils vpnwebsite; do
    if [ -d "$dir" ] && [ "$dir" != "old" ] && [ "$dir" != "outlivion-miniapp" ]; then
        mv "$dir" old/ 2>/dev/null && echo "  ✅ $dir/" || echo "  ⚠️  $dir/ (уже перемещена)"
    fi
done

# Перемещаем markdown файлы и скрипты
for file in *.md *.sh *.txt *.cjs 2>/dev/null; do
    if [ -f "$file" ] && [ "$file" != "reorganize.sh" ]; then
        mv "$file" old/ 2>/dev/null && echo "  ✅ $file" || echo "  ⚠️  $file (уже перемещен)"
    fi
done

# Перемещаем package файлы если они еще не перемещены
if [ -f "package.json" ] && [ ! -f "old/package.json" ]; then
    mv package.json package-lock.json old/ 2>/dev/null && echo "  ✅ package.json" || true
fi

echo ""
echo "📋 Копирую содержимое outlivion-miniapp в корень..."
if [ -d "outlivion-miniapp" ]; then
    # Копируем все файлы и папки из outlivion-miniapp в корень
    cd outlivion-miniapp
    for item in * .[!.]*; do
        if [ -e "$item" ] && [ "$item" != "." ] && [ "$item" != ".." ]; then
            if [ -d "$item" ]; then
                cp -r "$item" ../ 2>/dev/null && echo "  ✅ $item/" || echo "  ⚠️  $item/ (конфликт)"
            else
                cp "$item" ../ 2>/dev/null && echo "  ✅ $item" || echo "  ⚠️  $item (конфликт)"
            fi
        fi
    done
    cd ..
    
    echo ""
    echo "🗑️  Удаляю папку outlivion-miniapp..."
    rm -rf outlivion-miniapp
    echo "  ✅ Удалено"
fi

echo ""
echo "✅ Реорганизация завершена!"
echo ""
echo "Проверка структуры:"
if [ -f "package.json" ] && [ -d "app" ]; then
    echo "  ✅ Новый проект в корне"
else
    echo "  ❌ Ошибка: проверьте структуру"
fi

if [ -d "old" ]; then
    echo "  ✅ Старый проект в папке old"
    echo "  📁 Элементов в old: $(ls -1 old/ | wc -l)"
fi

