import React, { useState, useEffect, ReactNode } from 'react';
import './tooltip.css'; // Optional: For custom styles

type TPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'auto'
  | 'auto-end'
  | 'auto-start'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-bottom'
  | 'left-top'
  | 'right-bottom'
  | 'right-top'
  | 'top-left'
  | 'top-right';

interface ITooltipProps {
  tooltipHeading?: string;
  tooltipContent: string | ReactNode;
  position?: TPosition;
  children: JSX.Element;
  disabled?: boolean;
  className?: string;
  openDelay?: number;
  closeDelay?: number;
  openOnTargetFocus?: boolean;
}

export const Tooltip: React.FC<ITooltipProps> = ({
  tooltipHeading,
  tooltipContent,
  position = 'top',
  children,
  disabled = false,
  className = '',
  openDelay = 0,
  closeDelay = 0,
  openOnTargetFocus = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (!disabled) {
      const delay = openDelay > 0 ? openDelay : 0;
      setTimer(setTimeout(() => setIsVisible(true), delay));
    }
  };

  const hideTooltip = () => {
    if (timer) clearTimeout(timer);
    const delay = closeDelay > 0 ? closeDelay : 0;
    setTimer(setTimeout(() => setIsVisible(false), delay));
  };

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  return (
    <div
      className={`tooltip-container ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={openOnTargetFocus ? showTooltip : undefined}
      onBlur={hideTooltip}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {isVisible && (
        <div className={`tooltip-content tooltip-${position}`}>
          {tooltipHeading && <strong>{tooltipHeading}</strong>}
          <div>{tooltipContent}</div>
        </div>
      )}
    </div>
  );
};
