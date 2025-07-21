import React, { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold text-xs ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge'; 