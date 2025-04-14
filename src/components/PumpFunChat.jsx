import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';
import { useChat } from '../hooks/useChat';

// Add CSS styles directly inside the component file
const styles = `
.pump-fun-chat {
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.pump-fun-chat.compact {
  height: 200px;
}

.pump-fun-chat.expanded {
  height: 500px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: linear-gradient(90deg, #9945FF, #14F195);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chat-header button {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-header button:hover {
  background: rgba(0, 0, 0, 0.5);
}

.token-info {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
}

.token-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #14F195;
}

.token-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.no-messages {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin: auto;
}

.message {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.username {
  font-weight: 600;
  color: #9945FF;
  margin-right: 6px;
}

.message-body {
  color: rgba(255, 255, 255, 0.9);
}

.timestamp {
  float: right;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 8px;
}

.token-symbol {
  color: #14F195;
  font-weight: 500;
}

.chat-link {
  color: #3a97ff;
  text-decoration: underline;
  word-break: break-all;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.3);
}

.chat-input input {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
}

.chat-input input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
}

.chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chat-input button {
  background: linear-gradient(90deg, #9945FF, #14F195);
  border: none;
  border-radius: 4px;
  color: white;
  margin-left: 8px;
  padding: 0 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.chat-input button:hover {
  opacity: 0.9;
}

.chat-input button:disabled,
.chat-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

// Add additional styles for AI analysis button
const additionalStyles = `
.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
}

.ai-analyze-btn, .save-btn {
  background: linear-gradient(90deg, #9945FF, #14F195);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.ai-analyze-btn:hover, .save-btn:hover {
  opacity: 1;
}

.save-btn {
  background: linear-gradient(90deg, #14F195, #2DD4BF);
}

.saved-messages {
  padding: 10px;
  background-color: rgba(25, 25, 25, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 120px;
  overflow-y: auto;
}

.saved-messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.saved-messages-header h4 {
  margin: 0;
  font-size: 13px;
  color: #14F195;
}

.saved-messages-header button {
  background: #9945FF;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  cursor: pointer;
}

.saved-message {
  font-size: 12px;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saved-message-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  margin-left: 6px;
}

.remove-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  color: white;
  border-bottom: 2px solid #14F195;
}

.analyzing {
  position: relative;
  background: linear-gradient(90deg, #9945FF, #14F195);
  color: transparent;
  overflow: hidden;
}

.analyzing::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.3) 50%, 
    rgba(255,255,255,0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

.message.being-analyzed {
  border: 1px solid #9945FF;
  box-shadow: 0 0 8px rgba(153, 69, 255, 0.3);
}
`;

const PumpFunChat = ({ tokenId = "AxSMXaM3KeQ3a6HDfGizJaRnzGqrDHJg3uyZbwZUpump" }) => {
  const [messages, setMessages] = useState([]);
  const [pumpMessage, setPumpMessage] = useState([])
  const [tokenInfo, setTokenInfo] = useState({
    name: "Sarah Token",
    symbol: "SARAH",
    market_cap: 110753,
    price: 0.000001,
    creator_username: "HaMwkR",
    inserted_at: new Date().toISOString()
  });
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'saved'
  const [analyzingMessageId, setAnalyzingMessageId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Get chat functions from useChat hook
  const { 
    enhancedChat, 
    savedPumpFunMessages, 
    savePumpFunMessage, 
    removeSavedPumpFunMessage, 
    analyzeSavedPumpFunMessages,
    handleIncomingPumpFunMessage,
    loading
  } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(()=>{
    // Connect to Node.js WebSocket server
    const socket = io('http://localhost:8080');

    socket.on('connect', () => {
        console.log('Connected to Node.js WebSocket server');
    });

    // Listen for chat messages
    socket.on('chatMessage', (response) => {
        console.log('Received message:', response);
        setPumpMessage((prev) => [...prev, response]);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Node.js WebSocket server');
    });

    // Cleanup on unmount
    return () => {
        socket.disconnect();
    };
  })

  // Connect to WebSocket and handle messages
  useEffect(() => {
    let fallbackInterval = null;
    const MAX_ATTEMPTS = 3;
    let connectionAttempts = 0;
    
    // Helper function to create mock messages when WebSocket fails
    const useFallbackMessages = () => {
      console.log('Using fallback messages system');
      
      // Initial mock messages
      const initialMessages = [
        { id: 1, user: 'SolanaWhale', body: 'Just loaded up on more SOL!', timestamp: new Date(Date.now() - 120000).toISOString() },
        { id: 2, user: 'TokenTrader', body: 'BONK looking strong with this volume pattern', timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: 3, user: 'CryptoNerd', body: 'Is anyone watching the JUP/SOL pair?', timestamp: new Date(Date.now() - 30000).toISOString() }
      ];
      
      setMessages(initialMessages);
      
      // Set up interval to add more messages
      return setInterval(() => {
        const mockMessages = [
          { user: 'MoonBoy', body: 'SOL to $500 soon!' },
          { user: 'TA_Expert', body: 'Chart showing a bullish pennant on hourly' },
          { user: 'Investor123', body: 'Any thoughts on WIF price action?' },
          { user: 'CryptoGirl', body: 'Just bought some BONK, hoping for a pump' },
          { user: 'TokenMaster', body: 'Volume increasing on JUP, bullish sign' },
          { user: 'SolDegen', body: "Who's accumulating more SOL at these levels?" }
        ];
        
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        const newMessage = {
          id: Date.now(),
          user: randomMessage.user,
          body: randomMessage.body,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages.slice(-19), newMessage]);
      }, 10000); // Add a new message every 10 seconds
    };
    
    const connectWebSocket = () => {
      connectionAttempts++;
      
      try {
        console.log('Connecting to pump.fun WebSocket...');
        
        // Check if WebSocket is supported
        if (!window.WebSocket) {
          console.error('WebSocket not supported in this browser');
          fallbackInterval = useFallbackMessages();
          return;
        }
        
        socketRef.current = new WebSocket('wss://socket.pump.fun/socket');
        
        socketRef.current.onopen = () => {
          console.log('WebSocket connected!');
          setConnected(true);
          
          // Subscribe to the token's channel
          const subscribeMsg = {
            topic: `pumps:${tokenId}`,
            event: "phx_join",
            payload: {},
            ref: 1
          };
          
          try {
            socketRef.current.send(JSON.stringify(subscribeMsg));
            console.log(`Subscribed to pumps:${tokenId}`);
          } catch (error) {
            console.error('Error subscribing to channel:', error);
          }
          
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          
          // Reset connection attempts on successful connection
          connectionAttempts = 0;
        };
        
        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.topic === `pumps:${tokenId}`) {
            if (data.event === "newMessage" && data.payload) {
              const newMessage = {
                id: data.payload.id || Date.now(),
                user: data.payload.username || data.payload.sender || 'anonymous',
                body: data.payload.message || '',
                timestamp: data.payload.timestamp || new Date().toISOString()
              };
              
              setMessages(prev => [...prev, newMessage]);
              
              // Process the message with the AI handler
              handleIncomingPumpFunMessage(newMessage);
            }
          }
        };
        
        socketRef.current.onerror = (event) => {
          console.error('WebSocket error:', event);
          setConnected(false);
          
          if (connectionAttempts >= MAX_ATTEMPTS) {
            console.log('Max connection attempts reached, using fallback system');
            fallbackInterval = useFallbackMessages();
          } else {
            // Attempt to reconnect after a delay
            setTimeout(() => {
              console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_ATTEMPTS})...`);
              if (socketRef.current) {
                socketRef.current.connect();
              }
            }, 5000);
          }
        };
        
        socketRef.current.onclose = () => {
          console.log('WebSocket closed');
          setConnected(false);
          
          if (connectionAttempts >= MAX_ATTEMPTS) {
            console.log('Max connection attempts reached, using fallback system');
            fallbackInterval = useFallbackMessages();
          }
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnected(false);
        
        if (connectionAttempts >= MAX_ATTEMPTS) {
          console.log('Max connection attempts reached, using fallback system');
          fallbackInterval = useFallbackMessages();
        }
      }
    };

    // Initial connection
    connectWebSocket();
    
    // Fetch initial token information via REST API as fallback
    fetch(`https://api.pump.fun/pumps/${tokenId}`)
      .then(res => {
        if (!res.ok) throw new Error(`API responded with status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.pump) {
          setTokenInfo(prev => ({
            ...prev,
            name: data.pump.name || prev?.name || 'Unknown Token',
            symbol: data.pump.symbol || prev?.symbol || 'UNKNOWN',
            market_cap: data.pump.market_cap || prev?.market_cap || '0',
            price: data.pump.price || prev?.price || '0',
            creator_username: data.pump.creator_username || prev?.creator_username || 'Unknown',
            inserted_at: data.pump.inserted_at || prev?.inserted_at || new Date().toISOString()
          }));
        } else {
          // Use fallback data if API returns no pump info
          useFallbackTokenInfo();
        }
      })
      .catch(err => {
        console.error('Failed to fetch token info:', err);
        // Use fallback token info on error
        useFallbackTokenInfo();
      });
      
    // Fallback function to provide mock token data when API fails
    const useFallbackTokenInfo = () => {
      console.log('Using fallback token information');
      setTokenInfo({
        name: 'PumpFun Token',
        symbol: 'PUMP',
        market_cap: '1000000',
        price: '0.00001',
        creator_username: 'PumpFunCreator',
        inserted_at: new Date().toISOString()
      });
    };
      
    // Enhanced cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection...');
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (fallbackInterval) {
        console.log('Clearing fallback message interval');
        clearInterval(fallbackInterval);
      }
    };
  }, [tokenId, handleIncomingPumpFunMessage]);

  // Function to analyze a message with AI
  const analyzeWithAI = (message) => {
    if (!message || !message.body) return;
    
    // Set this message as being analyzed
    setAnalyzingMessageId(message.id);
    
    // Format the message for AI analysis
    const formattedMessage = `[PumpFun Message] ${message.user}: ${message.body}`;
    
    // Send to AI for analysis
    enhancedChat(formattedMessage);
    
    // Clear the analyzing state after a reasonable delay or when loading changes
    setTimeout(() => {
      setAnalyzingMessageId(null);
    }, 5000);
  };

  // Reset analyzing state when loading changes
  useEffect(() => {
    if (!loading && analyzingMessageId !== null) {
      setAnalyzingMessageId(null);
    }
  }, [loading, analyzingMessageId]);

  // Function to save a message
  const saveMessage = (message) => {
    savePumpFunMessage(message);
  };

  // Send a message
  const sendMessage = () => {
    if (!inputMessage.trim() || !connected || !socketRef.current) return;
    
    try {
      console.log('Sending message:', inputMessage);
      
      // Emit the message to the server
      socketRef.current.send(JSON.stringify({
        topic: `pumps:${tokenId}`,
        event: "newMessage",
        payload: {
          message: inputMessage
        }
      }));
      
      // Optimistically add message to the UI
      const newMessage = {
        id: Date.now(),
        user: 'You',
        body: inputMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format timestamp to relative time (e.g. "5 minutes ago")
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Format message body to highlight token symbols and links
  const formatMessageBody = (body) => {
    if (!body) return '';
    
    // Replace $TOKEN with colored span
    const tokenPattern = /\$([A-Za-z0-9]+)/g;
    let formattedBody = body.replace(tokenPattern, '<span class="token-symbol">$$$1</span>');
    
    // Make links clickable
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    formattedBody = formattedBody.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
    
    return formattedBody;
  };

  return (
    <div className={`pump-fun-chat ${expanded ? 'expanded' : 'compact'}`}>
      <div className="chat-header">
        
      </div>
      
      {expanded && tokenInfo && (
        <div className="token-info">
          <h4>{tokenInfo.name} (${tokenInfo.symbol})</h4>
          <div className="token-stats">
            <div>Market Cap: ${Number(tokenInfo.market_cap || 0).toLocaleString()}</div>
            <div>Price: ${Number(tokenInfo.price || 0).toFixed(6)}</div>
            <div>Creator: {tokenInfo.creator_username || 'Unknown'}</div>
            <div>Created: {formatTimestamp(tokenInfo.inserted_at)}</div>
          </div>
        </div>
      )}
      
      {expanded && (
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Live Chat
          </button>
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Messages ({savedPumpFunMessages.length})
          </button>
        </div>
      )}
      
      {expanded && activeTab === 'chat' && (
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Join the conversation..."
            disabled={!connected}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <button 
            disabled={!connected}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default PumpFunChat; 