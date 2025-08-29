"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface ChampionImage {
  _id: Id<"images">;
  body: string;
  createdAt: number;
  url: string;
  absurdityLevel?: number;
  rank: number;
  voteCount: number;
}

// Generate unique voter ID
const generateVoterId = (): string => {
  return `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create voter ID from localStorage
const getVoterId = (): string => {
  if (typeof window === "undefined") return generateVoterId();
  
  let voterId = localStorage.getItem("gitdripped_voter_id");
  if (!voterId) {
    voterId = generateVoterId();
    localStorage.setItem("gitdripped_voter_id", voterId);
  }
  return voterId;
};

export default function HallOfFame() {
  const [voterId, setVoterId] = useState<string>("");
  const championImages = useQuery(api.images.getHallOfFameImages) || [];
  const userVotesArray = useQuery(api.votes.getUserVotes, voterId ? { voterId } : "skip") || [];
  const userVotes = new Set(userVotesArray);
  const castVote = useMutation(api.votes.castVote);
  const [selectedChampion, setSelectedChampion] = useState<ChampionImage | null>(null);
  const [votingImages, setVotingImages] = useState<Set<string>>(new Set());

  // Initialize voter ID on client side
  useEffect(() => {
    setVoterId(getVoterId());
  }, []);

  const handleVote = async (imageId: Id<"images">) => {
    if (!voterId) return;
    
    setVotingImages(prev => new Set(prev).add(imageId));
    
    try {
      await castVote({ imageId, voterId });
    } catch (error) {
      console.error("Failed to cast vote:", error);
    } finally {
      setVotingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  if (championImages.length === 0) {
    return (
      <div className="w-full relative overflow-hidden">
        {/* Gaming-style background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>
        
        <div className="relative z-10 p-8 text-center">
          <div className="text-8xl mb-6 animate-pulse">🏆</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Hall of Fame
          </h2>
          <p className="text-purple-300 text-lg mb-6">
            No champions yet! Be the first to reach maximum absurdity!
          </p>
          
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 text-purple-200 max-w-md mx-auto">
            <p className="font-semibold mb-4 text-yellow-400">🎮 How to become a champion:</p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                📸 Take or upload a photo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                🚀 Escalate through all 5 levels
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                👑 Achieve maximum chaos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                🏆 Get voted to the top!
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const getLevelName = (level?: number) => {
    const levelNames = [
      "", "✨ Getting Dripped", "💎 Seriously Dripped", "🔥 Absolutely Ridiculous", 
      "👑 PEAK ABSURDITY", "🌟 MAXIMUM CHAOS"
    ];
    return levelNames[level || 0];
  };

  const getLevelColor = (level?: number) => {
    switch (level) {
      case 5: return "from-yellow-400 via-orange-500 to-red-500";
      case 4: return "from-purple-400 via-pink-500 to-red-400";
      case 3: return "from-blue-400 via-purple-500 to-pink-400";
      case 2: return "from-green-400 via-blue-500 to-purple-400";
      case 1: return "from-cyan-400 via-teal-500 to-blue-400";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCardGlow = (rank: number, voteCount: number) => {
    if (rank === 1 && voteCount > 0) return "shadow-[0_0_30px_rgba(255,215,0,0.6)]"; // Gold glow
    if (rank === 2 && voteCount > 0) return "shadow-[0_0_25px_rgba(192,192,192,0.6)]"; // Silver glow
    if (rank === 3 && voteCount > 0) return "shadow-[0_0_20px_rgba(205,127,50,0.6)]"; // Bronze glow
    if (voteCount > 0) return "shadow-[0_0_15px_rgba(147,51,234,0.4)]"; // Purple glow for voted
    return "";
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Gaming-style background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 opacity-20 animate-pulse">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col p-3 space-y-4">
        {/* Compact Gaming-style header */}
        <div className="flex-shrink-0 text-center">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-3 mb-2">
            <div className="text-2xl animate-bounce">🏆</div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                HALL OF FAME
              </h2>
              <p className="text-purple-300 text-xs">
                {championImages.length} champions competing!
              </p>
            </div>
            <div className="text-2xl animate-bounce">🏆</div>
          </div>
          
          {/* Compact Live stats */}
          <div className="flex justify-center gap-2 text-xs">
            <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/50 rounded px-3 py-1">
              <span className="text-yellow-400 font-black text-sm">🔥 {championImages.reduce((sum, img) => sum + img.voteCount, 0)} TOTAL VOTES</span>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded px-2 py-1">
              <span className="text-purple-400 font-bold">⚡ L{Math.max(...championImages.map(img => img.absurdityLevel || 0))}</span>
            </div>
          </div>
        </div>

        {/* Champions Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {championImages.map((champion) => {
            const hasVoted = userVotes.has(champion._id);
            const isVoting = votingImages.has(champion._id);
            const levelColor = getLevelColor(champion.absurdityLevel);
            const cardGlow = getCardGlow(champion.rank, champion.voteCount);
            
            return (
              <div 
                key={champion._id}
                className={`group relative bg-black/60 backdrop-blur-sm border border-purple-500/30 hover:border-yellow-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${cardGlow} hover:shadow-2xl`}
              >
                {/* Rank badge */}
                <div className="absolute top-3 left-3 z-20">
                  {champion.rank === 1 && champion.voteCount > 0 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-10 h-10 flex items-center justify-center text-black font-bold text-sm shadow-lg animate-pulse">
                      👑
                    </div>
                  )}
                  {champion.rank === 2 && champion.voteCount > 0 && (
                    <div className="bg-gradient-to-r from-gray-300 to-gray-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      🥈
                    </div>
                  )}
                  {champion.rank === 3 && champion.voteCount > 0 && (
                    <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      🥉
                    </div>
                  )}
                  {(champion.rank > 3 || champion.voteCount === 0) && (
                    <div className="bg-black/60 backdrop-blur-sm border border-purple-500/50 rounded-full w-8 h-8 flex items-center justify-center text-purple-300 font-bold text-sm">
                      #{champion.rank}
                    </div>
                  )}
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(champion._id)}
                  disabled={isVoting}
                  className="absolute top-3 right-3 z-20 group"
                >
                  <div className={`
                    flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200
                    ${hasVoted 
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg' 
                      : 'bg-black/60 backdrop-blur-sm border border-purple-500/30 text-purple-300 hover:border-pink-500/50 hover:text-pink-400'
                    }
                    ${isVoting ? 'animate-pulse' : ''}
                    hover:scale-110 active:scale-95
                  `}>
                    <span className="text-sm">{isVoting ? '⏳' : hasVoted ? '🔥' : '🚀'}</span>
                    <span className="text-sm font-black">{champion.voteCount}</span>
                  </div>
                </button>

                {/* Image container */}
                <div 
                  className="aspect-square relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedChampion(champion)}
                >
                  <img
                    src={champion.url}
                    alt={`Champion ${champion.rank} - ${getLevelName(champion.absurdityLevel)}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full text-purple-300 bg-black/40">
                            <div class="text-center">
                              <div class="text-4xl mb-2">🏆</div>
                              <div class="text-sm">Champion Image</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Level badge overlay */}
                  {champion.absurdityLevel === 5 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-2xl animate-pulse">👑</span>
                    </div>
                  )}
                </div>
                
                {/* Info panel */}
                <div className="p-4 space-y-3 bg-gradient-to-t from-black/80 to-transparent">
                  {/* Level progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-purple-300">LEVEL</span>
                      <span className="font-bold text-white">{champion.absurdityLevel}/5</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${levelColor} transition-all duration-500`}
                        style={{ width: `${((champion.absurdityLevel || 0) / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium text-center text-purple-200 truncate">
                      {getLevelName(champion.absurdityLevel)}
                    </div>
                  </div>
                  
                  {/* Achievement date */}
                  <div className="text-xs text-purple-300 text-center pt-2 border-t border-purple-500/30">
                    Champion Since: {formatDate(champion.createdAt)}
                  </div>
                </div>

                {/* Particle effect for top 3 */}
                {champion.rank <= 3 && champion.voteCount > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Modal for selected champion */}
      {selectedChampion && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedChampion(null)}
        >
          <div 
            className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🏆 Champion #{selectedChampion.rank}
                  <span className="text-2xl font-black text-orange-400 animate-pulse">🔥 {selectedChampion.voteCount}</span>
                </h3>
                <button
                  onClick={() => setSelectedChampion(null)}
                  className="text-purple-300 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
              
              <img
                src={selectedChampion.url}
                alt="Champion"
                className="w-full rounded-xl"
              />
              
              <div className="space-y-2 text-purple-200">
                <div className="flex justify-between">
                  <span className="font-medium">Achievement Level:</span>
                  <span className={`font-bold bg-gradient-to-r ${getLevelColor(selectedChampion.absurdityLevel)} bg-clip-text text-transparent`}>
                    {getLevelName(selectedChampion.absurdityLevel)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Votes:</span>
                  <span className="text-xl font-black text-orange-400">🔥 {selectedChampion.voteCount} VOTES</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Achieved On:</span>
                  <span>{formatDate(selectedChampion.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}