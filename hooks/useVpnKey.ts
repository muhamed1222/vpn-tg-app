import { useCallback, useEffect, useRef, useState } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { isTelegramWebApp } from '../utils/telegram';

const FALLBACK_VPN_KEY =
  'vless://outlivion-mock-key-12345@nodes.space:443?security=reality&sni=google.com&fp=chrome&pbk=xyz#Outlivion-Node';

export const useVpnKey = () => {
  const { subscription } = useAuth();
  const [vpnKey, setVpnKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadVpnKey = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    if (!isTelegramWebApp()) {
      setVpnKey(FALLBACK_VPN_KEY);
      setLoading(false);
      return;
    }

    try {
      const user = await apiService.getMe();
      if (requestId !== requestIdRef.current) return;

      if (user.subscription.vlessKey) {
        setVpnKey(user.subscription.vlessKey);
      } else {
        setVpnKey(null);
        setError('VPN ключ недоступен');
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setVpnKey(null);
      setError('Не удалось загрузить VPN ключ. Попробуйте обновить страницу.');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadVpnKey();
  }, [loadVpnKey, subscription]);

  return {
    vpnKey,
    loading,
    error,
    reload: loadVpnKey,
  };
};
