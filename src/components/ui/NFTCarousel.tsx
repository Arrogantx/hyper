'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';

interface NFTCarouselProps {
  imageFilenames: string[];
}

const NFTCarousel: React.FC<NFTCarouselProps> = ({ imageFilenames }) => {
  const [index, setIndex] = useState(0);
  const controls = useAnimation();
  const componentRef = useRef<HTMLDivElement>(null);

  // Mouse move tracking for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (componentRef.current) {
      const rect = componentRef.current.getBoundingClientRect();
      x.set(event.clientX - rect.left - rect.width / 2);
      y.set(event.clientY - rect.top - rect.height / 2);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  // Preload images
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
    controls.start({
      rotate: [0, direction === 'left' ? -5 : 5, 0],
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

  useEffect(() => {
    const timer = setInterval(handleNext, 4000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto h-96 flex items-center justify-center"
      style={{ perspective: '1200px' }}
      ref={componentRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable areas */}
      <div className="absolute left-0 top-0 h-full w-1/2 z-20" onClick={handlePrev} />
      <div className="absolute right-0 top-0 h-full w-1/2 z-20" onClick={handleNext} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            animate={controls}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0px 20px 50px rgba(0, 255, 255, 0.3)',
              transition: { duration: 0.3, ease: 'easeOut' },
            }}
          >
            <Image
              src={`/images/nft-images/${imageFilenames[index]}`}
              alt={`NFT ${imageFilenames[index]}`}
              width={384}
              height={384}
              className="rounded-2xl shadow-2xl"
              priority={true}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NFTCarousel;