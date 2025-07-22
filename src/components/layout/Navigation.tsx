'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Coins, 
  CheckCircle, 
  TrendingUp, 
  Gamepad2, 
  ArrowLeftRight, 
  Gift, 
  Users, 
  Package, 
  Settings,
  Menu,
  X,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { useSoundEngine } from '@/utils/sound';
import { NavItem } from '@/types';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import HypePrice from '../ui/HypePrice';
import HypeConnectButton from '../wallet/HypeConnectButton';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { enabled: soundEnabled, setEnabled: setSoundEnabled, playClick } = useSoundEngine();

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Mint', href: '/mint', icon: 'Coins' },
    { name: 'Whitelist', href: '/whitelist', icon: 'CheckCircle' },
    { name: 'Stake', href: '/stake', icon: 'TrendingUp' },
    { name: 'Games', href: '/games', icon: 'Gamepad2' },
    { name: 'Swap', href: '/swap', icon: 'ArrowLeftRight' },
    { name: 'Rewards', href: '/rewards', icon: 'Gift' },
    { name: 'Community', href: '/community', icon: 'Users' },
    { name: 'Profile', href: '/profile', icon: 'Package' },
    { name: 'Admin', href: '/admin', icon: 'Settings' },
  ];

  const iconMap = {
    Home,
    Coins,
    CheckCircle,
    TrendingUp,
    Gamepad2,
    ArrowLeftRight,
    Gift,
    Users,
    Package,
    Settings,
  };

  const toggleMobileMenu = () => {
    playClick();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSound = () => {
    playClick();
    setSoundEnabled(!soundEnabled);
  };

  const NavLink: React.FC<{ item: NavItem; isMobile?: boolean }> = ({ item, isMobile = false }) => {
    const Icon = iconMap[item.icon as keyof typeof iconMap];
    const isActive = pathname === item.href;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href={item.href}
          className={cn(
            'relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group',
            isActive 
              ? 'bg-hyperliquid-500/10 text-hyperliquid-400 border border-hyperliquid-500/20 shadow-lg shadow-hyperliquid-500/10' 
              : 'text-gray-300 hover:text-hyperliquid-400 hover:bg-dark-800/50',
            isMobile && 'w-full justify-start py-3'
          )}
          onClick={() => {
            playClick();
            if (isMobile) setIsMobileMenuOpen(false);
          }}
        >
          {Icon && (
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
              isActive 
                ? 'bg-hyperliquid-500/20 text-hyperliquid-400' 
                : 'text-gray-400 group-hover:text-hyperliquid-400 group-hover:bg-hyperliquid-500/10'
            )}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <span className={cn(
            'font-medium transition-colors text-sm',
            isActive ? 'text-hyperliquid-400' : 'group-hover:text-hyperliquid-400'
          )}>
            {item.name}
          </span>
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl border border-hyperliquid-500/30 bg-hyperliquid-500/5"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-hyperliquid-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 glass-card border-b border-dark-700/50">
        <div className="w-full max-w-none px-4 xl:max-w-7xl xl:mx-auto xl:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-xl flex items-center justify-center shadow-lg shadow-hyperliquid-500/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-xl blur-lg opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold hyperliquid-gradient-text">HYPERCATZ</h1>
              <p className="text-xs text-gray-400 font-medium">NFT Utility Hub</p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 flex-1 justify-center max-w-4xl mx-8">
            {navItems.slice(0, -1).map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* HYPE Price Display */}
            <HypePrice variant="navbar" />

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="p-2 hover:bg-dark-800/50"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-hyperliquid-500" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
            </Button>

            {/* Admin Link (if needed) */}
            <NavLink item={navItems[navItems.length - 1]} />

            {/* Wallet Connect */}
            <div className="connect-button-wrapper">
              <HypeConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-dark-700/50">
        <div className="w-full px-3 py-3 flex items-center justify-between">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-lg flex items-center justify-center shadow-lg shadow-hyperliquid-500/25">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold hyperliquid-gradient-text">HYPERCATZ</span>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* HYPE Price Display - Mobile */}
            <div className="hidden sm:block scale-75 origin-right">
              <HypePrice variant="navbar" />
            </div>

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="p-2 min-w-0 hover:bg-dark-800/50"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-hyperliquid-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            {/* Wallet Connect - Responsive sizing */}
            <div className="connect-button-wrapper">
              <HypeConnectButton
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full'
                }}
              />
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 min-w-0 hover:bg-dark-800/50 relative z-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-hyperliquid-400" />
              ) : (
                <Menu className="h-5 w-5 text-gray-300 hover:text-hyperliquid-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card border-t border-dark-700/50 max-h-[calc(100vh-70px)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} isMobile />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-[70px] lg:h-[80px]" />
    </>
  );
};

export default Navigation;