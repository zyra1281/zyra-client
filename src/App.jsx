import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { AudioButtons } from "./components/AudioButtons";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import React from "react";

// AI Agent context for crypto data tracking
export const CryptoContext = React.createContext({});

function App() {
  const canvasContainerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [cryptoData, setCryptoData] = useState({
    solanaPrice: null,
    marketTrend: 'neutral',
    recentTrades: [],
    hotTokens: [],
    lastUpdated: null
  });

  // Simulate fetching crypto market data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // In a real app, you would fetch from actual crypto APIs
        // This is a simulation
        setCryptoData({
          solanaPrice: "$146.72",
          marketTrend: Math.random() > 0.5 ? 'bullish' : 'bearish',
          recentTrades: [
            { token: "SOL", price: "$146.72", change: "+3.2%" },
            { token: "BONK", price: "$0.00002913", change: "+8.7%" },
            { token: "JTO", price: "$3.81", change: "-1.4%" }
          ],
          hotTokens: ["BONK", "JUP", "DOP", "WIF"],
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      }
    };

    // Fetch initial data
    fetchCryptoData();

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animate canvas container after loading
  useEffect(() => {
    // Shorter loading time to ensure content is visible
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Animate canvas container once loading is complete
      if (canvasContainerRef.current) {
        gsap.fromTo(
          canvasContainerRef.current,
          { opacity: 0.5, scale: 0.95 },
          { 
            opacity: 1, 
            scale: 1, 
            duration: 1, 
            ease: "power3.out"
          }
        );
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <CryptoContext.Provider value={{ cryptoData, setCryptoData }}>
      <Loader />
      <Leva hidden />
      <UI />
      <AudioButtons />
      <div 
        ref={canvasContainerRef} 
        className="w-full h-full"
      >
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1.5, 3], fov: 45 }}
          dpr={[1, 2]} // Responsive pixel ratio
        >
          <Experience />
        </Canvas>
      </div>
    </CryptoContext.Provider>
  );
}

export default App;
