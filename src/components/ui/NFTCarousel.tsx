'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Image from 'next/image';

interface NFTCarouselProps {
  imageFilenames: string[];
}

const NFTCarousel: React.FC<NFTCarouselProps> = ({ imageFilenames }) => {
  const [index, setIndex] = useState(0);
  const controls = useAnimation();

  // Preload next and previous images to improve loading experience
  useEffect(() => {
    if (imageFilenames.length > 1) {
      const nextIndex = (index + 1) % imageFilenames.length;
      const prevIndex = (index - 1 + imageFilenames.length) % imageFilenames.length;

      const nextImage = new (window as any).Image();
      nextImage.src = `/images/nft-images/${imageFilenames[nextIndex]}`;
      
      const prevImage = new (window as any).Image();
      prevImage.src = `/images/nft-images/${imageFilenames[prevIndex]}`;
    }
  }, [index, imageFilenames]);

  const triggerWobble = useCallback((direction: 'left' | 'right') => {
    const rotationAmount = direction === 'left' ? -5 : 5;
    controls.start({
      rotate: [0, rotationAmount, -rotationAmount, rotationAmount, 0],
      transition: { duration: 0.4 }
    });
  }, [controls]);

  const handleNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % imageFilenames.length);
    triggerWobble('right');
  }, [imageFilenames.length, triggerWobble]);

  const handlePrev = useCallback(() => {
    setIndex((prevIndex) => (prevIndex - 1 + imageFilenames.length) % imageFilenames.length);
    triggerWobble('left');
  }, [imageFilenames.length, triggerWobble]);

  // Autorun the carousel
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-96 flex items-center justify-center cursor-pointer">
      {/* Clickable areas for navigation */}
      <div className="absolute left-0 top-0 h-full w-1/2 z-10" onClick={handlePrev} />
      <div className="absolute right-0 top-0 h-full w-1/2 z-10" onClick={handleNext} />
      
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          <motion.div
            animate={controls}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0px 10px 40px rgba(0, 255, 255, 0.3)',
              transition: { duration: 0.3 }
            }}
            className="relative"
          >
            <Image
              src={`/images/nft-images/${imageFilenames[index]}`}
              alt={`NFT ${imageFilenames[index]}`}
              width={384}
              height={384}
              className="rounded-2xl shadow-lg"
              priority={true} // Prioritize loading the visible image to prevent flash
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NFTCarousel;