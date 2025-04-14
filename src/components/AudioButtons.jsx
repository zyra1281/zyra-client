import { useState } from "react";
import { useChat } from "../hooks/useChat";

export const AudioButtons = () => {
  const { playAudioAction } = useChat();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  // Available actions
  const audioActions = [
    { name: "Intro" },
    { name: "Greet" },
    { name: "Dance" },
    { name: "Laugh" },
    { name: "Explain" },
    { name: "Celebrate" }
  ];

  const playAudio = async (action) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setActiveButton(action.name);
    
    try {
      // Use the hook's playAudioAction function
      const success = await playAudioAction(action.name);
      
      if (success) {
        // Reset UI state after estimated duration
        const duration = action.name === "Dance" ? 10000 : 4000;
        setTimeout(() => {
          setIsPlaying(false);
          setActiveButton(null);
        }, duration);
      } else {
        // If there was an issue playing the audio
        setIsPlaying(false);
        setActiveButton(null);
      }
    } catch (error) {
      console.error("Error playing action:", error);
      setIsPlaying(false);
      setActiveButton(null);
    }
  };

  return (
    <div className="fixed mt-10 top-4 right-4 flex flex-col space-y-2 z-50 bg-black/30 p-3 rounded-lg backdrop-blur-sm border border-white/10">
      <div className="text-center mb-1">
        <h3 className="text-[#14F195] font-medium text-sm">Avatar Actions</h3>
      </div>
      {audioActions.map((action) => (
        <button
          key={action.name}
          onClick={() => playAudio(action)}
          disabled={isPlaying}
          className={`px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
            activeButton === action.name
              ? "bg-[#9945FF] text-white shadow-lg shadow-[#9945FF]/30" 
              : isPlaying 
                ? "bg-gray-500 cursor-not-allowed text-white/70" 
                : "bg-[#14F195] hover:bg-[#0FD584] text-black hover:shadow-xl active:scale-95"
          }`}
        >
          {action.name}
          {activeButton === action.name && (
            <span className="ml-2 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="2" />
                <path d="M16 12 A4 4 0 0 1 12 16" />
                <path d="M19 12 A7 7 0 0 1 12 19" />
              </svg>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}; 