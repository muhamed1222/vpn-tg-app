'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, isServiceWorkerSupported } from '@/lib/utils/service-worker';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      console.log('[Service Worker] Not supported');
      return;
    }

    // Регистрируем Service Worker только в production или если явно включено
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true') {
      registerServiceWorker()
        .then((registration) => {
          if (registration) {
            setIsRegistered(true);
            console.log('[Service Worker] Registered');
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Registration error:', error);
        });
    }
  }, []);

  return <>{children}</>;
}
