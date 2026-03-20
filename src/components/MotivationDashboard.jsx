import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Trash2, Quote } from 'lucide-react';

export default function MotivationDashboard() {
  // State Management
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize liked quotes from localStorage
  const [likedQuotes, setLikedQuotes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('liked_quotes');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persistence: Sync to localStorage whenever likedQuotes changes
  useEffect(() => {
    localStorage.setItem('liked_quotes', JSON.stringify(likedQuotes));
  }, [likedQuotes]);

  // Data Fetching
const fetchQuote = async () => {
  setLoading(true);
  try {
    // 1. Use the DummyJSON quotes endpoint
    const res = await fetch('https://dummyjson.com/quotes/random');
    
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    // 2. Map the new keys to your existing state structure
    // DummyJSON uses: id, quote, author
    setQuoteData({ 
      id: data.id.toString(), 
      text: data.quote, 
      author: data.author 
    });
    
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    setQuoteData({ 
      id: "fallback", 
      text: "Even when the connection drops, your drive shouldn't.", 
      author: "System" 
    });
  } finally {
    setLoading(false);
  }
};

  // Fetch on mount
  useEffect(() => {
    fetchQuote();
  }, []);

  // Determine if the currently displayed quote is already liked
  const isLiked = quoteData && likedQuotes.some(q => q.id === quoteData.id);

  // Actions
  const toggleLike = () => {
    if (!quoteData) return;
    if (isLiked) {
      setLikedQuotes(likedQuotes.filter(q => q.id !== quoteData.id));
    } else {
      setLikedQuotes([...likedQuotes, quoteData]);
    }
  };

  const deleteLiked = (id) => {
    setLikedQuotes(likedQuotes.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-zinc-800">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Quote className="w-6 h-6 text-zinc-500" />
            Daily Motivation
          </h1>
          <div className="flex items-center gap-2 bg-[#18181b] border border-zinc-800 px-4 py-1.5 rounded-full text-sm shadow-sm">
            <Heart className="w-4 h-4 text-[#ef4444] fill-[#ef4444]" />
            <span className="font-medium">{likedQuotes.length} Liked</span>
          </div>
        </header>

        {/* Main Quote Card */}
        <main className="flex justify-center">
          <div className="w-full max-w-2xl bg-[#18181b] rounded-2xl p-8 shadow-2xl border border-zinc-800 relative transition-all">
            {loading ? (
              // Loading Skeleton State
              <div className="animate-pulse flex flex-col items-center space-y-4 py-10">
                <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-5 bg-zinc-800 rounded w-5/6"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/3 mt-6"></div>
              </div>
            ) : (
              // Active Quote State
              <div className="py-8 flex flex-col items-center text-center space-y-6">
                <p className="text-2xl md:text-3xl font-medium leading-relaxed tracking-tight">
                  "{quoteData?.text}"
                </p>
                <p className="text-zinc-400 text-lg font-light tracking-wide">
                  — {quoteData?.author}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-zinc-800/80">
              <button
                onClick={fetchQuote}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors font-medium shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                New Quote
              </button>
              <button
                onClick={toggleLike}
                disabled={loading}
                className="flex items-center justify-center p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
                aria-label={isLiked ? "Unlike quote" : "Like quote"}
              >
                <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-[#ef4444] fill-[#ef4444]' : 'text-zinc-400'}`} />
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar / Bottom Section: Liked Quotes */}
        {likedQuotes.length > 0 && (
          <section className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 text-zinc-200">Your Saved Quotes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {likedQuotes.map((quote) => (
                <div 
                  key={quote.id} 
                  className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 flex flex-col justify-between group hover:border-zinc-700 transition-colors"
                >
                  <div className="mb-6">
                    <p className="text-zinc-200 leading-relaxed mb-3">"{quote.text}"</p>
                    <p className="text-sm text-zinc-500 font-medium">— {quote.author}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteLiked(quote.id)}
                      className="text-zinc-500 hover:text-[#ef4444] transition-colors p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg hover:bg-[#09090b]"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}