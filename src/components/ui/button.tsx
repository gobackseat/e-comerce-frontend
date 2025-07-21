import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className = '',
    size = 'md',
    variant = 'primary',
    ...props
  }, ref) => {
    let sizeClasses = '';
    if (size === 'sm') sizeClasses = 'px-3 py-1.5 text-sm';
    else if (size === 'lg') sizeClasses = 'px-6 py-3 text-lg';
    else sizeClasses = 'px-4 py-2';

    let variantClasses = '';
    if (variant === 'primary') variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
    else if (variant === 'secondary') variantClasses = 'bg-gray-100 hover:bg-gray-200 text-gray-900';
    else if (variant === 'ghost') variantClasses = 'bg-transparent hover:bg-gray-100 text-gray-900';
    else variantClasses = '';

    return (
      <button
        ref={ref}
        className={`rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 