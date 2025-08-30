import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import FakePaywall from "./FakePaywall";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";



interface UploadedImage {
  _id: string;
  body: string;
  createdAt: number;
  url: string;
  generationStatus?: string;
  // Progressive Absurdity fields
  generationCount?: number;
  rootImageId?: string;
  absurdityLevel?: number;
}

interface ImagePreviewProps {
  images: string[]; // Keeping for compatibility, but will be empty
  uploadedImages?: UploadedImage[];
  totalImages?: number; // Total count of all generated images
  currentPage?: number; // Current page number for pagination
  imagesPerPage?: number; // Number of images per page
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  // Progressive Absurdity features
  onEscalate?: (image: UploadedImage) => void;
  showChainProgress?: boolean;
}

export default function ImagePreview({
  uploadedImages = [],
  totalImages = 0,
  currentPage = 0,
  imagesPerPage = 12,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onEscalate,
  showChainProgress = true
}: ImagePreviewProps) {
  // Suppress unused variable warnings for props that might be used in future
  void currentPage;
  void imagesPerPage;
  const [escalatingImages, setEscalatingImages] = useState<Set<string>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingEscalation, setPendingEscalation] = useState<UploadedImage | null>(null);
  
  // Wait timer state - 4:20 (260 seconds) wait after levels 3 and 4
  const [waitingImages, setWaitingImages] = useState<Map<string, number>>(new Map()); // imageId -> endTime
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [justCompleted, setJustCompleted] = useState<Set<string>>(new Set());
  
  // Image dialog state
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only show uploaded images (captured images are now uploaded automatically)
  const allImages = uploadedImages.map((img, index) => ({
    type: 'uploaded' as const,
    data: img,
    index
  }));

  // Check if user has achieved Level 5 (maximum chaos) - for the finale card
  const hasLevel5Image = uploadedImages.some(img => img.absurdityLevel === 5);

  // Timer management constants
  const WAIT_TIME_MS = 10000; // 10 seconds for testing
  const STORAGE_KEY = 'gitdripped-wait-timers';
  const TIMERS_STARTED_KEY = 'gitdripped-timers-started';

  // Load timer state from localStorage on component mount
  useEffect(() => {
    // Load wait timers
    const savedTimers = localStorage.getItem(STORAGE_KEY);
    if (savedTimers) {
      try {
        const timers = JSON.parse(savedTimers);
        const activeTimers = new Map<string, number>();
        
        // Only keep timers that haven't expired
        Object.entries(timers).forEach(([imageId, endTime]) => {
          if (typeof endTime === 'number' && endTime > Date.now()) {
            activeTimers.set(imageId, endTime);
          }
        });
        
        setWaitingImages(activeTimers);
      } catch (error) {
        console.error('Failed to load wait timers from localStorage:', error);
      }
    }

    // Load timers started state
    const savedTimersStarted = localStorage.getItem(TIMERS_STARTED_KEY);
    if (savedTimersStarted) {
      try {
        const timersStartedArray = JSON.parse(savedTimersStarted);
        setTimersStarted(new Set(timersStartedArray));
      } catch (error) {
        console.error('Failed to load timers started from localStorage:', error);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timersObject = Object.fromEntries(waitingImages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timersObject));
  }, [waitingImages]);


  // Clock update effect - runs every second to update countdown displays
  useEffect(() => {
    if (waitingImages.size > 0) {
      const updateTimer = () => {
        const now = Date.now();
        setCurrentTime(now);
        
        // Clean up expired timers and track just completed ones
        const activeTimers = new Map(waitingImages);
        const newlyCompleted = new Set<string>();
        let hasExpired = false;
        
        activeTimers.forEach((endTime, imageId) => {
          if (endTime <= now) {
            activeTimers.delete(imageId);
            hasExpired = true;
            newlyCompleted.add(imageId);
          }
        });
        
        if (hasExpired) {
          setWaitingImages(activeTimers);
        }
        
        // Mark newly completed timers for celebration display
        if (newlyCompleted.size > 0) {
          setJustCompleted(prev => new Set([...prev, ...newlyCompleted]));
          
          // Clear the celebration state after 3 seconds
          setTimeout(() => {
            setJustCompleted(prev => {
              const updated = new Set(prev);
              newlyCompleted.forEach(id => updated.delete(id));
              return updated;
            });
          }, 3000);
        }
      };
      
      // Start the timer immediately and then every second
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // No active timers, clear the interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [waitingImages]);

  // Helper function to start wait timer for an image
  const startWaitTimer = useCallback((imageId: string) => {
    const endTime = Date.now() + WAIT_TIME_MS;
    setWaitingImages(prev => new Map(prev).set(imageId, endTime));
  }, [WAIT_TIME_MS]);

  // Helper function to check if an image is in waiting period
  const isImageWaiting = useCallback((imageId: string): boolean => {
    const endTime = waitingImages.get(imageId);
    return endTime ? endTime > currentTime : false;
  }, [waitingImages, currentTime]);

  // Helper function to get remaining wait time for an image
  const getRemainingWaitTime = useCallback((imageId: string): number => {
    const endTime = waitingImages.get(imageId);
    return endTime ? Math.max(0, endTime - currentTime) : 0;
  }, [waitingImages, currentTime]);

  // Helper function to format time as MM:SS
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle image click to open in dialog
  const handleImageClick = useCallback((image: UploadedImage) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  }, []);

  // Helper function to check if an image has already been escalated
  const hasBeenEscalated = useCallback((image: UploadedImage): boolean => {
    if (!image.rootImageId || !image.absurdityLevel) return false;
    
    // Check if there's a higher level image from the same root
    const higherLevelExists = uploadedImages.some(otherImg => 
      otherImg.rootImageId === image.rootImageId && 
      otherImg.absurdityLevel && 
      otherImg.absurdityLevel > (image.absurdityLevel || 0)
    );
    
    return higherLevelExists;
  }, [uploadedImages]);

  // Handler for escalation with paywall check and wait timer
  const handleEscalate = (image: UploadedImage) => {
    if (!onEscalate) return;
    
    // Check if this is Level 2 trying to go to Level 3 - show fake paywall!
    if (image.absurdityLevel === 2) {
      setPendingEscalation(image);
      setShowPaywall(true);
      return;
    }
    
    // For other levels, proceed with escalation
    // Add to escalating set immediately
    setEscalatingImages(prev => new Set(prev).add(image._id));
    
    // Call the original escalate function
    onEscalate(image);
  };

  // Handler for paywall dismissal
  const handlePaywallClose = () => {
    setShowPaywall(false);
    
    // Proceed with the escalation after "paying"
    if (pendingEscalation && onEscalate) {
      setEscalatingImages(prev => new Set(prev).add(pendingEscalation._id));
      onEscalate(pendingEscalation);
    }
    
    setPendingEscalation(null);
  };

  // Check if an image is currently being escalated
  const isEscalating = (imageId: string): boolean => {
    return escalatingImages.has(imageId);
  };

  // Track which images we've already started timers for
  const [timersStarted, setTimersStarted] = useState<Set<string>>(new Set());

  // Save timers started state to localStorage whenever it changes
  useEffect(() => {
    const timersStartedArray = Array.from(timersStarted);
    localStorage.setItem(TIMERS_STARTED_KEY, JSON.stringify(timersStartedArray));
  }, [timersStarted]);

  // Clean up escalating state when new images appear or escalation completes
  useEffect(() => {
    // Clear escalating state for images that now have higher-level versions
    const toRemove: string[] = [];
    
    escalatingImages.forEach(imageId => {
      const originalImage = uploadedImages.find(img => img._id === imageId);
      if (originalImage && hasBeenEscalated(originalImage)) {
        toRemove.push(imageId);
      }
    });
    
    if (toRemove.length > 0) {
      setEscalatingImages(prev => {
        const newSet = new Set(prev);
        toRemove.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [uploadedImages, escalatingImages, hasBeenEscalated]);

  // Start wait timers for newly created level 3 and 4 images
  useEffect(() => {
    uploadedImages.forEach(image => {
      // Only start timers for Level 3 and Level 4 images that don't already have timers
      if ((image.absurdityLevel === 3 || image.absurdityLevel === 4) && 
          !timersStarted.has(image._id)) {
        
        startWaitTimer(image._id);
        setTimersStarted(prev => new Set(prev).add(image._id));
      }
    });
  }, [uploadedImages, timersStarted, startWaitTimer]);



  if (allImages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64 p-6 border-2 border-dashed border-accent/30 bg-muted/50 rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-lg font-medium mb-2">Ready for the Absurdity Journey!</p>
          <p className="text-sm">Upload or capture an image to start your 5-level transformation adventure</p>
          <div className="mt-4 bg-gradient-to-r from-slate-100 to-gray-100 rounded-lg p-3 text-xs">
            <p className="font-bold text-slate-800 mb-1">🚀 The Absurdity Levels:</p>
            <div className="space-y-1 text-slate-700">
              <p>Level 1: ✨ Getting Dripped</p>
              <p>Level 2: 💎 Seriously Dripped Out</p> 
              <p>Level 3: 🔥 Absolutely Ridiculous</p>
              <p>Level 4-5: 👑 PEAK CHAOS!</p>
            </div>
            <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
              <p className="text-yellow-800 font-semibold">⚡ Limited to 5 images total!</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Compact Level Indicator */}
      <div className="flex items-center justify-center">
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          totalImages >= 5 
            ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white animate-pulse' 
            : 'bg-gradient-to-r from-slate-500 to-blue-500 text-white'
        }`}>
          {totalImages >= 5 
            ? '👑 MAXIMUM CHAOS UNLOCKED!' 
            : `🎮 Level ${totalImages} Unlocked!`
          }
        </div>
        {isLoading && (
          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
        )}
      </div>

      {/* Professional Gamified Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {allImages.map((image) => (
          <div key={`${image.type}-${image.index}`} className="group">
            {/* Game Card Style Container */}
            <div className="bg-card border border-border hover:border-accent transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl overflow-hidden">
              
              {/* Image Container - Clean and Visible - Clickable */}
              <div className="aspect-[3/2] relative overflow-hidden cursor-pointer" onClick={() => handleImageClick(image.data)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.data.url}
                  alt={`Level ${image.data.absurdityLevel || 1} Image`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex items-center justify-center h-full text-muted-foreground bg-muted">
                          <div class="text-center">
                            <div class="text-2xl mb-1">📷</div>
                            <div class="text-xs">Image Loading...</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />

                {/* Small Level Badge - Top Right Corner */}
                {image.data.absurdityLevel && image.data.absurdityLevel > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-bold text-white">
                      Lv.{image.data.absurdityLevel}
                    </span>
                  </div>
                )}

                {/* Max Level Crown */}
                {image.data.absurdityLevel === 5 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                    <span className="text-sm">👑</span>
                  </div>
                )}

                {/* Processing Overlay - Only When Needed */}
                {(image.data.generationStatus === 'pending' || image.data.generationStatus === 'processing') && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-black/95 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm font-bold">
                        {image.data.generationStatus === 'pending' ? 'Queued...' : 'Transforming...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Info Panel - Professional Game UI */}
              <div className="p-2 space-y-2 bg-gradient-to-r from-muted/50 to-muted/30">
                
                {/* Progress Bar Section */}
                {showChainProgress && image.data.absurdityLevel && image.data.absurdityLevel > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">ABSURDITY LEVEL</span>
                      <span className="text-xs font-bold">{image.data.absurdityLevel}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          image.data.absurdityLevel >= 4 
                            ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' 
                            : 'bg-gradient-to-r from-blue-400 to-slate-500'
                        }`}
                        style={{ width: `${(image.data.absurdityLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center font-medium text-muted-foreground">
                      {image.data.absurdityLevel === 5 
                        ? '👑 MAXIMUM CHAOS ACHIEVED!' 
                        : ['', '✨ Getting Dripped', '💎 Seriously Dripped', '🔥 Absolutely Ridiculous', '👑 PEAK ABSURDITY'][image.data.absurdityLevel]
                      }
                    </div>
                  </div>
                )}

                {/* Wait Timer Display - Show when image is in waiting period */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 image.data.generationStatus !== 'pending' && 
                 image.data.generationStatus !== 'processing' && 
                 !hasBeenEscalated(image.data) && !isEscalating(image.data._id) && 
                 isImageWaiting(image.data._id) && (
                  <div className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold py-2 px-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span>⏰</span>
                        <span className="text-lg tabular-nums">
                          {formatTime(getRemainingWaitTime(image.data._id))}
                        </span>
                        <span>⏰</span>
                      </div>
                      <div className="text-xs text-center text-slate-200">
                        Good things come to those who wait...
                      </div>
                      {/* Progress bar showing time remaining */}
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                          className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-slate-400 transition-all duration-1000"
                          style={{ 
                            width: `${100 - (getRemainingWaitTime(image.data._id) / WAIT_TIME_MS) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timer Just Completed Celebration - Show for 3 seconds after timer ends */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 image.data.generationStatus !== 'pending' && 
                 image.data.generationStatus !== 'processing' && 
                 !hasBeenEscalated(image.data) && !isEscalating(image.data._id) && 
                 !isImageWaiting(image.data._id) && justCompleted.has(image.data._id) && (
                  <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-4 rounded-lg animate-pulse">
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-bounce">🎉</span>
                      <span>WAIT COMPLETE!</span>
                      <span className="animate-bounce">🎉</span>
                    </div>
                    <div className="text-xs text-center text-green-100 mt-1">
                      Ready to escalate to Level {image.data.absurdityLevel + 1}!
                    </div>
                  </div>
                )}

                {/* Action Button - Clean and Professional */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 image.data.generationStatus !== 'pending' && 
                 image.data.generationStatus !== 'processing' && 
                 !hasBeenEscalated(image.data) && !isEscalating(image.data._id) && 
                 !isImageWaiting(image.data._id) && !justCompleted.has(image.data._id) && (
                  <button
                    onClick={() => handleEscalate(image.data)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🚀</span>
                      <span>ESCALATE TO LEVEL {image.data.absurdityLevel + 1}</span>
                      <span>⚡</span>
                    </div>
                  </button>
                )}

                {/* Escalating Status - Immediate Feedback */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 !hasBeenEscalated(image.data) && isEscalating(image.data._id) && (
                  <div className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white font-bold py-2 px-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>⚡ Level {image.data.absurdityLevel + 1} Starting!</span>
                      <span className="animate-pulse">⚡</span>
                    </div>
                  </div>
                )}

                {/* Already Escalated Status */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 hasBeenEscalated(image.data) && (
                  <div className="flex justify-center">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full border border-green-200">
                      ⚡ Level {image.data.absurdityLevel + 1} Unlocked!
                    </span>
                  </div>
                )}

                {/* Max Level Status */}
                {image.data.absurdityLevel === 5 && (
                  <div className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white font-bold py-2 px-4 rounded-lg text-center">
                    👑 MAXIMUM CHAOS ACHIEVED!
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        {/* 🎉 FINALE SELF-PROMOTION CARD - Appears after Level 5 achievement! */}
        {hasLevel5Image && (
          <div className="group">
            <div className="bg-card border border-border hover:border-accent transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl overflow-hidden">
              
              {/* Compact Header with Celebration */}
              <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-3">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute top-1 right-4 w-1 h-1 bg-yellow-300 rounded-full animate-bounce delay-100"></div>
                </div>
                <div className="relative z-10 text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    🎉 MAXIMUM CHAOS! 🎉
                  </div>
                  <div className="text-xs font-semibold text-black bg-white/90 rounded-full px-2 py-1">
                    Level 5 Champion!
                  </div>
                </div>
              </div>

              {/* Main Content - Matches image card aspect ratio */}
              <div className="aspect-[3/2] relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 flex items-center justify-center p-3">
                <div className="text-center space-y-3">
                  
                  {/* Compact Profile */}
                  <div className="relative mx-auto">
                    <div className="w-16 h-16 rounded-full border-3 border-yellow-400 overflow-hidden mx-auto shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/profile.jpg"
                        alt="@gitmaxd"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='%23fbbf24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>

                  {/* Compact Message */}
                  <div className="space-y-2">
                    <p className="text-yellow-400 font-bold text-base leading-tight">
                      Had fun? Let&apos;s go! 🚀
                    </p>
                    <div className="text-xs text-slate-200 leading-tight">
                      <div>Follow <span className="font-bold text-blue-400">@gitmaxd</span></div>
                      <div>for more AI chaos!</div>
                    </div>
                  </div>

                  {/* Compact CTA Button */}
                  <a
                    href="https://x.com/gitmaxd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-xs shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <span>𝕏</span>
                    <span>Follow</span>
                    <span className="animate-pulse">✨</span>
                  </a>
                </div>
              </div>

              {/* Compact Bottom Section */}
              <div className="p-3 space-y-2 bg-gradient-to-r from-muted/50 to-muted/30">
                <div className="text-center">
                  <div className="text-xs font-medium text-muted-foreground mb-1">CREATOR</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 w-full animate-pulse"></div>
                  </div>
                  <div className="text-xs font-bold text-center text-yellow-600 mt-1">
                    Thanks for playing! 🏆
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex items-center justify-center py-6">
          <Button
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              `Load More (${totalImages - allImages.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* Fake Paywall Dialog */}
      <FakePaywall isOpen={showPaywall} onClose={handlePaywallClose} />

      {/* Image View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative">
              {/* Close button - positioned absolutely */}
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                aria-label="Close dialog"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Image */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.url || ''}
                  alt={`Level ${selectedImage.absurdityLevel || 1} Image`}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                
                {/* Level badge overlay */}
                {selectedImage.absurdityLevel && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-bold text-white">
                      Level {selectedImage.absurdityLevel}
                    </span>
                  </div>
                )}
              </div>

              {/* Image details footer */}
              <div className="p-6 bg-background border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      Level {selectedImage.absurdityLevel} • {
                        ['', '✨ Getting Dripped', '💎 Seriously Dripped', '🔥 Absolutely Ridiculous', '👑 PEAK ABSURDITY', '🌟 MAXIMUM CHAOS'][selectedImage.absurdityLevel || 0]
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedImage.generationStatus === 'completed' ? 'Generation complete' : 
                       selectedImage.generationStatus === 'processing' ? 'Processing...' :
                       selectedImage.generationStatus === 'pending' ? 'Queued for generation' : 'Ready'}
                    </p>
                  </div>
                  
                  {/* Download button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedImage.url) {
                        const link = document.createElement('a');
                        link.href = selectedImage.url;
                        link.download = `level-${selectedImage.absurdityLevel}-dripped.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 11L4 7H6V3H10V7H12L8 11Z" fill="currentColor"/>
                      <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
