'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/lib/theme/theme-context';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'yellow';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const { pageColor } = useTheme();

    const getBackgroundColor = () => {
      if (variant === 'yellow') {
        return '#FEF3C4';
      }
      return 'var(--background)';
    };

    const getBorderColor = () => {
      if (variant === 'yellow') {
        return '#FFD100';
      }
      return error ? '#DC2626' : 'var(--input)';
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none ${
            fullWidth ? 'w-full' : ''
          } ${className}`}
          style={{
            border: `1px solid ${getBorderColor()}`,
            backgroundColor: getBackgroundColor(),
            color: 'var(--foreground)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = pageColor;
            e.currentTarget.style.outline = `2px solid ${pageColor}`;
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = getBorderColor();
            e.currentTarget.style.outline = 'none';
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
