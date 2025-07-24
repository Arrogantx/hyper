'use client';

import { motion } from 'framer-motion';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 pt-24 pb-12 flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          className="text-6xl md:text-8xl font-bold hyperliquid-gradient-text"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          COMING SOON
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-400 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Epic gaming experiences are on the way
        </motion.p>
      </div>
    </div>
  );
}