import React, { useState, useEffect } from 'react';
import { formatNumberWithDots, parseNumberFromDots } from '../../utils/formatters';

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value === 0 ? '' : formatNumberWithDots(value);
  });

  useEffect(() => {
    setDisplayValue(value === 0 ? '' : formatNumberWithDots(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseNumberFromDots(raw);
    setDisplayValue(raw === '' ? '' : formatNumberWithDots(num));
    onChange(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      className={`text-right font-medium focus:outline-none transition-all ${className}`}
    />
  );
};
