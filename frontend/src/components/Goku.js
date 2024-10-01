import React, { useState, useEffect, useRef } from 'react';

const Goku = ({ gifUrl }) => {
  const [position, setPosition] = useState(-100);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(null);
  const gokuRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let screenWidth = window.innerWidth;

    const updateScreenWidth = () => {
      screenWidth = window.innerWidth;
    };

    const animateGoku = () => {
      setPosition((prevPosition) => {
        let newPosition = prevPosition + 5; // Adjust speed here
        if (newPosition > screenWidth) {
          newPosition = -100; // Reset to start position
        }
        return newPosition;
      });
      animationFrameId = requestAnimationFrame(animateGoku);
    };

    if (imageLoaded) {
      animationFrameId = requestAnimationFrame(animateGoku);
    }
    
    window.addEventListener('resize', updateScreenWidth);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateScreenWidth);
    };
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setError(null);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setError('Failed to load the GIF. Please check the URL.');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100px', // Adjust based on your GIF size
        overflow: 'hidden',
        zIndex: 1000,
        pointerEvents: 'none', // This allows clicking through the Goku layer
      }}
    >
      {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <img 
          ref={gokuRef}
          src={gifUrl}
          alt="Goku running"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            height: '100%',
            position: 'absolute',
            left: `${position}px`,
            display: imageLoaded ? 'block' : 'none',
            
          }}
        />
      )}
      {!imageLoaded && !error && <div>Loading...</div>}
    </div>
  );
};

export default Goku;