import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Person3DProps {
  cursorPosition: { x: number; y: number };
}

// Error Boundary Component
class ErrorBoundaryComponent extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('GLB Avatar Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Error Fallback Component
function ErrorFallback() {
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
      fontSize: '1.2rem',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>🤖</div>
      <div>AI Avatar Unavailable</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Loading 3D model...</div>
    </div>
  );
}

// GLB Model Component
function GLBAvatar({ cursorPosition }: Person3DProps) {
  const modelRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D>(null);

  // Use useGLTF hook to load the model
  const gltf = useGLTF('/person.glb');
  const { scene } = gltf;

  React.useEffect(() => {
    if (scene && modelRef.current) {
      console.log('GLB model loaded successfully');
      
      // Clear any existing children
      while (modelRef.current.children.length > 0) {
        modelRef.current.remove(modelRef.current.children[0]);
      }
      
      // Clone and add the scene
      const clonedScene = scene.clone();
      modelRef.current.add(clonedScene);
      
      // Log the structure for debugging
      console.log('Model structure:', clonedScene);
      
      // Try to find the head for cursor tracking
      clonedScene.traverse((object) => {
        if (object.name && (
          object.name.toLowerCase().includes('head') ||
          object.name.toLowerCase().includes('neck') ||
          object.name.toLowerCase().includes('skull') ||
          object.name.toLowerCase().includes('face')
        )) {
          headRef.current = object;
          console.log('Head object found:', object.name);
        }
      });
      
      // If no head found, use the whole model
      if (!headRef.current) {
        headRef.current = clonedScene;
        console.log('No head found, using whole model for tracking');
      }
    }
  }, [scene]);

  useFrame(() => {
    try {
      if (headRef.current && typeof window !== 'undefined') {
        const x = (cursorPosition.x / window.innerWidth) * 2 - 1;
        const y = -(cursorPosition.y / window.innerHeight) * 2 + 1;

        // Apply rotation with reduced intensity for more natural movement
        headRef.current.rotation.y = x * 0.15;
        headRef.current.rotation.x = y * 0.1;
      }
    } catch (error) {
      console.warn('Error in avatar animation:', error);
    }
  });

  return (
    <group ref={modelRef} scale={[2, 2, 2]} position={[0, -2, 0]} />
  );
}

// Simple fallback avatar using basic shapes
function SimpleAvatar({ cursorPosition }: Person3DProps) {
  const headRef = useRef<THREE.Mesh>(null);
  const eyesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    try {
      if (headRef.current && eyesRef.current) {
        const x = (cursorPosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 2 - 1;
        const y = -(cursorPosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 2 + 1;

        headRef.current.rotation.y = x * 0.3;
        headRef.current.rotation.x = y * 0.2;
        
        eyesRef.current.rotation.y = x * 0.1;
        eyesRef.current.rotation.x = y * 0.1;
      }
    } catch (error) {
      console.warn('Error in avatar animation:', error);
    }
  });

  return (
    <group>
      <mesh ref={headRef} position={[0, 1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
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
      
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 2, 8]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      
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

export default function Person3D() {
  const [cursorPosition, setCursorPosition] = React.useState({ x: 0, y: 0 });
  const [mounted, setMounted] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [useGLB, setUseGLB] = React.useState(true);

  React.useEffect(() => {
    try {
      setMounted(true);
      
      const handleMouseMove = (event: MouseEvent) => {
        setCursorPosition({ x: event.clientX, y: event.clientY });
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', handleMouseMove);
      }

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('mousemove', handleMouseMove);
        }
      };
    } catch (error) {
      console.error('Error setting up Person3D:', error);
      setHasError(true);
    }
  }, []);

  const handleGLBError = (error: any) => {
    console.warn('GLB loading failed, falling back to simple avatar:', error);
    setUseGLB(false);
  };

  if (!mounted || hasError) {
    return <ErrorFallback />;
  }

  try {
    return (
      <div style={{ width: '100%', height: '400px' }}>
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 50 }}
          onError={(error) => {
            console.error('Canvas error:', error);
            setHasError(true);
          }}
        >
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={
            <Text 
              position={[0, 0, 0]} 
              fontSize={0.5} 
              color="white"
              anchorX="center" 
              anchorY="middle"
            >
              Loading Avatar...
            </Text>
          }>
            {useGLB ? (
              <ErrorBoundaryComponent
                fallback={<SimpleAvatar cursorPosition={cursorPosition} />}
                onError={handleGLBError}
              >
                <GLBAvatar cursorPosition={cursorPosition} />
              </ErrorBoundaryComponent>
            ) : (
              <SimpleAvatar cursorPosition={cursorPosition} />
            )}
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
    console.error('Error rendering Person3D:', error);
    return <ErrorFallback />;
  }
}