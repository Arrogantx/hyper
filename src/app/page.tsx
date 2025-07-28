'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Zap,
  Coins,
  TrendingUp,
  Gamepad2,
  Users,
  Gift,
  ArrowRight,
  Play,
  Star,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSoundEngine } from '@/utils/sound';
import NFTCarousel from '@/components/ui/NFTCarousel';

const HomePage: React.FC = () => {
  const { scrollY } = useScroll();
  const { playLightning, playClick } = useSoundEngine();
  const [mounted, setMounted] = useState(false);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Coins,
      title: 'Mint NFTs',
      description: 'Mint unique Hypercatz NFTs with exclusive whitelist access and multiple phases',
      href: '/mint',
      gradient: 'from-hyperliquid-400 to-hyperliquid-600',
      iconBg: 'bg-hyperliquid-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Stake & Earn',
      description: 'Stake your NFTs and tokens to earn rewards and boost your collection power',
      href: '/stake',
      gradient: 'from-accent-blue to-hyperliquid-500',
      iconBg: 'bg-accent-blue/20'
    },
    {
      icon: Gamepad2,
      title: 'Play Games',
      description: 'Compete in skill-based games and tournaments for exclusive rewards',
      href: '/games',
      gradient: 'from-accent-purple to-accent-pink',
      iconBg: 'bg-accent-purple/20'
    },
    {
      icon: Gift,
      title: 'Reward Store',
      description: 'Redeem points for exclusive merchandise, NFTs, and special privileges',
      href: '/rewards',
      gradient: 'from-accent-orange to-accent-yellow',
      iconBg: 'bg-accent-orange/20'
    },
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Connect with holders, refer friends, and climb the leaderboards',
      href: '/community',
      gradient: 'from-hyperliquid-500 to-accent-blue',
      iconBg: 'bg-hyperliquid-500/20'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your portfolio performance and collection statistics',
      href: '/profile',
      gradient: 'from-accent-pink to-accent-purple',
      iconBg: 'bg-accent-pink/20'
    },
  ];

  const nftImageFilenames = [
    '3748.png', '3817.png', '3838.png', '3862.png', '3958.png',
    '3992.png', '4012.png', '4043.png', '4076.png', '4113.png',
    '4118.png', '4294.png', '4308.png', '4313.png', '4344.png',
    '4413.png', '4415.png', '4428.png'
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="loading-skeleton w-32 h-32 rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          style={{ y: y1, opacity }}
          className="text-center z-10 max-w-5xl mx-auto"
        >
          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-hyperliquid-500/30 mb-8"
          >
            <div className="w-2 h-2 bg-hyperliquid-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-hyperliquid-400">Live on HyperEVM</span>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="hyperliquid-gradient-text">HYPERCATZ</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The premier NFT collection and utility ecosystem on{' '}
              <span className="text-hyperliquid-400 font-semibold">Hyperliquid</span>
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Mint exclusive NFTs, stake for rewards, play games, and join a thriving community of collectors and traders.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/mint">
              <Button
                size="lg"
                className="group min-w-[200px]"
                onClick={() => {
                  playClick();
                  playLightning();
                }}
              >
                <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                Start Minting
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/whitelist">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                <Star className="h-5 w-5 mr-2" />
                Check Whitelist
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px]"
              onClick={() => {
                playClick();
                // Add trailer/demo functionality
              }}
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* NFT Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <NFTCarousel imageFilenames={nftImageFilenames} />
          </motion.div>
        </motion.div>

        {/* Animated Background Elements */}
        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {/* Floating orbs */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-hyperliquid-500/10 to-accent-blue/10 blur-xl"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title hyperliquid-gradient-text">
              Comprehensive Utility Ecosystem
            </h2>
            <p className="section-subtitle">
              Experience next-generation NFT utility with our integrated platform designed for collectors, traders, and gamers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={feature.href}>
                  <div className="feature-card h-full">
                    <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-8 w-8 text-hyperliquid-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-hyperliquid-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-hyperliquid-400 group-hover:translate-x-2 transition-transform">
                      <span className="font-medium">Learn More</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass-card p-12 border-hyperliquid-500/20 glow-green">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hyperliquid-500/10 border border-hyperliquid-500/30 mb-8">
              <Sparkles className="w-4 h-4 text-hyperliquid-400" />
              <span className="text-sm font-medium text-hyperliquid-400">Mint Goes Live July 26th, 2025</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 hyperliquid-gradient-text">
              Ready to Join the Pack?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect your wallet and dive into the Hypercatz ecosystem.
              Mint your NFT, start earning rewards, and become part of the community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mint">
                <Button size="lg" className="group min-w-[200px]">
                  <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  Mint Now
                </Button>
              </Link>
              
              <Link href="/community">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  <Users className="h-5 w-5 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
