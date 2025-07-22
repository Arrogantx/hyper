import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animate = true,
  className,
  disabled,
  onClick,
  type = 'button',
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    {
      'w-full': fullWidth,
      'cursor-not-allowed': disabled || isLoading,
    }
  );

  const variantClasses = {
    primary: cn(
      'bg-gradient-to-r from-hyperliquid-500 to-hyperliquid-600',
      'text-white shadow-lg shadow-hyperliquid-500/25',
      'hover:from-hyperliquid-600 hover:to-hyperliquid-700',
      'hover:shadow-xl hover:shadow-hyperliquid-500/30',
      'focus:ring-hyperliquid-500',
      'active:scale-95'
    ),
    secondary: cn(
      'bg-dark-800/80 backdrop-blur-sm border border-hyperliquid-500/20',
      'text-gray-100 hover:text-white',
      'hover:bg-dark-700/80 hover:border-hyperliquid-500/30',
      'focus:ring-hyperliquid-500',
      'active:scale-95'
    ),
    outline: cn(
      'bg-transparent border-2 border-hyperliquid-500/40',
      'text-hyperliquid-400 hover:text-white',
      'hover:bg-hyperliquid-500/10 hover:border-hyperliquid-500/60',
      'focus:ring-hyperliquid-500',
      'active:scale-95'
    ),
    ghost: cn(
      'bg-transparent text-gray-300 hover:text-white',
      'hover:bg-dark-800/50',
      'focus:ring-gray-500',
      'active:scale-95'
    ),
    success: cn(
      'bg-gradient-to-r from-success to-hyperliquid-600',
      'text-white shadow-lg shadow-success/25',
      'hover:from-hyperliquid-600 hover:to-success',
      'hover:shadow-xl hover:shadow-success/30',
      'focus:ring-success',
      'active:scale-95'
    ),
    warning: cn(
      'bg-gradient-to-r from-warning to-accent-orange',
      'text-white shadow-lg shadow-warning/25',
      'hover:from-accent-orange hover:to-warning',
      'hover:shadow-xl hover:shadow-warning/30',
      'focus:ring-warning',
      'active:scale-95'
    ),
    error: cn(
      'bg-gradient-to-r from-error to-accent-red',
      'text-white shadow-lg shadow-error/25',
      'hover:from-accent-red hover:to-error',
      'hover:shadow-xl hover:shadow-error/30',
      'focus:ring-error',
      'active:scale-95'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
  };

  const buttonContent = (
    <>
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (animate) {
    return (
      <motion.button
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {buttonContent}
    </button>
  );
};

export default Button;