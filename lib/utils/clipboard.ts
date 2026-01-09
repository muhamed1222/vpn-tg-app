/**
 * Утилиты для работы с буфером обмена
 */

/**
 * Копирует текст в буфер обмена с проверкой доступности API
 * 
 * @param text - Текст для копирования
 * @returns Promise, который разрешается с true при успехе или false при ошибке
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Проверяем доступность Clipboard API
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    // Fallback для старых браузеров
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('Failed to copy using fallback method:', error);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Проверяет доступность Clipboard API
 * 
 * @returns true если API доступен, иначе false
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
