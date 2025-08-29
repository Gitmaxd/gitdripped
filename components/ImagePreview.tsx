import { Button } from "./ui/button";
import { useState, useEffect } from "react";



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

  // Only show uploaded images (captured images are now uploaded automatically)
  const allImages = uploadedImages.map((img, index) => ({
    type: 'uploaded' as const,
    data: img,
    index
  }));

  // Helper function to check if an image has already been escalated
  const hasBeenEscalated = (image: UploadedImage): boolean => {
    if (!image.rootImageId || !image.absurdityLevel) return false;
    
    // Check if there's a higher level image from the same root
    const higherLevelExists = uploadedImages.some(otherImg => 
      otherImg.rootImageId === image.rootImageId && 
      otherImg.absurdityLevel && 
      otherImg.absurdityLevel > (image.absurdityLevel || 0)
    );
    
    return higherLevelExists;
  };

  // Handler for escalation with immediate feedback
  const handleEscalate = (image: UploadedImage) => {
    if (!onEscalate) return;
    
    // Add to escalating set immediately
    setEscalatingImages(prev => new Set(prev).add(image._id));
    
    // Call the original escalate function
    onEscalate(image);
  };

  // Check if an image is currently being escalated
  const isEscalating = (imageId: string): boolean => {
    return escalatingImages.has(imageId);
  };

  // Clean up escalating state when new images appear or escalation completes
  useEffect(() => {
    // Clear escalating state for images that now have higher-level versions
    const toRemove: string[] = [];
    escalatingImages.forEach(imageId => {
      const image = uploadedImages.find(img => img._id === imageId);
      if (image && hasBeenEscalated(image)) {
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



  if (allImages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-accent/30 bg-muted/50 rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-lg font-medium mb-2">Ready for the Absurdity Journey!</p>
          <p className="text-sm">Upload or capture an image to start your 5-level transformation adventure</p>
          <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-xs">
            <p className="font-bold text-purple-800 mb-1">🚀 The Absurdity Levels:</p>
            <div className="space-y-1 text-purple-700">
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
    <div className="space-y-4">
      {/* Compact Level Indicator */}
      <div className="flex items-center justify-center">
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          totalImages >= 5 
            ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white animate-pulse' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
        }`}>
          {totalImages >= 5 
            ? '👑 MAXIMUM CHAOS UNLOCKED!' 
            : `🎮 Level ${totalImages} Unlocked!`
          }
        </div>
        {isLoading && (
          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
        )}
      </div>

      {/* Professional Gamified Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allImages.map((image) => (
          <div key={`${image.type}-${image.index}`} className="group">
            {/* Game Card Style Container */}
            <div className="bg-card border border-border hover:border-accent transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl overflow-hidden">
              
              {/* Image Container - Clean and Visible */}
              <div className="aspect-square relative overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-black/95 flex items-center justify-center">
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
              <div className="p-4 space-y-3 bg-gradient-to-r from-muted/50 to-muted/30">
                
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
                            : 'bg-gradient-to-r from-blue-400 to-purple-500'
                        }`}
                        style={{ width: `${(image.data.absurdityLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center font-medium text-muted-foreground">
                      {image.data.absurdityLevel === 5 
                        ? '👑 MAXIMUM CHAOS ACHIEVED!' 
                        : ['', '✨ Getting Dripped', '💎 Seriously Dripped Out', '🔥 Absolutely Ridiculous', '👑 PEAK ABSURDITY!'][image.data.absurdityLevel]
                      }
                    </div>
                  </div>
                )}

                {/* Action Button - Clean and Professional */}
                {onEscalate && image.data.absurdityLevel && image.data.absurdityLevel < 5 && 
                 image.data.generationStatus !== 'pending' && 
                 image.data.generationStatus !== 'processing' && 
                 !hasBeenEscalated(image.data) && !isEscalating(image.data._id) && (
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
                  <div className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>🚀 BOOSTING TO LEVEL {image.data.absurdityLevel + 1}!</span>
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
    </div>
  )
}
