'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSoundEngine } from '@/utils/sound';
import { ButtonProps } from '@/types';
import { cn } from '@/utils/cn';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className,
  ...props
}) => {
  const { playClick } = useSoundEngine();

  const handleClick = () => {
    if (!disabled && !isLoading && onClick) {
      playClick();
      onClick();
    }
  };

  const baseClasses = 'relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-neon-pink to-neon-cyan text-black hover:shadow-neon-lg hover:scale-105',
    secondary: 'bg-dark-surface border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black hover:shadow-neon',
    outline: 'bg-transparent border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black hover:shadow-neon',
    ghost: 'bg-transparent text-white hover:bg-dark-surface hover:text-neon-cyan',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green p-[2px] opacity-0 transition-opacity duration-300 hover:opacity-100">
        <div className="h-full w-full rounded-lg bg-dark-bg" />
      </div>
    </motion.button>
  );
};

export default Button;