import React, { useMemo } from 'react';

const SpaceBackground = React.memo(() => {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.5,
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
          }}
        />
      ))}
    </div>
  );
});

export default SpaceBackground;