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
  Zap
} from 'lucide-react';
import { NavItem } from '@/types';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import HypePrice from '../ui/HypePrice';
import { RPCStatus } from '@/components/ui/RPCStatus';
import { CustomConnectButton } from '../ui/CustomConnectButton';
import '@/styles/custom-connect-button.css';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core navigation items (most important for mobile)
  const coreNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Mint', href: '/mint', icon: 'Coins' },
    { name: 'Stake', href: '/stake', icon: 'TrendingUp' },
    { name: 'Swap', href: '/swap', icon: 'ArrowLeftRight' },
    { name: 'Games', href: '/games', icon: 'Gamepad2' },
  ];

  // All navigation items (for desktop expanded menu)
  const allNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Mint', href: '/mint', icon: 'Coins' },
    { name: 'Stake', href: '/stake', icon: 'TrendingUp' },
    { name: 'Swap', href: '/swap', icon: 'ArrowLeftRight' },
    { name: 'Games', href: '/games', icon: 'Gamepad2' },
    { name: 'Whitelist', href: '/whitelist', icon: 'CheckCircle' },
    { name: 'Rewards', href: '/rewards', icon: 'Gift' },
    { name: 'Community', href: '/community', icon: 'Users' },
    { name: 'Profile', href: '/profile', icon: 'Package' },
  ];

  // Items for the "More" dropdown on desktop
  const moreNavItems: NavItem[] = allNavItems.filter(
    (item) => !coreNavItems.some((coreItem) => coreItem.href === item.href)
  );

  // Mobile-only essential items (reduced set)
  const mobileEssentialItems: NavItem[] = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Mint', href: '/mint', icon: 'Coins' },
    { name: 'Swap', href: '/swap', icon: 'ArrowLeftRight' },
    { name: 'Games', href: '/games', icon: 'Gamepad2' },
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

  const toggleDesktopMenu = () => {
    setIsDesktopMenuOpen(!isDesktopMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink: React.FC<{
    item: NavItem;
    isMobile?: boolean;
    isCompact?: boolean;
    onClick?: () => void
  }> = ({
    item,
    isMobile = false,
    isCompact = false,
    onClick
  }) => {
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
            'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group',
            isActive
              ? 'bg-hyperliquid-500/10 text-hyperliquid-400'
              : 'text-gray-300 hover:text-hyperliquid-400 hover:bg-dark-800/50',
            isMobile && 'w-full justify-start',
            isCompact && 'py-2 px-3'
          )}
          onClick={(e) => {
            console.log('Navigation link clicked:', item.href, item.name);
            onClick?.();
            if (isMobile) setIsMobileMenuOpen(false);
            else setIsDesktopMenuOpen(false);
          }}
        >
          {Icon && (
            <div className={cn(
              'flex items-center justify-center rounded-lg transition-all duration-300',
              isCompact ? 'w-6 h-6' : 'w-8 h-8',
              isActive
                ? 'bg-hyperliquid-500/20 text-hyperliquid-400'
                : 'text-gray-400 group-hover:text-hyperliquid-400 group-hover:bg-hyperliquid-500/10'
            )}>
              <Icon className={cn(isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
            </div>
            )}
            <span className={cn(
              'font-medium transition-colors',
              isCompact ? 'text-xs' : 'text-sm',
              isActive ? 'text-hyperliquid-400' : 'group-hover:text-hyperliquid-400'
            )}>
              {item.name}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId={isMobile ? "mobileActiveTab" : "desktopActiveTab"}
                className="absolute inset-0 rounded-xl ring-2 ring-hyperliquid-500/50 ring-offset-2 ring-offset-dark-900 bg-hyperliquid-500/5"
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

    // Check if any nav item is active
    const isAnyNavActive = allNavItems.some(item => pathname === item.href);

    return (
      <>
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 glass-card border-b border-dark-700/50">
          <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 relative">
              {coreNavItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
              {moreNavItems.length > 0 && (
                <div className="relative">
                  <Button
                    id="more-button" // Add ID for click outside detection
                    variant="ghost"
                    size="sm"
                    onClick={toggleDesktopMenu}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                      isDesktopMenuOpen ? "bg-dark-800/50 text-hyperliquid-400" : "text-gray-300 hover:text-hyperliquid-400 hover:bg-dark-800/50"
                    )}
                  >
                    More
                    {isDesktopMenuOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Menu className="h-4 w-4" />
                    )}
                  </Button>
                  <AnimatePresence>
                    {isDesktopMenuOpen && (
                      <motion.div
                        id="desktop-nav-menu" // Add ID for click outside detection
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-80 min-w-[160px] max-w-[calc(100vw-2rem)] glass-card border border-dark-700/50 rounded-xl shadow-lg p-2 space-y-1 z-50 origin-top-right"
                      >
                        {moreNavItems.map((item) => (
                          <NavLink key={item.href} item={item} isCompact onClick={() => setIsDesktopMenuOpen(false)} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* HYPE Price Display */}
              <HypePrice variant="navbar" />

              {/* RPC Status */}
              <div className="relative">
                <RPCStatus />
              </div>

              {/* Wallet Connect */}
              <div className="connect-button-wrapper">
                <CustomConnectButton />
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - Reduced Version */}
        <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-dark-700/50">
          <div className="w-full px-4 py-3 flex items-center justify-between">
            {/* Mobile Logo - Compact */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-gradient-to-br from-hyperliquid-500 to-hyperliquid-600 rounded-lg flex items-center justify-center shadow-lg shadow-hyperliquid-500/25">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold hyperliquid-gradient-text">HYPERCATZ</span>
            </div>

            {/* Mobile Controls - Compact */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* HYPE Price Display - Mobile (hidden on very small screens) */}
              <div className="hidden sm:block scale-75 origin-right">
                <HypePrice variant="navbar" />
              </div>

              {/* Wallet Connect - Compact */}
              <div className="connect-button-wrapper scale-90 origin-right">
                <CustomConnectButton />
              </div>

              {/* Mobile Menu Toggle - Compact */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-1.5 min-w-0 hover:bg-dark-800/50 relative z-50 rounded-lg ml-1"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 text-hyperliquid-400" />
                ) : (
                  <Menu className="h-4 w-4 text-gray-300 hover:text-hyperliquid-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Overlay - Reduced */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card border-t border-dark-700/50 max-h-[calc(100vh-60px)] overflow-y-auto"
              >
                <div className="px-4 py-3 space-y-1">
                  {/* Essential nav items only */}
                  {mobileEssentialItems.map((item) => (
                    <NavLink key={item.href} item={item} isMobile isCompact />
                  ))}
                  
                  {/* Divider */}
                  <div className="my-2 border-t border-dark-700/50" />
                  
                  {/* Additional items - compact */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 px-4 py-1 font-medium">More</div>
                    {allNavItems.slice(4).map((item) => (
                      <NavLink key={item.href} item={item} isMobile isCompact />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Spacer for fixed navigation */}
        <div className="h-[60px] lg:h-[80px]" />
      </>
    );
  };
  
  export default Navigation;