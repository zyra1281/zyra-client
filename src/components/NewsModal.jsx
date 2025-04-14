import React, { useEffect } from 'react';
import { useChat } from '../hooks/useChat';

export const NewsModal = ({ onClose }) => {
  const { news, readNewsWithTTS, isReading, readAllNews, stopReading, currentNewsIndexRef, fetchNews } = useChat();

  // Watch reading status and scroll to active article
  useEffect(() => {
    if (isReading && news.length > 0 && currentNewsIndexRef?.current >= 0) {
      const articleElements = document.querySelectorAll('.news-article');
      if (articleElements.length > currentNewsIndexRef.current) {
        const activeArticle = articleElements[currentNewsIndexRef.current];
        if (activeArticle) {
          activeArticle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [isReading, news, currentNewsIndexRef]);

  // Format the published date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  if (!news || news.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="bg-black/80 p-8 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-auto border border-[#00C2FF]/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#00C2FF]">Crypto News</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#14F195] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-center py-10 text-gray-400">
            No news found. Try refreshing.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-black/80 p-8 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-auto border border-[#00C2FF]/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#00C2FF]">Crypto News</h2>
            {isReading && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white text-sm">Reading</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#14F195] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-end gap-4 mb-6">
          <button 
            onClick={isReading ? stopReading : readAllNews}
            className={`px-4 py-2 rounded-md transition-colors ${
              isReading 
                ? 'bg-red-600/70 hover:bg-red-700/70 text-white' 
                : 'bg-[#14F195]/20 hover:bg-[#14F195]/30 text-[#14F195]'
            }`}
          >
            {isReading ? 'Stop Reading' : 'Read All News'}
          </button>
          
          <button 
            onClick={fetchNews}
            className="px-4 py-2 rounded-md bg-[#9945FF]/20 hover:bg-[#9945FF]/30 text-[#9945FF] transition-colors flex items-center gap-2"
            disabled={isReading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Latest Solana News
          </button>
        </div>

        <div className="space-y-6">
          {news.map((item, index) => (
            <div 
              key={index} 
              className={`news-article p-4 rounded-md cursor-pointer transition-colors border ${
                isReading && currentNewsIndexRef?.current === index
                  ? 'bg-[#14F195]/10 border-[#14F195]/30 shadow-lg shadow-[#14F195]/10'
                  : 'bg-black/40 hover:bg-black/60 border-white/10'
              }`}
              onClick={() => readNewsWithTTS(item.title + '. ' + (item.description || item.snippet || ''))}
            >
              {isReading && currentNewsIndexRef?.current === index && (
                <div className="flex items-center justify-center mb-2 text-[#14F195]">
                  <span className="text-xs uppercase tracking-wider">Currently Reading</span>
                </div>
              )}
              
              <h3 className="text-xl text-[#14F195] font-medium mb-2">{item.title}</h3>
              
              <div className="flex gap-4 mb-4">
                {item.image_url && (
                  <div className="w-1/3 h-32 overflow-hidden rounded">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <div className={item.image_url ? "w-2/3" : "w-full"}>
                  <p className="text-white/80 mb-4">{item.description || item.snippet || ''}</p>
                  
                  <div className="flex justify-between items-center text-sm text-white/50">
                    <span>{item.source || 'Unknown source'}</span>
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                </div>
              </div>
              
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
              
              {item.url && (
                <div className="mt-4">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00C2FF] hover:text-[#00C2FF]/80 text-sm flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read Full Article
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 