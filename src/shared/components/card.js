// src/shared/components/shared/card.js
import React from 'react';

export function Card({ children, className }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={`border-b pb-2 mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={`text-lg font-bold ${className}`}>{children}</h2>;
}

export function CardDescription({ children, className }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={`flex-grow ${className}`}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={`border-t pt-2 mt-4 ${className}`}>{children}</div>;
}
