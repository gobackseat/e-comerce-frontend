import React from 'react';

export const Badge = React.forwardRef(function Badge({ children, className = '', ...props }, ref) {
  return (
    <span
      ref={ref}
      className={`inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-semibold text-xs ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge'; 