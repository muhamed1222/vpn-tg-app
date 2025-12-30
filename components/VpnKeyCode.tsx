import React, { useEffect, useRef, useState } from 'react';

interface VpnKeyCodeProps {
  value: string;
  ariaLabel?: string;
  className?: string;
  tooltipCopyText?: string;
  tooltipCopiedText?: string;
}

export const VpnKeyCode: React.FC<VpnKeyCodeProps> = ({
  value,
  ariaLabel = 'VPN ключ. Нажмите для копирования',
  className = '',
  tooltipCopyText = 'Скопировать',
  tooltipCopiedText = 'Скопировано!',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setShowTooltip(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
    }
  };

  return (
    <div className="flex-1 relative">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {copied ? 'Ключ скопирован в буфер обмена' : ''}
      </div>
      <code
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`block text-xs font-mono text-fg-3 break-words break-all min-w-0 leading-relaxed select-all cursor-pointer hover:text-fg-4 transition-colors ${className}`}
        aria-label={ariaLabel}
      >
        {value}
      </code>
      {showTooltip && value && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--fg-4)] text-[var(--background)] text-[10px] font-medium rounded whitespace-nowrap pointer-events-none z-50 shadow-lg"
          style={{
            opacity: showTooltip ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {copied ? tooltipCopiedText : tooltipCopyText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[var(--fg-4)]"></div>
        </div>
      )}
    </div>
  );
};
