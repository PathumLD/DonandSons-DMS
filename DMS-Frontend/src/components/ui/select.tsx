'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/lib/theme/theme-context';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const { pageColor } = useTheme();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`block rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none ${
            fullWidth ? 'w-full' : ''
          } ${className}`}
          style={{
            border: `1px solid ${error ? '#DC2626' : '#D1D5DB'}`,
            backgroundColor: 'white',
            color: '#111827',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = pageColor;
            e.currentTarget.style.outline = `2px solid ${pageColor}`;
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#DC2626' : '#D1D5DB';
            e.currentTarget.style.outline = 'none';
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm" style={{ color: '#DC2626' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm" style={{ color: '#6B7280' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
