/**
 * Утилиты для работы с Service Worker
 * Регистрация, обновление и управление Service Worker
 */

export interface ServiceWorkerInfo {
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
}

/**
 * Проверяет, поддерживается ли Service Worker
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Регистрирует Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn('[Service Worker] Not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[Service Worker] Registered successfully:', registration.scope);

    // Обработка обновлений
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Новый Service Worker готов, но старый еще активен
            console.log('[Service Worker] New version available');
            // Можно показать уведомление пользователю
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[Service Worker] Registration failed:', error);
    return null;
  }
}

/**
 * Отменяет регистрацию Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log('[Service Worker] Unregistered:', unregistered);
    return unregistered;
  } catch (error) {
    console.error('[Service Worker] Unregistration failed:', error);
    return false;
  }
}

/**
 * Проверяет наличие обновлений Service Worker
 */
export async function checkForServiceWorkerUpdate(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('[Service Worker] Update check failed:', error);
    return false;
  }
}

/**
 * Принудительно активирует новый Service Worker
 */
export async function activateServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.waiting) {
      // Отправляем сообщение новому Service Worker для активации
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Service Worker] Activation failed:', error);
    return false;
  }
}

/**
 * Получает информацию о текущем Service Worker
 */
export async function getServiceWorkerInfo(): Promise<ServiceWorkerInfo | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    return {
      registration,
      updateAvailable: !!registration.waiting,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      active: !!registration.active,
    };
  } catch (error) {
    console.error('[Service Worker] Get info failed:', error);
    return null;
  }
}

/**
 * Кэширует указанные URL
 */
export async function cacheUrls(urls: string[]): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Service Worker] Cache URLs failed:', error);
    return false;
  }
}
