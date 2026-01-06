#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

base = Path('/Users/kelemetovmuhamed/Documents/vpnwebsite')
old_dir = base / 'old'
outlivion_dir = base / 'outlivion-miniapp'

print('=' * 60)
print('РЕОРГАНИЗАЦИЯ ПРОЕКТА')
print('=' * 60)

# Шаг 1: Создаем папку old
print('\n1. Создаю папку old...')
old_dir.mkdir(exist_ok=True)
print(f'   ✅ Папка создана: {old_dir}')

# Шаг 2: Перемещаем старые файлы
print('\n2. Перемещаю старые файлы в old...')
exclude = {'outlivion-miniapp', 'old', '.git', 'node_modules', '.next', 'reorganize.sh', 'reorganize_final.py'}
moved_count = 0

for item in sorted(base.iterdir()):
    if item.name in exclude:
        print(f'   ⏭️  Пропущено: {item.name}')
        continue
    
    try:
        dest = old_dir / item.name
        if dest.exists():
            print(f'   ⚠️  Уже существует: {item.name}')
            continue
        
        shutil.move(str(item), str(dest))
        print(f'   ✅ Перемещено: {item.name}')
        moved_count += 1
    except Exception as e:
        print(f'   ❌ Ошибка при перемещении {item.name}: {e}')

print(f'\n   Всего перемещено: {moved_count} элементов')

# Шаг 3: Копируем содержимое outlivion-miniapp
print('\n3. Копирую содержимое outlivion-miniapp в корень...')
if not outlivion_dir.exists():
    print(f'   ❌ Папка {outlivion_dir} не найдена!')
    exit(1)

copied_count = 0
for item in sorted(outlivion_dir.iterdir()):
    if item.name.startswith('.'):
        continue
    
    try:
        dest = base / item.name
        # Удаляем существующий файл/папку если есть
        if dest.exists():
            if dest.is_dir():
                shutil.rmtree(str(dest))
            else:
                dest.unlink()
        
        # Копируем
        if item.is_dir():
            shutil.copytree(str(item), str(dest))
        else:
            shutil.copy2(str(item), str(dest))
        
        print(f'   ✅ Скопировано: {item.name}')
        copied_count += 1
    except Exception as e:
        print(f'   ❌ Ошибка при копировании {item.name}: {e}')

print(f'\n   Всего скопировано: {copied_count} элементов')

# Шаг 4: Удаляем outlivion-miniapp
print('\n4. Удаляю папку outlivion-miniapp...')
try:
    shutil.rmtree(str(outlivion_dir))
    print(f'   ✅ Папка удалена: {outlivion_dir}')
except Exception as e:
    print(f'   ❌ Ошибка при удалении: {e}')

# Проверка результата
print('\n' + '=' * 60)
print('ПРОВЕРКА РЕЗУЛЬТАТА')
print('=' * 60)

has_package = (base / 'package.json').exists()
has_app = (base / 'app').exists()
has_old = old_dir.exists()

print(f'\n✅ package.json в корне: {has_package}')
print(f'✅ Папка app в корне: {has_app}')
print(f'✅ Папка old создана: {has_old}')

if has_package:
    with open(base / 'package.json') as f:
        content = f.read()
        if 'outlivion-miniapp' in content:
            print('   ✅ Это новый проект (outlivion-miniapp)')
        else:
            print('   ⚠️  Это старый проект')

if has_old:
    old_items = list(old_dir.iterdir())
    print(f'\n📁 Элементов в папке old: {len(old_items)}')

print('\n' + '=' * 60)
print('ГОТОВО!')
print('=' * 60)

