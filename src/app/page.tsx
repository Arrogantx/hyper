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
  Volume2,
  Star
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSoundEngine } from '@/utils/sound';

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
      description: 'Mint unique Hypercatz NFTs with multiple phases and whitelist access',
      href: '/mint',
      color: 'from-neon-pink to-neon-purple'
    },
    {
      icon: TrendingUp,
      title: 'Stake & Earn',
      description: 'Stake your NFTs and HYPE tokens to earn rewards and boost your power',
      href: '/stake',
      color: 'from-neon-cyan to-neon-blue'
    },
    {
      icon: Gamepad2,
      title: 'Play Games',
      description: 'Compete in on-chain games and wager HYPE for epic rewards',
      href: '/games',
      color: 'from-neon-green to-neon-yellow'
    },
    {
      icon: Gift,
      title: 'Reward Store',
      description: 'Redeem points for exclusive rewards, merch, and special privileges',
      href: '/store',
      color: 'from-neon-orange to-neon-pink'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join the community, refer friends, and climb the leaderboards',
      href: '/community',
      color: 'from-neon-purple to-neon-cyan'
    },
  ];

  const stats = [
    { label: 'Total NFTs', value: '10,000', suffix: '' },
    { label: 'Holders', value: '2.5', suffix: 'K+' },
    { label: 'Total Staked', value: '1.2', suffix: 'M HYPE' },
    { label: 'Games Played', value: '50', suffix: 'K+' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cyber-spinner" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          style={{ y: y1, opacity }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-cyber font-bold mb-4 sm:mb-6 leading-tight">
              <span className="cyber-text glitch-text" data-text="HYPERCATZ">
                HYPERCATZ
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
              The premier minting + utility hub for the{' '}
              <span className="text-neon-cyan font-bold">Hypercatz NFT collection</span>{' '}
              on HyperEVM. Mint, stake, play, and earn.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
          >
            <Link href="/mint" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group w-full sm:w-auto"
                onClick={() => {
                  playClick();
                  playLightning();
                }}
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:animate-pulse" />
                Start Minting
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/whitelist" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Check Whitelist
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                playClick();
                // Add trailer/demo functionality
              }}
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Watch Trailer
            </Button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto px-2"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="cyber-card p-3 sm:p-4 text-center"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold cyber-text mb-1">
                  {stat.value}
                  <span className="text-xs sm:text-sm">{stat.suffix}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Background Elements */}
        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 z-0"
        >
          {/* Lightning bolts */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-neon-cyan to-transparent"
              style={{
                left: `${20 + i * 20}%`,
                height: '200px',
                top: `${10 + i * 10}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scaleY: [0, 1, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                repeatDelay: 3,
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cyber font-bold mb-4 sm:mb-6 cyber-text">
              Next-Gen Utility
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-2">
              Experience the future of NFT utility with our comprehensive DApp ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Link href={feature.href}>
                  <div className="cyber-card p-6 sm:p-8 h-full cursor-pointer transition-all duration-300 hover:shadow-neon-lg">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-neon-cyan transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-neon-cyan group-hover:translate-x-2 transition-transform">
                      <span className="font-medium text-sm sm:text-base">Explore</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="cyber-card p-6 sm:p-8 md:p-12 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 border-neon-cyan/30">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cyber font-bold mb-4 sm:mb-6 cyber-text">
              Ready to Join the Pack?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Connect your wallet and dive into the Hypercatz ecosystem.
              Mint your NFT, start earning rewards, and become part of the community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
              <Link href="/mint" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:animate-pulse" />
                  Mint Now
                </Button>
              </Link>
              
              <Link href="/community" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
