import { createContext, useContext, useEffect, useState, useRef } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
// TheNewsAPI key
const NEWS_API_KEY = "ZYiXyrAOH9VaomW6ROclH80pqkI87UnMe990WjQN";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [hideInputElements, setHideInputElements] = useState(false); // New state for hiding input elements
  
  const chat = async (message) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      const response = await data.json();
      const resp = response.messages;
      
      // Handle hideInputElements flag from backend
      if (response.hideInputElements !== undefined) {
        setHideInputElements(response.hideInputElements);
      }
      
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error("Error in chat function:", error);
    } finally {
      setLoading(false);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [mode, setMode] = useState('chat'); // 'chat', 'news', or 'pumpfun'
  const [news, setNews] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showPumpFunModal, setShowPumpFunModal] = useState(false);
  const currentNewsIndexRef = useRef(0);
  const isReadingAllRef = useRef(false);
  
  // PumpFun chat messages state
  const [pumpFunChats, setPumpFunChats] = useState([]);
  const [isAutoChattingFromPumpFun, setIsAutoChattingFromPumpFun] = useState(false);
  const autoChatIntervalRef = useRef(null);
  const [analyzingPumpFunMessage, setAnalyzingPumpFunMessage] = useState(false);
  
  // Saved interesting PumpFun messages
  const [savedPumpFunMessages, setSavedPumpFunMessages] = useState(() => {
    const saved = localStorage.getItem('savedPumpFunMessages');
    return saved ? JSON.parse(saved) : [];
  });
  
  // ElevenLabs API key state
  const [elevenLabsKey, setElevenLabsKeyState] = useState(() => {
    // Always use the API key from .env file or the environment variable
    return import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY || '';
  });

  // Check if we have an ElevenLabs API key
  const hasElevenLabsKey = Boolean(elevenLabsKey);
  
  // Function to set the ElevenLabs API key - keeping this in case it's used elsewhere,
  // but we'll primarily rely on the environment variable
  const setElevenLabsKey = (key) => {
    console.log("ElevenLabs API key from environment will be used instead of user input");
    // We're no longer storing this in localStorage
  };
  
  const onMessagePlayed = () => {
    // If we're reading all news articles sequentially, move to the next one
    if (isReadingAllRef.current && news.length > 0) {
      currentNewsIndexRef.current++;
      if (currentNewsIndexRef.current < news.length) {
        // Read the next article after a short pause
        setTimeout(() => {
          const nextArticle = news[currentNewsIndexRef.current];
          readNewsWithTTS(nextArticle.title + '. ' + (nextArticle.description || nextArticle.snippet || ''), false);
        }, 1000);
      } else {
        // Reset when all articles have been read
        currentNewsIndexRef.current = 0;
        isReadingAllRef.current = false;
      }
    }
    setMessages((messages) => messages.slice(1));
  };
  
  // Function to fetch crypto news using TheNewsAPI
  const fetchNews = async () => {
    setLoading(true);
    try {
      // Using TheNewsAPI with the provided key - focusing specifically on Solana news
      const response = await fetch(`https://api.thenewsapi.com/v1/news/all?api_token=${NEWS_API_KEY}&categories=tech,business,finance&search=solana+crypto+pumpfun&language=en&limit=20&sort=published_at&published_after=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
      
      // Backup API in case TheNewsAPI fails
      let data;
      
      if (!response.ok) {
        console.log("TheNewsAPI request failed, using backup API");
        // Fallback to free Crypto News API
        const backupResponse = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?categories=Solana,Blockchain,Crypto&excludeCategories=Sponsored&lang=EN&api_key=`);
        const backupData = await backupResponse.json();
        
        // Convert CryptoCompare format to match our expected format
        data = {
          data: backupData.Data.map(item => ({
            uuid: item.id,
            title: item.title,
            description: item.body,
            snippet: item.body.substring(0, 150) + '...',
            url: item.url,
            image_url: item.imageurl,
            language: 'en',
            published_at: new Date(item.published_on * 1000).toISOString(),
            source: item.source,
            categories: item.categories.split('|')
          }))
        };
      } else {
        data = await response.json();
      }
      
      console.log("Fetched news data:", data);
      
      // TheNewsAPI returns data in a different format
      const newsItems = data.data || [];
      setNews(newsItems);
      
      if (newsItems.length > 0) {
        // Process news for better TTS quality
        const solanaHighlights = newsItems
          .filter(item => 
            item.title.toLowerCase().includes('solana') || 
            (item.description && item.description.toLowerCase().includes('solana')) ||
            (item.snippet && item.snippet.toLowerCase().includes('solana'))
          )
          .slice(0, 5); // Focus on top 5 Solana-specific news
        
        const newsToRead = solanaHighlights.length > 0 ? solanaHighlights : [newsItems[0]];
        
        // Create a comprehensive summary for better text-to-speech
        let summaryText = "Here are the latest Solana and crypto highlights. ";
        
        newsToRead.forEach((article, index) => {
          summaryText += `News ${index + 1}: ${article.title}. `;
          const content = article.description || article.snippet || '';
          
          // Clean up the content for better TTS processing
          let cleanContent = content
            .replace(/\(Reuters\)/g, '')
            .replace(/\(AP\)/g, '')
            .replace(/\([^)]*\)/g, '') // Remove parentheses content
            .replace(/http\S+/g, '')    // Remove URLs
            .replace(/\s+/g, ' ')       // Replace multiple spaces with single space
            .trim();
            
          // Limit content length for TTS
          if (cleanContent.length > 300) {
            cleanContent = cleanContent.substring(0, 300) + '...';
          }
          
          summaryText += cleanContent + ' ';
        });
        
        // Add a closing statement
        summaryText += "That's all for today's Solana crypto news update.";
        
        console.log("Reading news summary:", summaryText);
        
        // Start the text-to-speech process
        readNewsWithTTS(summaryText, true);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Create a custom message for display in case of error
      const errorMessage = {
        text: "Unable to fetch crypto news at the moment. Please try again later.",
        animation: "Talk",
        facialExpression: "sad"
      };
      setMessages([errorMessage]);
    }
    setLoading(false);
  };
  
  // Function to read news using text-to-speech
  const readNewsWithTTS = async (text, isFirstArticle = true) => {
    setIsReading(true);
    
    // If this is the first article and we want to read all
    if (isFirstArticle) {
      currentNewsIndexRef.current = 0;
      isReadingAllRef.current = true;
    }
    
    try {
      // Create a message object similar to chat responses
      const newsMessage = {
        text: text,
        animation: "Talk",
        facialExpression: "default"
      };
      
      // Clear any existing messages to ensure this one gets processed
      setMessages([]);
      
      // Add slight delay to ensure messages array is cleared
      setTimeout(() => {
        // Add to messages queue to be processed by the avatar
        setMessages([newsMessage]);
        
        // Get the API key from environment variable
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY || '';
        
        // Always attempt to use ElevenLabs if API key exists in environment
        if (apiKey) {
          console.log("Using ElevenLabs for high-quality TTS");
          
          // Use one of ElevenLabs' premium voices - Rachel is one of their highest quality voices
          // Other premium options include: Adam, Antoni, Arnold, Bella, Callum, Charlotte, Clyde, Daniel, Dorothy, Ethan, Giovanni, Glinda, etc.
          const premiumVoiceId = 'Rachel'; // Premium high-quality voice
          
          fetch('https://api.elevenlabs.io/v1/text-to-speech/' + premiumVoiceId, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': apiKey
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_multilingual_v2', // Using the premium multilingual model for best quality
              voice_settings: {
                stability: 0.7,       // Increased stability for clearer voice
                similarity_boost: 0.8, // Higher similarity boost for more natural speech
                style: 1.0,           // Maximum style for expressive reading
                use_speaker_boost: true // Use speaker boost for better audio quality
              }
            })
          })
          .then(response => {
            if (!response.ok) {
              const statusText = response.statusText;
              console.error(`ElevenLabs API error: ${response.status} ${statusText}`);
              throw new Error(`ElevenLabs API request failed: ${response.status} ${statusText}`);
            }
            return response.blob();
          })
          .then(audioBlob => {
            console.log("ElevenLabs audio received:", audioBlob.size, "bytes");
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = function() {
              try {
                const base64data = reader.result.split(',')[1];
                // Update the message with audio
                setMessages(prev => {
                  if (prev.length > 0) {
                    const updatedMessage = {...prev[0], audio: base64data};
                    return [updatedMessage];
                  }
                  return prev;
                });
              } catch (error) {
                console.error("Error processing audio data:", error);
                // Fall back to browser speech
                useBrowserTTS(text);
              }
            };
            
            reader.onerror = function() {
              console.error("FileReader error:");
              // Fall back to browser speech
              useBrowserTTS(text);
            };
          })
          .catch(error => {
            console.error('Error with ElevenLabs TTS:', error);
            // Fall back to browser TTS
            useBrowserTTS(text);
          });
        } else {
          console.log("ElevenLabs API key not found, using browser TTS");
          useBrowserTTS(text);
        }
      }, 100);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      // Move to next article in case of error
      if (isReadingAllRef.current) {
        onMessagePlayed();
      } else {
        setIsReading(false);
      }
    }
  };
  
  // Helper function for browser-based TTS
  const useBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      // Split text into smaller chunks for better browser TTS handling
      const chunks = splitTextIntoChunks(text, 200);
      let chunkIndex = 0;
      
      const speakNextChunk = () => {
        if (chunkIndex < chunks.length) {
          const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
          utterance.rate = 0.9;  // Slightly slower rate
          utterance.pitch = 1;
          
          utterance.onend = () => {
            chunkIndex++;
            if (chunkIndex < chunks.length) {
              speakNextChunk();
            } else {
              // All chunks finished
              if (isReadingAllRef.current) {
                onMessagePlayed();
              } else {
                setIsReading(false);
              }
            }
          };
          
          window.speechSynthesis.speak(utterance);
        }
      };
      
      speakNextChunk();
    }
  };
  
  // Helper function to split text into manageable chunks for browser TTS
  const splitTextIntoChunks = (text, maxLength) => {
    const chunks = [];
    let currentChunk = "";
    
    // Split by sentences to keep natural breaks
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length < maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };
  
  // Read all news articles in sequence
  const readAllNews = () => {
    if (news.length === 0 || isReading) return;
    
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Clear existing messages
    setMessages([]);
    
    // Reset reading state
    currentNewsIndexRef.current = 0;
    isReadingAllRef.current = true;
    
    // Add slight delay to ensure UI is updated
    setTimeout(() => {
      if (news.length > 0) {
        const firstArticle = news[0];
        const articleText = firstArticle.title + '. ' + (firstArticle.description || firstArticle.snippet || '');
        console.log("Starting to read news:", articleText);
        readNewsWithTTS(articleText, true);
      }
    }, 300);
  };
  
  // Stop reading news
  const stopReading = () => {
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    isReadingAllRef.current = false;
    setIsReading(false);
    setMessages([]);
  };

  // Handle messages change
  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
      if (isReadingAllRef.current && !isReading) {
        isReadingAllRef.current = false;
      }
    }
  }, [messages, isReading]);
  
  // Fetch news when switching to news mode
  useEffect(() => {
    if (mode === 'news') {
      fetchNews();
    } else if (mode === 'pumpfun') {
      // When switching to pumpfun mode, fetch chats and show the modal
      fetchPumpFunChats();
      setShowPumpFunModal(true);
    } else {
      // Stop reading when switching back to chat mode
      stopReading();
      // Stop auto chatting when switching away from pumpfun mode
      stopAutoChatFromPumpFun();
    }
  }, [mode]);

  // Enhanced AI assistant capabilities - crypto market insights
  const [marketInsights, setMarketInsights] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState("neutral");
  
  // Generate market insights based on news data
  useEffect(() => {
    if (news.length > 0) {
      // This would ideally call a backend service that analyzes news content
      // For demo purposes, we're generating mock insights
      const generateInsights = () => {
        const allTitles = news.map(item => item.title).join(' ');
        const allContent = news.map(item => item.description || item.snippet || '').join(' ');
        
        // Simple sentiment analysis based on keywords
        const bullishWords = ['surge', 'rally', 'gain', 'jump', 'positive', 'bullish', 'uptrend', 'breakout'];
        const bearishWords = ['drop', 'fall', 'crash', 'decline', 'negative', 'bearish', 'downtrend', 'correction'];
        
        let bullishCount = 0;
        let bearishCount = 0;
        
        bullishWords.forEach(word => {
          const regex = new RegExp(word, 'gi');
          bullishCount += (allContent.match(regex) || []).length;
        });
        
        bearishWords.forEach(word => {
          const regex = new RegExp(word, 'gi');
          bearishCount += (allContent.match(regex) || []).length;
        });
        
        const newSentiment = bullishCount > bearishCount ? "bullish" : 
                             bearishCount > bullishCount ? "bearish" : "neutral";
        
        // Generate AI insights
        const insights = {
          summary: `Based on ${news.length} recent articles, the overall Solana sentiment appears ${newSentiment}.`,
          trending: news.slice(0, 3).map(item => item.title),
          marketImpact: newSentiment === "bullish" ? "Potential positive price movement expected." : 
                        newSentiment === "bearish" ? "Caution advised, market may experience volatility." : 
                        "Market conditions appear stable at the moment."
        };
        
        // Generate AI suggestions based on sentiment
        const suggestions = [
          newSentiment === "bullish" ? "Consider monitoring DeFi protocols on Solana for opportunities." : 
          newSentiment === "bearish" ? "Consider diversifying portfolio to mitigate potential risks." :
          "Stay informed on latest protocol developments while market stabilizes.",
          
          "Track social sentiment on pump.fun for retail investor activity.",
          "Monitor Solana network activity for transaction volume trends."
        ];
        
        setMarketInsights(insights);
        setAiSuggestions(suggestions);
        setSentimentAnalysis(newSentiment);
      };
      
      generateInsights();
    }
  }, [news]);
  
  // Function to get AI insights about a token or trend
  const getTokenInsights = (tokenSymbol) => {
    // In a real app, this would fetch actual data from APIs
    // For demo purposes, returning mock data
    const mockInsights = {
      SOL: {
        description: "Solana is a high-performance blockchain supporting smart contracts and decentralized applications.",
        sentiment: sentimentAnalysis,
        recentDevelopments: "Solana has been experiencing increased adoption in DeFi and NFT sectors.",
        recommendation: sentimentAnalysis === "bullish" ? 
          "Technical indicators suggest continued upward momentum" : 
          sentimentAnalysis === "bearish" ? 
            "Consider defensive positioning until market stabilizes" : 
            "Neutral market conditions suggest maintaining current positions"
      },
      BONK: {
        description: "Bonk is a popular meme token on the Solana blockchain.",
        sentiment: "bullish",
        recentDevelopments: "Increased community activity and new listings on exchanges.",
        recommendation: "High volatility asset with significant social momentum"
      },
      JTO: {
        description: "Jito is a Solana-based liquid staking protocol.",
        sentiment: "neutral",
        recentDevelopments: "Steady growth in total value locked (TVL).",
        recommendation: "Strong fundamentals with growing protocol adoption"
      }
    };
    
    return mockInsights[tokenSymbol] || {
      description: `${tokenSymbol} is a token in the crypto ecosystem.`,
      sentiment: "unknown",
      recentDevelopments: "Limited recent data available.",
      recommendation: "Insufficient data for analysis"
    };
  };

  // Enhanced chat function with crypto features
  const enhancedChat = async (message) => {
    setLoading(true);
    
    try {
      // Special handling for PumpFun messages
      if (message.startsWith('[PumpFun Message]')) {
        // Extract the actual content
        const pumpFunContent = message.replace('[PumpFun Message]', '').trim();
        
        // Create a message object with special handling for PumpFun content
        const pumpFunResponse = {
          text: `I noticed someone in the PumpFun chat said: ${pumpFunContent}. ${generatePumpFunResponse(pumpFunContent)}`,
          animation: "Talk",
          facialExpression: "default"
        };
        
        // Add response to message queue
        setMessages((messages) => [...messages, pumpFunResponse]);
        setLoading(false);
        return;
      }
      
      // Check if the message is asking about a specific token
      const tokenPattern = /\b(SOL|BONK|JTO|JUP|WIF|PYTH|RAY|RENDER|SRM|MSOL)\b/gi;
      const matches = message.match(tokenPattern);
      
      if (matches && matches.length > 0) {
        // Get unique tokens mentioned
        const tokens = [...new Set(matches.map(match => match.toUpperCase()))];
        const insights = tokens.map(token => getTokenInsights(token));
        
        // Generate specialized response if token insights are available
        const tokenResponses = insights.map((insight, index) => ({
          text: `${tokens[index]}: ${insight.description} Current sentiment: ${insight.sentiment}. ${insight.recentDevelopments} Analyst view: ${insight.recommendation}`,
          animation: "Talk",
          facialExpression: insight.sentiment === "bullish" ? "happy" : 
                           insight.sentiment === "bearish" ? "sad" : "default"
        }));
        
        // Add responses to message queue
        setMessages((messages) => [...messages, ...tokenResponses]);
        setLoading(false);
        return;
      }
      
      // Process normal chat if no tokens are mentioned
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      const response = await data.json();
      const resp = response.messages;
      
      // Handle hideInputElements flag
      if (response.hideInputElements !== undefined) {
        setHideInputElements(response.hideInputElements);
      }
      
      setMessages((messages) => [...messages, ...resp]);
      setLoading(false);
      
      return resp;
    } catch (error) {
      console.error("Error in enhanced chat:", error);
      setLoading(false);
      return [];
    }
  };
  
  // Helper function to generate responses to PumpFun messages
  const generatePumpFunResponse = (message) => {
    // Extract user if present in the format "user: message"
    let userPart = "";
    const userMatch = message.match(/^([^:]+):/);
    if (userMatch) {
      userPart = `${userMatch[1]} asked: `;
      message = message.replace(userMatch[0], '').trim();
    }
    
    // Extract key terms that might be present in PumpFun chats
    const bullishTerms = ['moon', 'pump', 'bullish', 'breakout', 'buy', 'bought', 'long'];
    const bearishTerms = ['dump', 'bearish', 'crash', 'sell', 'selling', 'short', 'dip'];
    const volumeTerms = ['volume', 'activity', 'liquidity'];
    const technicalTerms = ['chart', 'pattern', 'support', 'resistance', 'trend'];
    
    // Count term occurrences in message
    const message_lower = message.toLowerCase();
    const hasBullish = bullishTerms.some(term => message_lower.includes(term));
    const hasBearish = bearishTerms.some(term => message_lower.includes(term));
    const hasVolume = volumeTerms.some(term => message_lower.includes(term));
    const hasTechnical = technicalTerms.some(term => message_lower.includes(term));
    
    // Generate appropriate contextual response based on the content
    if (hasBullish) {
      return [
        "The sentiment does seem bullish. I've noticed increasing social volume on this token recently.",
        "Based on my analysis, there is indeed growing momentum for this asset across multiple platforms.",
        "I've been tracking similar positive sentiment across other social channels too.",
        "The bullish sentiment aligns with the recent price action, but remember to manage your risk exposure."
      ][Math.floor(Math.random() * 4)];
    } else if (hasBearish) {
      return [
        "I'd recommend caution during this volatility. Market conditions can change rapidly.",
        "While there's some bearish sentiment, the on-chain metrics still show strong fundamentals.",
        "Temporary dips are normal in crypto markets. Focus on longer-term trends rather than short-term fluctuations.",
        "It's important to distinguish between normal price action and actual concerning developments."
      ][Math.floor(Math.random() * 4)];
    } else if (hasVolume) {
      return [
        "Volume is indeed a key indicator to watch. Higher volumes typically validate price movements.",
        "I'm seeing significant volume across multiple exchanges for this token right now.",
        "The increased volume suggests growing market interest, which often precedes major price movements.",
        "Volume patterns are showing increased institutional participation in this token recently."
      ][Math.floor(Math.random() * 4)];
    } else if (hasTechnical) {
      return [
        "The technical indicators are showing interesting patterns. MACD is crossing with positive divergence.",
        "Chart patterns can provide insights, but don't forget to look at fundamentals as well.",
        "There's notable accumulation happening at key support levels based on recent wallet analysis.",
        "The current technical setup displays similarities to previous breakout patterns we've seen."
      ][Math.floor(Math.random() * 4)];
    } else {
      return [
        "Interesting perspective from the PumpFun community. I'm analyzing various sources to provide a balanced view.",
        "The community sentiment is valuable to track alongside technical and fundamental analysis.",
        "I'm monitoring social sentiment across platforms to identify emerging trends in real-time.",
        "Social signals often precede price movements. I'm correlating this with other market indicators."
      ][Math.floor(Math.random() * 4)];
    }
  };

  // Fetch PumpFun chats
  const fetchPumpFunChats = async () => {
    // In a real implementation, you would fetch from the actual PumpFun API
    // For demo purposes, we're using mock data
    const mockPumpFunChats = [
      { id: 1, text: "Is SOL going to hit $500 this cycle?", user: "SolanaWhale" },
      { id: 2, text: "BONK looking bullish with this volume!", user: "MemeHunter" },
      { id: 3, text: "What do you think about the latest JTO tokenomics?", user: "DefiExplorer" },
      { id: 4, text: "Are we expecting a correction after this pump?", user: "CryptoTrader" },
      { id: 5, text: "Do you think we're still early for Solana NFTs?", user: "NFTCollector" },
      { id: 6, text: "How will the Bitcoin ETF affect Solana ecosystem?", user: "MacroAnalyst" },
      { id: 7, text: "The chart for SOL is showing a cup and handle pattern", user: "TechAnalyst" },
      { id: 8, text: "What's your prediction for JUP token after airdrop?", user: "AirdropHunter" },
      { id: 9, text: "PumpFun token when? The volume is insane!", user: "TokenSpeculator" },
      { id: 10, text: "Are we experiencing a liquidity crisis on DEXes?", user: "LiquidityProvider" },
      { id: 11, text: "WIF is mooning again, any thoughts?", user: "DogeLover" },
      { id: 12, text: "Does anyone think the recent Solana outage will affect price?", user: "NetworkWatcher" }
    ];
    
    setPumpFunChats(mockPumpFunChats);
    return mockPumpFunChats;
  };
  
  // Get a random PumpFun chat message
  const getRandomPumpFunChat = () => {
    if (pumpFunChats.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pumpFunChats.length);
    return pumpFunChats[randomIndex];
  };
  
  // Start auto chatting from PumpFun messages
  const startAutoChatFromPumpFun = (intervalMs = 10000) => {
    if (isAutoChattingFromPumpFun) return;
    
    // Ensure we have PumpFun messages
    if (pumpFunChats.length === 0) {
      fetchPumpFunChats().then(() => {
        setIsAutoChattingFromPumpFun(true);
        processRandomPumpFunChat();
        
        // Set up interval for periodic random chats
        autoChatIntervalRef.current = setInterval(processRandomPumpFunChat, intervalMs);
      });
    } else {
      setIsAutoChattingFromPumpFun(true);
      processRandomPumpFunChat();
      
      // Set up interval for periodic random chats
      autoChatIntervalRef.current = setInterval(processRandomPumpFunChat, intervalMs);
    }
  };
  
  // Stop auto chatting
  const stopAutoChatFromPumpFun = () => {
    if (autoChatIntervalRef.current) {
      clearInterval(autoChatIntervalRef.current);
      autoChatIntervalRef.current = null;
    }
    setIsAutoChattingFromPumpFun(false);
  };
  
  // Function to handle incoming PumpFun messages directly from the WebSocket
  const handleIncomingPumpFunMessage = (message) => {
    if (!message || !message.body) return;
    
    // Check if this message contains important tokens or keywords
    const containsImportantToken = /\b(SOL|BONK|JTO|WIF|JUP|PYTH|RAY|RENDER|SRM|MSOL)\b/i.test(message.body);
    const containsPriceMovement = /\b(pump|dump|moon|crash|breakout|bullish|bearish)\b/i.test(message.body);
    const containsQuestion = message.body.includes('?');
    
    // If this is a high-value message, save it automatically
    if (containsImportantToken || containsPriceMovement) {
      savePumpFunMessage(message);
      
      // Only auto-analyze if it's a particularly interesting message
      if ((containsImportantToken && containsPriceMovement) || 
          (containsImportantToken && containsQuestion) ||
          message.body.length > 50) {
        
        // Set analyzing state
        setAnalyzingPumpFunMessage(true);
        
        // Format and send to AI for analysis
        const formattedMessage = `[PumpFun Message] ${message.user}: ${message.body}`;
        enhancedChat(formattedMessage).finally(() => {
          setAnalyzingPumpFunMessage(false);
        });
      }
    }
  };
  
  // Process a random PumpFun chat
  const processRandomPumpFunChat = () => {
    const randomChat = getRandomPumpFunChat();
    if (!randomChat) return;
    
    // Format the message as a PumpFun message and send it to the chat function
    const formattedMessage = `[PumpFun Message] ${randomChat.user}: ${randomChat.text}`;
    enhancedChat(formattedMessage);
  };

  // Save a PumpFun message for later analysis
  const savePumpFunMessage = (message) => {
    const messageToSave = {
      id: Date.now(),
      text: message.text || message.body,
      user: message.user,
      timestamp: message.timestamp || new Date().toISOString(),
      saved_at: new Date().toISOString()
    };
    
    setSavedPumpFunMessages(prev => {
      const updated = [...prev, messageToSave];
      // Store in localStorage
      localStorage.setItem('savedPumpFunMessages', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Remove a saved PumpFun message
  const removeSavedPumpFunMessage = (messageId) => {
    setSavedPumpFunMessages(prev => {
      const updated = prev.filter(msg => msg.id !== messageId);
      // Update localStorage
      localStorage.setItem('savedPumpFunMessages', JSON.stringify(updated));
      return updated;
    });
  };
  
  // Analyze all saved PumpFun messages
  const analyzeSavedPumpFunMessages = () => {
    if (savedPumpFunMessages.length === 0) return;
    
    // Stop any existing auto chat
    stopAutoChatFromPumpFun();
    
    // Create a comprehensive analysis request
    let analysisText = "I'd like you to analyze these PumpFun messages I've collected and identify any patterns or trends: \n\n";
    
    savedPumpFunMessages.forEach((msg, index) => {
      analysisText += `${index + 1}. ${msg.user}: ${msg.text}\n`;
    });
    
    // Send for analysis
    enhancedChat(analysisText);
  };

  // Play audio with lip sync and animation
  const playAudioAction = async (actionName) => {
    try {
      // Convert action name to lowercase for file naming consistency
      const action = actionName.toLowerCase();
      
      // Map of action names to file IDs
      const actionFileIds = {
        intro: "1744561561998",
        greet: "1744550834456",
        dance: "1744561541974",
        laugh: "1744550844784",
        explain: "1744550636692",
        celebrate: "1744550813039"
      };
      
      const fileId = actionFileIds[action];
      if (!fileId) {
        console.error(`No file ID found for action: ${action}`);
        return false;
      }
      
      // Fetch the JSON file for lip sync data
      const response = await fetch(`/audios/action_${action}_${fileId}.json`);
      let lipsyncData;
      
      if (response.ok) {
        lipsyncData = await response.json();
      } else {
        console.warn(`Could not load lipsync data for action ${action}`);
        lipsyncData = null;
      }
      
      // Determine animation type based on action
      let animation = "Talk";
      if (action === "dance") {
        animation = "Dance";
      }
      
      // Determine facial expression based on action
      let facialExpression = "default";
      if (action === "laugh") {
        facialExpression = "funnyFace";
      } else if (action === "celebrate" || action === "intro") {
        facialExpression = "surprised";
      } else if (action === "greet") {
        facialExpression = "smile";
      }
      
      // Create a message object
      const customMessage = {
        text: actionName,
        animation,
        facialExpression,
        lipsync: lipsyncData,
      };
      
      // Set the message directly to trigger the avatar animation
      setMessage(customMessage);
      
      // Play the audio directly
      const audio = new Audio(`/audios/action_${action}_${fileId}.mp3`);
      audio.play();
      
      // When audio ends, clear the message
      audio.onended = () => {
        onMessagePlayed();
      };
      
      return true;
    } catch (error) {
      console.error("Error playing audio action:", error);
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chat: enhancedChat,
        message,
        onMessagePlayed,
        loading: loading || analyzingPumpFunMessage,
        cameraZoomed,
        setCameraZoomed,
        mode,
        setMode,
        news,
        fetchNews,
        readNewsWithTTS,
        isReading,
        showNewsModal,
        setShowNewsModal,
        showPumpFunModal,
        setShowPumpFunModal,
        readAllNews,
        stopReading,
        currentNewsIndexRef,
        hasElevenLabsKey,
        // PumpFun features
        pumpFunChats,
        fetchPumpFunChats,
        startAutoChatFromPumpFun,
        stopAutoChatFromPumpFun,
        isAutoChattingFromPumpFun,
        enhancedChat,
        handleIncomingPumpFunMessage,
        // Saved PumpFun messages
        savedPumpFunMessages,
        savePumpFunMessage,
        removeSavedPumpFunMessage,
        analyzeSavedPumpFunMessages,
        // Audio playback actions
        playAudioAction,
        // New AI agent features
        marketInsights,
        aiSuggestions,
        sentimentAnalysis,
        getTokenInsights,
        hideInputElements,
        setHideInputElements
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
