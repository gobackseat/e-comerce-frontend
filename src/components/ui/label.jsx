import React from 'react';

export const Label = React.forwardRef(function Label({ children, className = '', htmlFor, ...props }, ref) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`block font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label'; 