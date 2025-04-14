import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
  useGLTF,
  Stars,
  Sparkles,
  Float,
  Plane,
  Image,
  Text3D,
  useTexture
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import gsap from "gsap";
import * as THREE from "three";

// Create a safe reference wrapper to prevent null reference errors
const SafeRef = () => {
  const ref = useRef(new THREE.Group());
  return ref;
};

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  const dotsRef = SafeRef();

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      
      // Check if dotsRef.current exists before animating
      if (dotsRef.current) {
        // Save initial position
        const initialY = dotsRef.current.position.y || 0;
        
        // Animate dots with GSAP when loading starts
        const tween = gsap.to(dotsRef.current.position, { 
          y: initialY + 0.05,
          duration: 0.5,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut"
        });
        
        return () => {
          clearInterval(interval);
          tween.kill();
        };
      }
      
      return () => {
        clearInterval(interval);
      };
    } else {
      setLoadingText("");
    }
  }, [loading]);
  
  if (!loading) return null;
  
  return (
    <group {...props} ref={dotsRef}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"} color="white">
        {loadingText}
      </Text>
    </group>
  );
};

// Solana Logo Component
const SolanaLogo = ({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2, 0.6]} />
        <meshBasicMaterial transparent opacity={0.9}>
          <Text 
            fontSize={0.4}
            color="#14F195"
            font="/fonts/Orbitron-Bold.ttf"
            position={[0, 0, 0.01]}
            anchorX="center"
            anchorY="middle"
          >
            SOLANA
          </Text>
        </meshBasicMaterial>
      </mesh>
    </group>
  );
};

// News Studio Background
const NewsStudioBackground = () => {
  const groupRef = useRef();
  const hexagonsRef = useRef();
  const dataFlowRef = useRef();
  
  // Create a repeating pattern of hexagons
  const hexagons = useMemo(() => {
    const hexGroup = [];
    const rows = 10;
    const cols = 20;
    const size = 1.2;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * size * 0.85 - (cols * size * 0.85) / 2;
        const y = i * size * 0.75 - (rows * size * 0.75) / 2;
        const z = -15 - Math.random() * 5;
        
        // Offset every other row
        const xOffset = i % 2 === 0 ? 0 : size * 0.425;
        
        // Random opacity for visual interest
        const opacity = Math.random() * 0.3 + 0.1;
        
        hexGroup.push(
          <mesh 
            key={`hex-${i}-${j}`} 
            position={[x + xOffset, y, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <circleGeometry args={[size/3, 6]} />
            <meshBasicMaterial 
              color={Math.random() > 0.92 ? "#14F195" : "#9945FF"} 
              transparent 
              opacity={opacity}
              wireframe={Math.random() > 0.7}
            />
          </mesh>
        );
      }
    }
    
    return hexGroup;
  }, []);
  
  // Animated data flows
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle floating motion
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.05;
    }
    
    if (hexagonsRef.current) {
      // Subtle pulsing
      hexagonsRef.current.children.forEach((hex, i) => {
        hex.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.5 + i * 0.1) * 0.1;
      });
    }
    
    if (dataFlowRef.current) {
      // Move data points upward
      dataFlowRef.current.children.forEach((point) => {
        point.position.y += 0.01;
        point.material.opacity -= 0.005;
        
        // Reset when out of view
        if (point.position.y > 10 || point.material.opacity <= 0) {
          point.position.y = -10 + Math.random() * 5;
          point.position.x = Math.random() * 20 - 10;
          point.position.z = -10 - Math.random() * 10;
          point.material.opacity = 0.5 + Math.random() * 0.5;
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Studio background wall */}
      <mesh position={[0, 0, -20]} rotation={[0, 0, 0]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color="#080016" />
      </mesh>
      
      {/* Solana logo */}
      <SolanaLogo position={[0, 6, -15]} scale={3} />
      
      {/* Solana theme color bars */}
      <mesh position={[-10, 0, -18]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[20, 0.5]} />
        <meshBasicMaterial color="#9945FF" />
      </mesh>
      
      <mesh position={[10, 0, -18]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[20, 0.5]} />
        <meshBasicMaterial color="#14F195" />
      </mesh>
      
      {/* Hexagon grid background */}
      <group ref={hexagonsRef}>
        {hexagons}
      </group>
      
      {/* Animated data flow particles */}
      <group ref={dataFlowRef}>
        {Array.from({ length: 100 }).map((_, i) => (
          <mesh 
            key={`data-${i}`} 
            position={[
              Math.random() * 30 - 15, 
              Math.random() * 20 - 10, 
              -15 - Math.random() * 5
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial 
              color={Math.random() > 0.5 ? "#14F195" : "#9945FF"} 
              transparent 
              opacity={Math.random() * 0.5 + 0.1}
            />
          </mesh>
        ))}
      </group>
      
      {/* Bottom reflective surface */}
      <Plane
        args={[50, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <meshPhysicalMaterial
          color="#000000"
          metalness={0.9}
          roughness={0.1}
          reflectivity={1}
          clearcoat={1}
          side={THREE.DoubleSide}
        />
      </Plane>
    </group>
  );
};

// Futuristic floating shapes
const FloatingGeometry = () => {
  const geometry1 = useRef();
  const geometry2 = useRef();
  const geometry3 = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (geometry1.current) {
      geometry1.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      geometry1.current.rotation.y = t * 0.1;
    }
    
    if (geometry2.current) {
      geometry2.current.rotation.x = Math.sin(t * 0.15) * 0.3;
      geometry2.current.rotation.y = t * -0.1;
    }
    
    if (geometry3.current) {
      geometry3.current.rotation.z = Math.cos(t * 0.1) * 0.2;
      geometry3.current.rotation.y = t * 0.05;
    }
  });
  
  return (
    <group>
      {/* Floating torus - Solana purple */}
      <mesh ref={geometry1} position={[-3, 2, -2]}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshPhysicalMaterial 
          color="#9945FF" 
          roughness={0.1} 
          metalness={0.8}
          transmission={0.5}
          emissive="#9945FF"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Abstract geometric shape - Solana green */}
      <mesh ref={geometry2} position={[3, 2, -3]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          color="#14F195" 
          roughness={0.1} 
          metalness={0.9}
          transmission={0.6}
          emissive="#14F195"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Blob-like shape - Solana teal */}
      <mesh ref={geometry3} position={[0, 3, -4]}>
        <octahedronGeometry args={[0.8, 2]} />
        <meshPhysicalMaterial 
          color="#00C2FF" 
          roughness={0.1} 
          metalness={0.8}
          clearcoat={1}
          transmission={0.4}
          emissive="#00C2FF"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
};

// Ambient particles for atmosphere
const AmbientParticles = () => {
  return (
    <>
      <Sparkles 
        count={100} 
        scale={10} 
        size={1} 
        speed={0.3} 
        opacity={0.2} 
        color={"#9945FF"} 
      />
      <Sparkles 
        count={50} 
        scale={12}
        size={2} 
        speed={0.2} 
        opacity={0.1}
        color={"#14F195"} 
      />
    </>
  );
};

export const Experience = () => {
  const cameraControlsRef = useRef(null);
  const { cameraZoomed } = useChat();
  const { scene } = useThree();

  // Set initial camera position safely
  useEffect(() => {
    // Delay camera setup to ensure the ref is attached
    const timer = setTimeout(() => {
      if (cameraControlsRef.current) {
        try {
          // Adjusted initial position to ensure avatar is visible
          cameraControlsRef.current.setLookAt(0, 1.5, 3, 0, 1.5, 0, true);
          // Force an immediate update
          cameraControlsRef.current.update(0);
        } catch (error) {
          console.error("Error setting camera position:", error);
        }
      }
    }, 300); // Increased delay to ensure ref is attached
    
    return () => clearTimeout(timer);
  }, []);

  // Safe zooming with error handling
  useEffect(() => {
    // Exit early if camera controls aren't ready
    if (!cameraControlsRef.current) return;
    
    // Create a cleanup function for the timeline
    let timeline;
    
    try {
      // Store ref to current controls to handle unmounting
      const controls = cameraControlsRef.current;
      
      // Target positions for zoomed and unzoomed states - adjusted for better visibility
      const zoomedPosition = { x: 0, y: 1.5, z: 1.5, targetX: 0, targetY: 1.5, targetZ: 0 };
      const unzoomedPosition = { x: 0, y: 1.7, z: 3.5, targetX: 0, targetY: 1.5, targetZ: 0 };
      
      if (!controls._camera || !controls._targetEnd) {
        console.error("Camera or target not initialized");
        return;
      }
      
      // Current camera positions
      const currentPosition = { 
        x: controls._camera.position.x || 0,
        y: controls._camera.position.y || 1.5,
        z: controls._camera.position.z || 3,
        targetX: controls._targetEnd.x || 0,
        targetY: controls._targetEnd.y || 1.5,
        targetZ: controls._targetEnd.z || 0
      };
      
      // Target position based on zoom state
      const targetPosition = cameraZoomed ? zoomedPosition : unzoomedPosition;
      
      // Animation timeline
      timeline = gsap.timeline();
      
      // Use GSAP for smooth camera transition with error handling
      timeline.to(currentPosition, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        targetX: targetPosition.targetX,
        targetY: targetPosition.targetY,
        targetZ: targetPosition.targetZ,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
          // Check if controls still exists before updating
          if (controls && typeof controls.setLookAt === 'function') {
            try {
              // Update camera position and target during animation
              controls.setLookAt(
                currentPosition.x,
                currentPosition.y,
                currentPosition.z,
                currentPosition.targetX,
                currentPosition.targetY,
                currentPosition.targetZ,
                false // false to not animate within setLookAt (GSAP is handling the animation)
              );
            } catch (error) {
              console.error("Error updating camera:", error);
              // Kill the animation if there's an error
              timeline.kill();
            }
          }
        }
      });
      
      // Add subtle fog when zoomed out
      if (scene && scene.fog) {
        if (!cameraZoomed) {
          gsap.to(scene.fog, {
            near: 7,
            far: 15,
            duration: 1.5
          });
        } else {
          gsap.to(scene.fog, {
            near: 15,
            far: 20,
            duration: 1.5
          });
        }
      } else if (scene) {
        scene.fog = new THREE.Fog(0x050010, cameraZoomed ? 15 : 7, cameraZoomed ? 20 : 15);
      }
    } catch (error) {
      console.error("Error in camera animation setup:", error);
    }
    
    // Cleanup function
    return () => {
      if (timeline) {
        timeline.kill();
      }
    };
  }, [cameraZoomed, scene]);

  return (
    <>
      <CameraControls ref={cameraControlsRef} makeDefault />
      
      {/* Futuristic Environment */}
      <color attach="background" args={["#050010"]} />
      <fog attach="fog" args={["#050010", 7, 15]} />
      
      {/* News Studio Background */}
      <NewsStudioBackground />
      
      {/* Animated environment elements */}
      <FloatingGeometry />
      <Stars radius={100} depth={50} count={2000} factor={4} fade />
      <AmbientParticles />
      
      {/* Suspense for loading components */}
      <Suspense fallback={null}>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      
      {/* Main avatar */}
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>
      
      {/* Lighting and shadows - Solana themed colors */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.7} 
        castShadow 
      />
      <spotLight 
        position={[0, 5, 2]} 
        intensity={1.5} 
        penumbra={0.7} 
        angle={0.6} 
        castShadow 
        shadow-bias={-0.0001}
        color="#9945FF" // Solana purple
      />
      <spotLight 
        position={[-5, 3, 5]} 
        intensity={1} 
        penumbra={0.7} 
        angle={0.6} 
        castShadow 
        color="#14F195" // Solana green
      />
      <ContactShadows 
        opacity={0.6} 
        scale={10} 
        blur={1} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </>
  );
};
