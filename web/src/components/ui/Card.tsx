'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const classes = `${baseStyles} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}