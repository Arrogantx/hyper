'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface NFTCarouselProps {
  imageFilenames: string[];
}

const NFTCarousel: React.FC<NFTCarouselProps> = ({ imageFilenames }) => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % imageFilenames.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + imageFilenames.length) % imageFilenames.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-96 flex items-center justify-center">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full h-full flex items-center justify-center"
        >
          <Image
            src={`/images/nft-images/${imageFilenames[index]}`}
            alt={`NFT ${imageFilenames[index]}`}
            width={384}
            height={384}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
      </AnimatePresence>
      <button
        onClick={handlePrev}
        className="absolute left-0 z-10 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 z-10 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default NFTCarousel;