import React from 'react';

export const Avatar = React.forwardRef(function Avatar({ src, alt = '', className = '', ...props }, ref) {
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`inline-block w-12 h-12 rounded-full object-cover border-2 border-gray-200 ${className}`}
      onError={e => { e.target.onerror = null; e.target.src = '/Assets/imgs/avatar-placeholder.png'; }}
      {...props}
    />
  );
});

Avatar.displayName = 'Avatar'; 