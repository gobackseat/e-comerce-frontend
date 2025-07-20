import React from 'react';

const Card = React.forwardRef(({ children, className = '', ...rest }, ref) => (
  <div ref={ref} className={`rounded-2xl shadow bg-white border border-gray-200 overflow-hidden ${className}`} {...rest}>
    {children}
  </div>
));

const CardContent = React.forwardRef(({ children, className = '', ...rest }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...rest}>
    {children}
  </div>
));

Card.displayName = 'Card';
CardContent.displayName = 'CardContent';

export { Card, CardContent }; 