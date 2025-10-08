'use client';

import React from 'react';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

export function Text({ children, variant = 'body', className = '', ...props }: TextProps) {
  const variants = {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    body: 'text-base text-gray-700',
    caption: 'text-sm text-gray-500'
  };
  
  const baseStyles = variants[variant];
  const classes = `${baseStyles} ${className}`;
  
  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}