import React, { useRef, Suspense, useEffect, useState } from 'react';

// Fallback component for when 3D fails
function Avatar2D() {
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

// Simple 3D Avatar Component
function Simple3DAvatar({ cursorPosition }: { cursorPosition: { x: number; y: number } }) {
  const headRef = useRef<any>(null);
  const eyesRef = useRef<any>(null);

  // Dynamic import of Three.js components
  const [ThreeComponents, setThreeComponents] = useState<any>(null);

  useEffect(() => {
    const loadThree = async () => {
      try {
        const { Canvas, useFrame } = await import('@react-three/fiber');
        const { OrbitControls } = await import('@react-three/drei');
        const THREE = await import('three');
        
        setThreeComponents({ Canvas, useFrame, OrbitControls, THREE });
      } catch (error) {
        console.log('Three.js not available, using 2D fallback');
      }
    };

    loadThree();
  }, []);

  if (!ThreeComponents) {
    return <Avatar2D />;
  }

  const { Canvas, useFrame, OrbitControls } = ThreeComponents;

  function Avatar() {
    useFrame(() => {
      if (headRef.current && eyesRef.current) {
        const x = (cursorPosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 2 - 1;
        const y = -(cursorPosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 2 + 1;

        headRef.current.rotation.y = x * 0.3;
        headRef.current.rotation.x = y * 0.2;
        
        eyesRef.current.rotation.y = x * 0.1;
        eyesRef.current.rotation.x = y * 0.1;
      }
    });

    return (
      <group>
        {/* Head */}
        <mesh ref={headRef} position={[0, 1, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#fdbcb4" />
        </mesh>
        
        {/* Eyes */}
        <group ref={eyesRef} position={[0, 1.2, 0.8]}>
          <mesh position={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
        
        {/* Body */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.8, 1.2, 2, 8]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color="#fdbcb4" />
        </mesh>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color="#fdbcb4" />
        </mesh>
      </group>
    );
  }

  try {
    return (
      <div style={{ width: '100%', height: '400px' }}>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={null}>
            <Avatar />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate={false}
          />
        </Canvas>
      </div>
    );
  } catch (error) {
    console.log('3D rendering failed, using 2D fallback');
    return <Avatar2D />;
  }
}

export default function Person3D() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  if (!mounted) {
    return <Avatar2D />;
  }

  return <Simple3DAvatar cursorPosition={cursorPosition} />;
}
