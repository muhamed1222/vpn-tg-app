'use client';

import { useEffect } from 'react';

/**
 * Компонент для фильтрации предупреждений Next.js о params Promise
 * В Next.js 16 params является Promise и должен быть развернут через React.use()
 * Это предупреждение появляется, когда Next.js пытается сериализовать props для отладки
 */
export function ConsoleErrorFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Сохраняем оригинальный console.error
    const originalError = console.error;

    // Переопределяем console.error для фильтрации предупреждений о params
    console.error = (...args: unknown[]) => {
      // Проверяем, является ли это предупреждением о params Promise
      const firstArg = args[0];
      const message = typeof firstArg === 'string' 
        ? firstArg 
        : firstArg instanceof Error 
          ? firstArg.message 
          : String(firstArg);

      if (
        message.includes('params are being enumerated') ||
        message.includes('params is a Promise') ||
        message.includes('searchParams') && message.includes('Promise') ||
        message.includes('must be unwrapped with React.use()') ||
        message.includes('The keys of') && message.includes('were accessed directly')
      ) {
        // Игнорируем это предупреждение Next.js
        return;
      }

      // Вызываем оригинальный console.error для всех остальных ошибок
      originalError.apply(console, args);
    };

    // Восстанавливаем оригинальный console.error при размонтировании
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
