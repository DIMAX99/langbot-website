import React, { useState, useEffect } from 'react';

interface HumanAvatarProps {
  isPlaying?: boolean;
  expression?: 'neutral' | 'happy' | 'speaking' | 'thinking' | 'excited';
  message?: string;
}

const HumanAvatar: React.FC<HumanAvatarProps> = ({ 
  isPlaying = false, 
  expression = 'neutral',
  message = ''
}) => {
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthMovement, setMouthMovement] = useState(0);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth movement when speaking
  useEffect(() => {
    let mouthInterval: NodeJS.Timeout;
    
    if (isPlaying) {
      setCurrentExpression('speaking');
      mouthInterval = setInterval(() => {
        setMouthMovement(Math.random());
      }, 100);
    } else {
      setCurrentExpression(expression);
      setMouthMovement(0);
    }

    return () => {
      if (mouthInterval) clearInterval(mouthInterval);
    };
  }, [isPlaying, expression]);

  const getEyeStyle = () => ({
    width: '20px',
    height: isBlinking ? '2px' : '20px',
    backgroundColor: '#2d3748',
    borderRadius: '50%',
    transition: 'height 0.1s ease',
    position: 'relative' as const,
  });

  const getEyebrowStyle = (side: 'left' | 'right') => {
    const baseStyle = {
      width: '25px',
      height: '4px',
      backgroundColor: '#4a5568',
      borderRadius: '2px',
      position: 'absolute' as const,
      top: '-8px',
      transition: 'transform 0.3s ease',
    };

    let transform = 'rotate(0deg)';
    if (currentExpression === 'thinking') {
      transform = side === 'left' ? 'rotate(-10deg)' : 'rotate(10deg)';
    } else if (currentExpression === 'excited') {
      transform = side === 'left' ? 'rotate(10deg)' : 'rotate(-10deg)';
    }

    return {
      ...baseStyle,
      left: side === 'left' ? '-2px' : '-2px',
      transform,
    };
  };

  const getMouthStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      transition: 'all 0.1s ease',
    };

    if (currentExpression === 'speaking') {
      const openness = 5 + mouthMovement * 10;
      return {
        ...baseStyle,
        width: `${15 + mouthMovement * 5}px`,
        height: `${openness}px`,
        backgroundColor: '#2d3748',
        borderRadius: '50%',
      };
    } else if (currentExpression === 'happy' || currentExpression === 'excited') {
      return {
        ...baseStyle,
        width: '30px',
        height: '15px',
        border: '3px solid #4a5568',
        borderTop: 'none',
        borderRadius: '0 0 30px 30px',
        backgroundColor: 'transparent',
      };
    } else if (currentExpression === 'thinking') {
      return {
        ...baseStyle,
        width: '20px',
        height: '8px',
        backgroundColor: '#4a5568',
        borderRadius: '10px',
      };
    } else {
      return {
        ...baseStyle,
        width: '25px',
        height: '6px',
        backgroundColor: '#4a5568',
        borderRadius: '3px',
      };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }}>
      {/* Avatar Container */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        backgroundColor: '#e2e8f0',
        borderRadius: '50%',
        border: '4px solid #6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease',
        transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
      }}>
        {/* Hair */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '20px',
          right: '20px',
          height: '80px',
          backgroundColor: '#8b5a3c',
          borderRadius: '80px 80px 20px 20px',
        }} />

        {/* Face */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '30px',
          right: '30px',
          bottom: '40px',
          backgroundColor: '#fdbcb4',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Eyes Container */}
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '30px',
          }}>
            {/* Left Eye */}
            <div style={{ position: 'relative' }}>
              <div style={getEyebrowStyle('left')} />
              <div style={getEyeStyle()}>
                {!isBlinking && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#1a202c',
                    borderRadius: '50%',
                  }} />
                )}
              </div>
            </div>

            {/* Right Eye */}
            <div style={{ position: 'relative' }}>
              <div style={getEyebrowStyle('right')} />
              <div style={getEyeStyle()}>
                {!isBlinking && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#1a202c',
                    borderRadius: '50%',
                  }} />
                )}
              </div>
            </div>
          </div>

          {/* Nose */}
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '12px',
            backgroundColor: '#f7a8a0',
            borderRadius: '0 0 8px 8px',
          }} />

          {/* Mouth */}
          <div style={getMouthStyle()} />

          {/* Cheeks for happy/excited expressions */}
          {(currentExpression === 'happy' || currentExpression === 'excited') && (
            <>
              <div style={{
                position: 'absolute',
                top: '75px',
                left: '20px',
                width: '15px',
                height: '15px',
                backgroundColor: '#f56565',
                borderRadius: '50%',
                opacity: 0.6,
              }} />
              <div style={{
                position: 'absolute',
                top: '75px',
                right: '20px',
                width: '15px',
                height: '15px',
                backgroundColor: '#f56565',
                borderRadius: '50%',
                opacity: 0.6,
              }} />
            </>
          )}
        </div>

        {/* Thinking bubbles for thinking expression */}
        {currentExpression === 'thinking' && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            display: 'flex',
            gap: '5px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '50%',
              animation: 'bounce 1s infinite',
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#e2e8f0',
              borderRadius: '50%',
              animation: 'bounce 1s infinite 0.1s',
            }} />
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#e2e8f0',
              borderRadius: '50%',
              animation: 'bounce 1s infinite 0.2s',
            }} />
          </div>
        )}
      </div>

      {/* Expression Status */}
      <div style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#1a1a1a',
        borderRadius: '20px',
        color: '#ffffff',
        fontSize: '0.9rem',
        textAlign: 'center',
        minWidth: '120px',
      }}>
        {isPlaying ? '🗣️ Speaking...' : 
         currentExpression === 'thinking' ? '🤔 Thinking...' :
         currentExpression === 'happy' ? '😊 Happy' :
         currentExpression === 'excited' ? '🎉 Excited' :
         '😐 Listening'}
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          maxWidth: '200px',
          padding: '1rem',
          backgroundColor: '#2d3748',
          color: '#ffffff',
          borderRadius: '10px',
          fontSize: '0.9rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #2d3748',
          }} />
          {message}
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-5px,0);
          }
          70% {
            transform: translate3d(0,-3px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </div>
  );
};

export default HumanAvatar;
