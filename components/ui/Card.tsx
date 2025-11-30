import React from 'react';

interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  children,
  className = '',
  headerClassName = '',
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-slate-200',
    danger: 'border-red-200',
    warning: 'border-amber-200',
    success: 'border-emerald-200',
  };

  const headerColors = {
    default: 'bg-white text-slate-800',
    danger: 'bg-red-50 text-red-900',
    warning: 'bg-amber-50 text-amber-900',
    success: 'bg-emerald-50 text-emerald-900',
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${borderColors[variant]} ${className}`}>
      {(title || icon) && (
        <div className={`px-6 py-4 border-b ${borderColors[variant]} ${headerColors[variant]} flex items-center gap-2 ${headerClassName}`}>
          {icon && <span className="opacity-70">{icon}</span>}
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};