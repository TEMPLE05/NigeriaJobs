import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  description,
  trend
}) => {
  const getGradientClasses = (color: string) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return gradients[color as keyof typeof gradients];
  };

  return (
    <div 
      className="flex items-center justify-between p-6 
      border border-gray-200 dark:border-gray-700 rounded-xl
      bg-white dark:bg-gray-800 shadow-sm hover:shadow-md 
      transition-all duration-200 hover:scale-[1.02]"
      aria-label={`${title} statistics block`}
    >
      {/* Left side: icon + labels */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradientClasses(color)} shadow-sm`}>
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Right side: trend */}
      {trend && (
        <div className="flex flex-col items-end">
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-semibold
            ${trend.isPositive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
            <span className="mr-1 text-base">{trend.isPositive ? '↗' : '↘'}</span>
            {trend.value}%
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last period</span>
        </div>
      )}
    </div>
  );
};