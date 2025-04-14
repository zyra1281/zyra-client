import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import "./index.css";

// Set app title and metadata for crypto AI agent
document.title = "Solana AI Agent | Crypto & DeFi News";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Advanced AI agent providing real-time Solana and crypto news, pump.fun livestream integration, and blockchain insights';
document.head.appendChild(metaDescription);

// Add keywords for crypto focus
const metaKeywords = document.createElement('meta');
metaKeywords.name = 'keywords';
metaKeywords.content = 'Solana, cryptocurrency, blockchain, crypto news, AI agent, DeFi, pump.fun, Web3';
document.head.appendChild(metaKeywords);

// Set theme color for browser UI
const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#9945FF'; // Solana Purple
document.head.appendChild(metaThemeColor);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
