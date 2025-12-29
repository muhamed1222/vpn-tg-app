import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Компонент для плавных переходов между страницами
 * Анимирует только содержимое Outlet, Layout остается статичным
 */
export const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  const outlet = useOutlet();

  // Для HashRouter используем pathname + hash как ключ, если key недоступен
  // location.key уникален для каждого перехода и необходим для AnimatePresence
  const locationKey = location.key || `${location.pathname}${location.hash || ''}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1], // easeInOut cubic-bezier (стандартный Material Design)
        }}
        style={{ 
          width: '100%',
          position: 'relative',
        }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
};

