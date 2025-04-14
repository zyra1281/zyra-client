import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { NewsModal } from "./NewsModal";
import PumpFunChat from "./PumpFunChat";
import gsap from "gsap";
import { formatDistanceToNow } from "date-fns";

// User Guide Modal Component
const UserGuideModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-black/80 rounded-lg border border-[#14F195]/30 shadow-xl">
        <div className="sticky top-0 bg-black/90 p-4 border-b border-[#14F195]/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#14F195]">
            Solana AI Assistant Guide
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#14F195] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-[#00C2FF] font-bold text-lg mb-2">
              Getting Started
            </h3>
            <p className="text-white/80 mb-3">
              Welcome to the Solana AI Assistant, your professional companion
              for navigating the Solana ecosystem. This guide will help you
              understand all features available in this interface.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[#00C2FF] font-bold text-lg mb-2">
              Main Modes
            </h3>
            <div className="space-y-3">
              <div className="bg-black/40 p-3 rounded border border-[#9945FF]/20">
                <h4 className="text-[#9945FF] font-medium">Chat Mode</h4>
                <p className="text-white/80 text-sm">
                  Ask any questions about Solana, tokens, or market trends.
                  Simply type your query in the input field and press Enter or
                  click "Ask AI".
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-[#14F195]/20">
                <h4 className="text-[#14F195] font-medium">News Mode</h4>
                <p className="text-white/80 text-sm">
                  View and listen to the latest Solana news. Click on news items
                  to have them read aloud, or use the play/stop buttons to
                  control playback.
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-[#00C2FF]/20">
                <h4 className="text-[#00C2FF] font-medium">PumpFun Mode</h4>
                <p className="text-white/80 text-sm">
                  Access the PumpFun chat stream to see real-time messages from
                  the community. Click on messages to ask the AI about them.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[#00C2FF] font-bold text-lg mb-2">
              Controls & Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/40 p-3 rounded border border-white/10">
                <h4 className="text-white font-medium">Mode Toggle</h4>
                <p className="text-white/80 text-sm">
                  Switch between Chat, News, and PumpFun modes.
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-white/10">
                <h4 className="text-white font-medium">Camera Zoom</h4>
                <p className="text-white/80 text-sm">
                  Toggle between zoomed and default camera view.
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-white/10">
                <h4 className="text-white font-medium">Green Screen</h4>
                <p className="text-white/80 text-sm">
                  Activate green screen mode for streaming.
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-white/10">
                <h4 className="text-white font-medium">AI Insights</h4>
                <p className="text-white/80 text-sm">
                  View AI-generated market insights and token analysis.
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded border border-white/10">
                <h4 className="text-white font-medium">PumpFun Chat</h4>
                <p className="text-white/80 text-sm">
                  Always available at the bottom left. Expand or collapse as
                  needed.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#00C2FF] font-bold text-lg mb-2">
              Tips for Best Experience
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li>Be specific with your questions about Solana or crypto</li>
              <li>Use the News mode to stay updated on latest developments</li>
              <li>
                Expand the PumpFun chat to participate in the conversation
              </li>
              <li>Check AI Insights regularly for market sentiment analysis</li>
              <li>Toggle camera zoom for different visual perspectives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add new function to get Token mentions from saved messages
const countTokenMentions = (messages) => {
  const tokens = {
    SOL: 0,
    BONK: 0,
    JTO: 0,
    WIF: 0,
    JUP: 0,
    PYTH: 0,
    RAY: 0,
  };

  messages.forEach((msg) => {
    const text = msg.text.toUpperCase();
    Object.keys(tokens).forEach((token) => {
      if (text.includes(token)) {
        tokens[token]++;
      }
    });
  });

  return tokens;
};

// Add sentiment analysis function
const getOverallSentiment = (messages) => {
  let bullishCount = 0;
  let bearishCount = 0;

  const bullishTerms = [
    "moon",
    "pump",
    "bullish",
    "breakout",
    "buy",
    "bought",
    "long",
    "up",
  ];
  const bearishTerms = [
    "dump",
    "bearish",
    "crash",
    "decline",
    "negative",
    "sell",
    "selling",
    "short",
    "dip",
    "down",
  ];

  messages.forEach((msg) => {
    const text = msg.text.toLowerCase();

    bullishTerms.forEach((term) => {
      if (text.includes(term)) bullishCount++;
    });

    bearishTerms.forEach((term) => {
      if (text.includes(term)) bearishCount++;
    });
  });

  if (bullishCount > bearishCount * 1.5)
    return { sentiment: "Bullish", score: 2 };
  if (bullishCount > bearishCount)
    return { sentiment: "Slightly Bullish", score: 1 };
  if (bearishCount > bullishCount * 1.5)
    return { sentiment: "Bearish", score: -2 };
  if (bearishCount > bullishCount)
    return { sentiment: "Slightly Bearish", score: -1 };
  return { sentiment: "Neutral", score: 0 };
};

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const headerRef = useRef();
  const controlsRef = useRef();
  const inputContainerRef = useRef();
  const newsContainerRef = useRef();
  const [animationsInitialized, setAnimationsInitialized] = useState(false);
  const {
    chat,
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    mode,
    setMode,
    news,
    fetchNews,
    readNewsWithTTS,
    isReading,
    musicPlaying,
    toggleMusic,
    showNewsModal,
    setShowNewsModal,
    showPumpFunModal,
    setShowPumpFunModal,
    readAllNews,
    stopReading,
    hasElevenLabsKey,
    marketInsights,
    aiSuggestions,
    sentimentAnalysis,
    getTokenInsights,
    // PumpFun auto chat functions
    pumpFunChats,
    startAutoChatFromPumpFun,
    stopAutoChatFromPumpFun,
    isAutoChattingFromPumpFun,
    savedPumpFunMessages,
    analyzeSavedPumpFunMessages,
    // Input visibility control
    hideInputElements,
    setHideInputElements,
  } = useChat();

  // State for AI insights sidebar
  const [showInsightsSidebar, setShowInsightsSidebar] = useState(false);

  // State for user guide
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Add state for PumpFun sidebar (always visible)
  const [showPumpFunSidebar] = useState(true); // Always true by default

  // Check if this is first time visit and show guide
  useEffect(() => {
    // Check local storage for first visit flag
    const hasVisitedBefore = localStorage.getItem("hasVisitedSolanaAI");

    if (!hasVisitedBefore) {
      // Set timeout to show user guide after UI loads
      const timer = setTimeout(() => {
        setShowUserGuide(true);
        localStorage.setItem("hasVisitedSolanaAI", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Add a function to do a direct API check
  const testApiConnection = async () => {
    console.log("========= TESTING API CONNECTION DIRECTLY =========");

    // Test different CORS proxies
    const corsProxies = [
      "https://corsproxy.io/?",
      "https://cors-anywhere.herokuapp.com/",
      "https://api.allorigins.win/raw?url=",
    ];

    for (const proxy of corsProxies) {
      try {
        const coinId = "AxSMXaM3KeQ3a6HDfGizJaRnzGqrDHJg3uyZbwZUpump";
        const testUrl = `${proxy}https://api.pump.fun/v1/coins/${coinId}`;

        console.log(`Testing CORS proxy: ${proxy}`);
        console.log(`Full test URL: ${testUrl}`);

        const testResponse = await fetch(testUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });

        console.log(
          `Test response status for ${proxy}: ${testResponse.status}`
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(`Success with ${proxy}:`, testData);
          break;
        } else {
          const errorText = await testResponse
            .text()
            .catch((e) => "Could not read error response");
          console.log(`Error response for ${proxy}:`, errorText);
        }
      } catch (error) {
        console.error(`Error testing ${proxy}:`, error);
      }
    }

    console.log("========= API CONNECTION TEST COMPLETED =========");
  };

  // Initialize GSAP animations with error handling
  useEffect(() => {
    if (animationsInitialized) return;

    try {
      // Make sure refs are attached
      if (
        !headerRef.current ||
        !controlsRef.current ||
        !inputContainerRef.current
      ) {
        console.warn("UI refs not ready yet, will retry animations");
        const timeout = setTimeout(() => setAnimationsInitialized(false), 100);
        return () => clearTimeout(timeout);
      }

      // Animate header from top
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      // Animate controls from right
      gsap.fromTo(
        controlsRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );

      // Animate input container from bottom
      gsap.fromTo(
        inputContainerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 }
      );

      setAnimationsInitialized(true);
    } catch (error) {
      console.error("Error initializing UI animations:", error);
    }
  }, [animationsInitialized]);

  // Animation for when camera zoom changes
  useEffect(() => {
    try {
      if (controlsRef.current && controlsRef.current.querySelector("button")) {
        gsap.to(controlsRef.current.querySelector("button"), {
          scale: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        });
      }
    } catch (error) {
      console.error("Error animating camera zoom button:", error);
    }
  }, [cameraZoomed]);

  // Animation for news container
  useEffect(() => {
    if (newsContainerRef.current && mode === "news") {
      gsap.fromTo(
        newsContainerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [mode, news]);

  // Start reading news when switching to news mode
  useEffect(() => {
    if (mode === "news" && news.length > 0 && !isReading) {
      // Auto-start reading all news after a brief delay
      const timer = setTimeout(() => {
        console.log("Auto-starting news reading");
        readAllNews();
      }, 800); // Longer delay to ensure news is loaded

      return () => clearTimeout(timer);
    }
  }, [mode, news, isReading, readAllNews]);

  // Monitor news reading status
  useEffect(() => {
    console.log("Reading status changed:", isReading);
  }, [isReading]);

  const sendMessage = () => {
    if (!input.current) return;

    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      try {
        // Animate input field when sending message
        gsap.fromTo(
          input.current,
          { scale: 1 },
          {
            scale: 1.03,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
            onComplete: () => {
              chat(text);
              input.current.value = "";
            },
          }
        );
      } catch (error) {
        console.error("Error animating send message:", error);
        chat(text);
        input.current.value = "";
      }
    }
  };

  // Toggle between chat, news, and pumpfun modes
  const toggleMode = () => {
    if (mode === "chat") {
      setMode("news");
      // Clear any ongoing chat to prepare for news reading
      if (message) {
        stopReading();
      }
    } else if (mode === "news") {
      setMode("pumpfun");
      // Stop any news reading when switching to PumpFun
      stopReading();
    } else {
      setMode("chat");
    }
  };

  // Format the published date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Function to format sentiment with appropriate styling
  const formatSentiment = (sentiment) => {
    switch (sentiment) {
      case "bullish":
        return <span className="text-[#14F195] font-medium">Bullish</span>;
      case "bearish":
        return <span className="text-red-400 font-medium">Bearish</span>;
      default:
        return <span className="text-[#00C2FF] font-medium">Neutral</span>;
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-6 flex-col pointer-events-none">
        {/* Solana-themed header */}
        <div
          ref={headerRef}
          className="self-start backdrop-blur-xl bg-black/40 p-5 rounded-md shadow-xl border border-[#14F195]/20 relative overflow-hidden max-w-md"
        >
          {/* Animated highlight border */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#14F195] to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C2FF] to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#9945FF] to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#14F195] to-transparent animate-[pulse_3s_ease-in-out_infinite]"></div>
          </div>

          <div className="relative z-10">
            <h1 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00C2FF] tracking-wider">
              ZYRA AI 
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse mr-2"></div>
                <p className="text-gray-300 text-sm tracking-wide">
                  {mode === "chat"
                    ? "24/7 ARL "
                    : mode === "news"
                    ? "CRYPTO NEWS ANALYZER"
                    : "SOCIAL PULSE MONITOR"}
                </p>
              </div>

              {/* AI Sentiment Indicator */}
              {marketInsights && (
                <div className="ml-6 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sentimentAnalysis === "bullish"
                        ? "bg-[#14F195]"
                        : sentimentAnalysis === "bearish"
                        ? "bg-red-400"
                        : "bg-[#00C2FF]"
                    } animate-pulse`}
                  ></div>
                  <span className="text-xs text-white/80">
                    SENTIMENT: {formatSentiment(sentimentAnalysis)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live indicator for news/pumpfun mode */}
        {(mode === "news" || mode === "pumpfun") && (
          <div className="absolute top-[90px] left-6 flex items-center gap-2 pointer-events-auto">
            <div
              className={`w-3 h-3 rounded-full ${
                mode === "news"
                  ? isReading
                    ? "bg-red-500 animate-pulse"
                    : "bg-red-500"
                  : "bg-[#9945FF] animate-pulse"
              }`}
            ></div>
            <span className="text-white font-medium text-sm">LIVE</span>
          </div>
        )}

        {/* Controls section */}
        <div
          ref={controlsRef}
          className="w-full flex flex-col items-end justify-center gap-4"
        >
          <div className="flex gap-3">
            {/* Mode Toggle Button - Updated to cycle through chat, news, and pumpfun */}
            <button
              onClick={toggleMode}
              className="pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-black/50 text-white p-4 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#00C2FF]/30 group"
            >
              <div className="relative">
                {mode === "chat" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 group-hover:text-[#00C2FF] transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                    />
                  </svg>
                ) : mode === "news" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 group-hover:text-[#00C2FF] transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 group-hover:text-[#9945FF] transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                )}
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-[#00C2FF]/10 animate-pulse transition-opacity"></div>
              </div>
            </button>

            {/* Zoom Button */}
            <button
              onClick={() => setCameraZoomed(!cameraZoomed)}
              className="pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-black/50 text-white p-4 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#9945FF]/30 group"
            >
              <div className="relative">
                {cameraZoomed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 group-hover:text-[#9945FF] transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 group-hover:text-[#9945FF] transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6v3h6v-3z"
                    />
                  </svg>
                )}
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-[#9945FF]/10 animate-pulse transition-opacity"></div>
              </div>
            </button>

            {/* Green Screen Button */}
            <button
              onClick={(event) => {
                try {
                  const body = document.querySelector("body");
                  if (body.classList.contains("greenScreen")) {
                    body.classList.remove("greenScreen");
                  } else {
                    body.classList.add("greenScreen");
                  }
                  // Add GSAP animation for button
                  gsap.to(event.currentTarget, {
                    rotate: 360,
                    duration: 0.6,
                    ease: "power1.inOut",
                  });
                } catch (error) {
                  console.error("Error toggling green screen:", error);
                }
              }}
              className="pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-black/50 text-white p-4 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#14F195]/30 group"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:text-[#14F195] transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-[#14F195]/10 animate-pulse transition-opacity"></div>
              </div>
            </button>

            {/* AI Insights Button */}
            <button
              onClick={() => setShowInsightsSidebar(!showInsightsSidebar)}
              className="pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-black/50 text-white p-4 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#14F195]/30 group"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:text-[#14F195] transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                  />
                </svg>
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-[#14F195]/10 animate-pulse transition-opacity"></div>
              </div>
            </button>

            {/* User Guide Help Button - NEW */}
            <button
              onClick={() => setShowUserGuide(true)}
              className="pointer-events-auto bg-black/40 backdrop-blur-md hover:bg-black/50 text-white p-4 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 border border-[#00C2FF]/30 group"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:text-[#00C2FF] transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-[#00C2FF]/10 animate-pulse transition-opacity"></div>
              </div>
            </button>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        {showInsightsSidebar && (
          <div className="fixed right-0 top-0 h-full w-80 bg-black/80 backdrop-blur-md pointer-events-auto z-50 border-l border-[#14F195]/20 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#14F195]">
                  AI Market Insights
                </h2>
                <button
                  onClick={() => setShowInsightsSidebar(false)}
                  className="text-white hover:text-[#14F195] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {marketInsights ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          sentimentAnalysis === "bullish"
                            ? "bg-[#14F195]"
                            : sentimentAnalysis === "bearish"
                            ? "bg-red-400"
                            : "bg-[#00C2FF]"
                        }`}
                      ></div>
                      <h3 className="text-white font-medium">
                        Market Sentiment
                      </h3>
                    </div>
                    <p className="text-white/80 ml-5">
                      {marketInsights.summary}
                    </p>
                    <p className="text-white/80 ml-5 mt-2">
                      {marketInsights.marketImpact}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-2">
                      Trending Topics
                    </h3>
                    <ul className="space-y-2">
                      {marketInsights.trending.map((topic, index) => (
                        <li
                          key={index}
                          className="bg-black/40 p-2 rounded border border-[#9945FF]/20 text-white/80 text-sm"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-2">
                      AI Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="bg-black/40 p-2 rounded border border-[#14F195]/20 text-white/80 text-sm flex items-start gap-2"
                        >
                          <span className="text-[#14F195]">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">
                      Tokens to Watch
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["SOL", "BONK", "JTO", "JUP"].map((token) => {
                        const insights = getTokenInsights(token);
                        return (
                          <div
                            key={token}
                            className="bg-black/40 p-2 rounded border border-[#00C2FF]/20 text-white/80 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold">{token}</span>
                              <span
                                className={`text-xs ${
                                  insights.sentiment === "bullish"
                                    ? "text-[#14F195]"
                                    : insights.sentiment === "bearish"
                                    ? "text-red-400"
                                    : "text-[#00C2FF]"
                                }`}
                              >
                                {insights.sentiment.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  No market insights available yet. Switch to news mode to
                  generate insights.
                </div>
              )}
            </div>
          </div>
        )}

        {/* News Container - only visible in news mode */}
        {mode === "news" && (
          <div
            ref={newsContainerRef}
            className="pointer-events-auto w-full max-w-screen-sm mx-auto mb-4 max-h-[50vh] overflow-y-auto rounded-md backdrop-blur-md bg-black/30 border border-[#00C2FF]/30 shadow-lg"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#00C2FF]">
                  Crypto News
                </h2>
                <div className="flex items-center gap-3">
                  {/* Read/Stop button */}
                  <button
                    onClick={isReading ? stopReading : readAllNews}
                    className={`p-2 rounded-md ${
                      isReading
                        ? "text-red-400 hover:text-red-300"
                        : "text-[#14F195] hover:text-[#14F195]/80"
                    } transition-colors`}
                  >
                    {isReading ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Fetch latest Solana news button */}
                  <button
                    onClick={fetchNews}
                    className="p-2 text-white hover:text-[#14F195] transition-colors flex items-center gap-1"
                    disabled={loading || isReading}
                    title="Get latest Solana news"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                      />
                    </svg>
                    <span className="text-xs">Solana News</span>
                  </button>

                  {/* Show full modal */}
                  <button
                    onClick={() => setShowNewsModal(true)}
                    className="p-2 text-white hover:text-[#00C2FF] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#14F195] border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No news found. Try refreshing.
                </div>
              ) : (
                <div className="space-y-4">
                  {news.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md bg-black/20 hover:bg-black/40 cursor-pointer transition-colors border border-white/5"
                      onClick={() =>
                        readNewsWithTTS(
                          item.title +
                            ". " +
                            (item.description || item.snippet || "")
                        )
                      }
                    >
                      <h3 className="text-[#14F195] font-medium mb-1">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-2 line-clamp-2">
                        {item.description || item.snippet || ""}
                      </p>
                      <div className="flex justify-between items-center text-xs text-white/50">
                        <span>{item.source || "Unknown source"}</span>
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                      {item.image_url && (
                        <div className="mt-2 h-24 overflow-hidden rounded">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      )}
                      {item.categories && item.categories.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {item.categories.map((category, catIndex) => (
                            <span
                              key={catIndex}
                              className="px-2 py-0.5 text-xs rounded-full bg-[#9945FF]/20 text-[#9945FF]"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat input container - only visible in chat mode and when not hidden */}
        {mode === "chat" && !hideInputElements && (
          <div
            ref={inputContainerRef}
            className="flex items-center gap-3 pointer-events-auto max-w-screen-sm w-full mx-auto"
          >
            <div className="relative w-full">
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00C2FF] opacity-30 blur-sm -z-10"></div>

              {loading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-[#9945FF] rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#14F195] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#00C2FF] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solana branding */}
        
      </div>

      {/* User Guide Modal */}
      {showUserGuide && (
        <UserGuideModal onClose={() => setShowUserGuide(false)} />
      )}

      {/* News Modal */}
      {showNewsModal && <NewsModal onClose={() => setShowNewsModal(false)} />}

      {/* PumpFun Chat Modal */}
      {showPumpFunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPumpFunModal(false)}
          ></div>
          <div className="w-full max-w-2xl max-h-[80vh] relative bg-black/80 rounded-lg border border-[#14F195]/30 overflow-auto">
            <div className="sticky top-0 bg-black/90 p-4 border-b border-[#14F195]/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#14F195]">
                PumpFun Messages
              </h2>
              <button
                onClick={() => setShowPumpFunModal(false)}
                className="text-white hover:text-[#14F195]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  AI Auto-Respond to PumpFun Chat
                </h3>
                <p className="text-gray-300 text-sm">
                  Your AI assistant can automatically respond to PumpFun
                  messages and provide analysis.
                </p>
                <div className="flex space-x-2 mt-2">
                  {isAutoChattingFromPumpFun ? (
                    <button
                      onClick={stopAutoChatFromPumpFun}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                      Stop Auto Responding
                    </button>
                  ) : (
                    <button
                      onClick={() => startAutoChatFromPumpFun(8000)} // Auto chat every 8 seconds
                      className="px-4 py-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                      Start Auto Responding
                    </button>
                  )}
                </div>
              </div>

              {savedPumpFunMessages.length > 0 && (
                <div className="mb-4 p-3 bg-black/40 rounded-lg border border-[#14F195]/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-white">
                      Saved Messages Analysis
                    </h3>
                    <button
                      onClick={analyzeSavedPumpFunMessages}
                      className="text-xs bg-[#9945FF] hover:bg-[#8035DF] text-white px-2 py-1 rounded"
                    >
                      Analyze All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 p-2 rounded">
                      <h4 className="text-xs text-[#14F195] mb-1">Sentiment</h4>
                      <div className="text-sm font-semibold">
                        {getOverallSentiment(savedPumpFunMessages).sentiment}
                      </div>
                    </div>

                    <div className="bg-black/30 p-2 rounded">
                      <h4 className="text-xs text-[#14F195] mb-1">
                        Top Tokens
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(
                          countTokenMentions(savedPumpFunMessages)
                        )
                          .filter(([_, count]) => count > 0)
                          .sort(([_, countA], [__, countB]) => countB - countA)
                          .slice(0, 3)
                          .map(([token, count]) => (
                            <span
                              key={token}
                              className="text-xs bg-[#14F195]/20 px-1 rounded"
                            >
                              {token}: {count}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {savedPumpFunMessages.length} messages saved. The AI can
                    analyze these for trends.
                  </div>
                </div>
              )}

              <div className="border-t border-[#14F195]/20 pt-4 h-[400px]">
                <PumpFunChat tokenId="AxSMXaM3KeQ3a6HDfGizJaRnzGqrDHJg3uyZbwZUpump" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="z-10 absolute top-6 right-6 backdrop-blur-xl bg-black/40 p-3 rounded-md shadow-xl border border-[#9945FF]/20 pointer-events-auto">
        <p className="text-sm font-medium">
          <span className="text-white/80">powered by</span>
          <a href="https://solavatar.fun" className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00C2FF] ml-1.5 font-bold">
            SOLAVATAR
          </a>
        </p>
      </div>
      {/* Fixed PumpFunChat sidebar */}
      {showPumpFunSidebar && (
        <div className="fixed bottom-24 left-6 md:bottom-6 md:left-6 z-20 w-80 pointer-events-auto">
          <PumpFunChat tokenId="AxSMXaM3KeQ3a6HDfGizJaRnzGqrDHJg3uyZbwZUpump" />
        </div>
      )}
    </>
  );
};
