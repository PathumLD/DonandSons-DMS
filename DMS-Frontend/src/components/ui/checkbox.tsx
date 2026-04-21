'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const { pageColor } = useTheme();

    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div 
            className="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all peer-checked:border-0"
            style={{
              borderColor: error ? '#DC2626' : '#D1D5DB',
              backgroundColor: props.checked ? pageColor : 'white',
            }}
          >
            {props.checked && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
        {label && (
          <div className="ml-3">
            <label className="text-sm cursor-pointer" style={{ color: '#374151' }}>
              {label}
            </label>
            {error && (
              <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
