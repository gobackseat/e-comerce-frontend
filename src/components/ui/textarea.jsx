import React from 'react';

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea'; 