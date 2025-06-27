import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          if (onExpire) onExpire();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl text-center">
        <Clock className="mx-auto mb-2" size={24} />
        <p className="font-semibold">Giveaway Ended</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl">
      <div className="flex items-center justify-center mb-3">
        <Clock size={20} className="mr-2" />
        <span className="font-semibold">Time Remaining</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-xs opacity-80">Days</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs opacity-80">Hours</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs opacity-80">Min</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2">
          <div className="text-2xl font-bold">{timeLeft.seconds}</div>
          <div className="text-xs opacity-80">Sec</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;