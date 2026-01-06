#!/bin/bash
# Финальный скрипт реорганизации проекта

cd "/Users/kelemetovmuhamed/Documents/vpnwebsite"

echo "=========================================="
echo "НАЧАЛО РЕОРГАНИЗАЦИИ"
echo "=========================================="
echo ""

# Создать old
echo "Шаг 1: Создаю папку old..."
mkdir -p old
echo "✓ Папка old создана"
echo ""

# Переместить все кроме outlivion-miniapp
echo "Шаг 2: Перемещаю старые файлы..."
EXCLUDE="outlivion-miniapp old .git node_modules .next DO_REORGANIZE.sh FINAL_REORGANIZE.sh reorganize.sh reorganize_final.py REORGANIZE_INSTRUCTIONS.md"

for item in * .[!.]*; do
    if [ -e "$item" ] && [[ ! " $EXCLUDE " =~ " $item " ]]; then
        echo "  Перемещаю: $item"
        mv "$item" old/ 2>/dev/null && echo "    ✓ Успешно" || echo "    ✗ Ошибка"
    fi
done
echo ""

# Скопировать outlivion-miniapp
echo "Шаг 3: Копирую содержимое outlivion-miniapp..."
if [ -d "outlivion-miniapp" ]; then
    cd outlivion-miniapp
    for item in * .[!.]*; do
        if [ -e "$item" ] && [ "$item" != "." ] && [ "$item" != ".." ]; then
            echo "  Копирую: $item"
            if [ -d "$item" ]; then
                cp -r "$item" ../ 2>/dev/null && echo "    ✓ Успешно" || echo "    ✗ Ошибка"
            else
                cp "$item" ../ 2>/dev/null && echo "    ✓ Успешно" || echo "    ✗ Ошибка"
            fi
        fi
    done
    cd ..
    echo ""
    echo "Шаг 4: Удаляю outlivion-miniapp..."
    rm -rf outlivion-miniapp
    echo "✓ Папка удалена"
else
    echo "✗ Папка outlivion-miniapp не найдена!"
fi
echo ""

# Проверка
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

[ -d "app" ] && echo "✓ Папка app найдена" || echo "✗ Папка app не найдена"
[ -d "old" ] && echo "✓ Папка old найдена" || echo "✗ Папка old не найдена"

echo ""
echo "=========================================="
echo "ГОТОВО!"
echo "=========================================="

