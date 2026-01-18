/**
 * Утилиты для валидации данных от API
 * Использует Zod для runtime-валидации
 */

import { z } from 'zod';
import { logError } from '@/lib/utils/logging';

/**
 * Валидирует данные по схеме Zod
 * @param schema - Схема валидации Zod
 * @param data - Данные для валидации
 * @param context - Контекст для логирования (endpoint, action)
 * @returns Валидированные данные
 * @throws ApiException если валидация не прошла
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: { endpoint?: string; action?: string }
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    // Логируем ошибку валидации
    if (error instanceof z.ZodError) {
      const errorMessage = `Валидация данных не прошла: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      
      logError('API data validation failed', error, {
        page: 'api',
        action: context?.action || 'validateData',
        endpoint: context?.endpoint,
        errors: error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });

      throw new Error(errorMessage);
    }

    // Если ошибка не Zod, логируем и пробрасываем дальше
    logError('Validation error (not Zod)', error, {
      page: 'api',
      action: context?.action || 'validateData',
      endpoint: context?.endpoint,
    });

    throw error;
  }
}

/**
 * Безопасная валидация данных (не выбрасывает исключение, возвращает null при ошибке)
 * @param schema - Схема валидации Zod
 * @param data - Данные для валидации
 * @param context - Контекст для логирования
 * @returns Валидированные данные или null при ошибке
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: { endpoint?: string; action?: string }
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError('API data validation failed (safe)', error, {
        page: 'api',
        action: context?.action || 'safeValidateData',
        endpoint: context?.endpoint,
        errors: error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });
    }
    return null;
  }
}
