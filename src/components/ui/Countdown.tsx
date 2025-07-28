'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string; // ISO 8601 format
}

export function Countdown({ targetDate }: CountdownProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: React.ReactElement[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="text-center">
        <div className="text-4xl font-bold text-white">
          {String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}
        </div>
        <div className="text-sm uppercase text-gray-400">{interval}</div>
      </div>
    );
  });

  return (
    <div className="flex justify-center space-x-4">
      {timerComponents.length ? timerComponents : <span>Minting has begun!</span>}
    </div>
  );
}