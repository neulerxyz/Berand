// src/shared/components/button.js
import React from 'react';

export function Button({ children, onClick, className = '', variant = 'default', size = 'md' }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition duration-150 ease-in-out';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-lg',
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
