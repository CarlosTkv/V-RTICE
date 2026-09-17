import React from 'react';

interface AccountingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const AccountingInput: React.FC<AccountingInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "0,00"
}) => {
  const formatValue = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <input
      type="text"
      className={`text-right font-mono bg-slate-950 border border-slate-700 rounded-xl p-2 text-white ${className}`}
      defaultValue={formatValue(value)}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};
