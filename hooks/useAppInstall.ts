'use client';

import { useState, useCallback } from 'react';
import { config } from '@/lib/config';
import { APP_STORE_URLS } from '@/lib/constants';
import { handleExternalLink, handleDeepLinkError } from '@/lib/utils/setupHelpers';
import { analytics } from '@/lib/analytics';
import { logError } from '@/lib/utils/logging';

export interface UseAppInstallReturn {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  confirmInstallation: (platform: string) => void;
}

/**
 * Хук для управления модальным окном установки приложения
 */
export function useAppInstall(): UseAppInstallReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    analytics.event('setup_install', { step: 2 });
    try {
      setIsModalOpen(true);
    } catch (error) {
      logError('Failed to open install modal', error, {
        page: 'setup',
        action: 'openModal'
      });
      analytics.event('setup_error', {
        step: 2,
        action: 'openModal',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const confirmInstallation = useCallback((platform: string) => {
    let url = config.support.helpBaseUrl; // Fallback

    if (platform === 'iOS') {
      url = APP_STORE_URLS.iOS;
    } else if (platform === 'Android') {
      url = APP_STORE_URLS.Android;
    } else if (platform === 'macOS') {
      url = APP_STORE_URLS.macOS;
    } else if (platform === 'Desktop') {
      url = APP_STORE_URLS.Desktop;
    }

    try {
      handleExternalLink(url);
      analytics.event('setup_app_store_opened', { step: 2, platform, url });
    } catch (error) {
      handleDeepLinkError(url, error, 'confirmInstallation');
    }
    setIsModalOpen(false);
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    confirmInstallation
  };
}
