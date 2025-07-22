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
  VolumeX
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSoundEngine } from '@/utils/sound';
import { NavItem } from '@/types';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';

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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={item.href}
          className={cn(
            'relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group',
            isActive 
              ? 'bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' 
              : 'text-gray-300 hover:text-neon-cyan hover:bg-dark-surface',
            isMobile && 'w-full justify-start'
          )}
          onClick={() => {
            playClick();
            if (isMobile) setIsMobileMenuOpen(false);
          }}
        >
          {Icon && <Icon className="h-5 w-5" />}
          <span className={cn(
            'font-medium transition-colors',
            isActive && 'text-neon-cyan'
          )}>
            {item.name}
          </span>
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg border border-neon-cyan/50 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-pink/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-cyber border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">H</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg blur-lg opacity-50 -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-cyber font-bold cyber-text">HYPERCATZ</h1>
              <p className="text-xs text-gray-400">NFT Utility Hub</p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.slice(0, -1).map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="p-2"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-neon-green" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
            </Button>

            {/* Admin Link (if needed) */}
            <NavLink item={navItems[navItems.length - 1]} />

            {/* Wallet Connect */}
            <div className="connect-button-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-cyber border-b border-dark-border">
        <div className="px-3 py-2.5 flex items-center justify-between">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <span className="text-base font-cyber font-bold cyber-text">HYPERCATZ</span>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-1">
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="p-1.5 min-w-0"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-neon-green" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            {/* Wallet Connect - Smaller on mobile */}
            <div className="connect-button-wrapper scale-75 origin-right">
              <ConnectButton />
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-1.5 min-w-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
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
              className="bg-dark-bg/98 backdrop-blur-cyber border-t border-dark-border max-h-[calc(100vh-60px)] overflow-y-auto"
            >
              <div className="px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} isMobile />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-20 lg:h-24" />
    </>
  );
};

export default Navigation;