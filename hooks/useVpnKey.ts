import { useCallback, useEffect, useRef, useState } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

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

    try {
      const result = await apiService.getUserConfig();
      if (requestId !== requestIdRef.current) return;

      if (result.ok && result.config) {
        setVpnKey(result.config);
      } else {
        setVpnKey(null);
        setError('VPN ключ недоступен');
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error loading VPN key:', err);
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
