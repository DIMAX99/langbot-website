import React from 'react';

export default function SimpleAvatar() {
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.5rem',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Avatar */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: '#fdbcb4',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Eyes */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '-10px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#000',
            borderRadius: '50%',
            animation: 'blink 4s infinite'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#000',
            borderRadius: '50%',
            animation: 'blink 4s infinite'
          }}></div>
        </div>
      </div>
      
      {/* Body */}
      <div style={{
        width: '80px',
        height: '100px',
        background: '#4f46e5',
        borderRadius: '40px',
        marginTop: '-20px'
      }}></div>
      
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        AI Language Tutor
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
}
