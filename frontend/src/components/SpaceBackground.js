import React, { useMemo } from 'react';

const SpaceBackground = React.memo(() => {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.5,
      twinkleDelay: Math.random() * 5,
    }));
  }, []);

  const comets = useMemo(() => {
    return Array.from({ length: 3 }, () => ({
      top: Math.random() * 100,
      left: -10,
      width: Math.random() * 30 + 20,
      height: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 10,
    }));
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
        background: 'linear-gradient(to bottom, #000000, #0f0f3f)',
        overflow: 'hidden',
      }}
    >
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            animation: `twinkle 5s infinite ${star.twinkleDelay}s`,
          }}
        />
      ))}
      {comets.map((comet, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${comet.top}%`,
            left: `${comet.left}%`,
            width: `${comet.width}px`,
            height: `${comet.height}px`,
            background: 'linear-gradient(to right, rgba(0, 191, 255, 0.8), transparent)',
            borderRadius: '50%',
            animation: `comet ${comet.duration}s linear infinite ${comet.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes comet {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 100%)); }
        }
      `}</style>
    </div>
  );
});

export default SpaceBackground;