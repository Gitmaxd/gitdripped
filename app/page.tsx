"use client";
import ConvexFloatingBubble from "@/components/ConvexFloatingBubble";
import ImagePreview from "@/components/ImagePreview";
import HallOfFame from "@/components/HallOfFame";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Webcam from "@/components/Webcam";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GithubIcon } from "lucide-react";
import Link from "next/link";

// Type definition for image objects (matching Convex schema)
interface ImageObject {
  _id: string;
  body: string;
  createdAt: number;
  _creationTime: number;
  isGenerated?: boolean;
  originalImageId?: string;
  generationStatus?: string;
  generationError?: string;
  url: string | null;
  // Progressive Absurdity fields
  generationCount?: number;
  rootImageId?: string;
  absurdityLevel?: number;
  previousPrompt?: string;
}

export default function Home() {
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  // Image generation scheduling mutations
  const scheduleProgressiveGeneration = useMutation(api.generate.scheduleProgressiveGeneration);


  const imagesQuery = useQuery(api.images.getImages);
  const imageCount = useQuery(api.images.getImageCount) || 0;
  
  // Memoize images to prevent dependency issues in other hooks
  const images = useMemo(() => imagesQuery || [], [imagesQuery]);
  
  console.log('🔵 [DEBUG] Images from Convex:', images.length, 'images loaded', 'Total count:', imageCount);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mainView, setMainView] = useState<'journey' | 'hall-of-fame'>('journey');

  // Pagination state for infinite scroll
  const [displayedImages, setDisplayedImages] = useState<ImageObject[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const IMAGES_PER_PAGE = 12; // 3 columns x 4 rows

  // Use refs to prevent infinite loops
  const prevImagesLengthRef = useRef<number>(0);
  const prevGeneratedLengthRef = useRef<number>(0);

  // Memoize generated images to prevent infinite re-renders
  const generatedImages = useMemo(() => {
    return images.filter(img => img.isGenerated);
  }, [images]);

  // Check if there are any actively processing images
  const hasActiveGenerations = useMemo(() => {
    return images.some(img =>
      img.generationStatus === 'pending' ||
      img.generationStatus === 'processing'
    );
  }, [images]);


  // Initialize displayed images when images load (only when content actually changes)
  useEffect(() => {
    const currentGeneratedLength = generatedImages.length;
    const currentImagesLength = images.length;

    // Only update if the actual content has changed, not just references
    if (currentGeneratedLength !== prevGeneratedLengthRef.current ||
      currentImagesLength !== prevImagesLengthRef.current) {
      setDisplayedImages(generatedImages.slice(0, IMAGES_PER_PAGE));
      setCurrentPage(0);

      // Update refs to track previous state
      prevGeneratedLengthRef.current = currentGeneratedLength;
      prevImagesLengthRef.current = currentImagesLength;
    }
  }, [generatedImages, images]);

  // Reset pagination when new images are added
  useEffect(() => {
    if (generatedImages.length > 0 && displayedImages.length === 0) {
      setDisplayedImages(generatedImages.slice(0, IMAGES_PER_PAGE));
      setCurrentPage(0);
    }
  }, [generatedImages, displayedImages.length, IMAGES_PER_PAGE]);

  // Handle loading more images for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;

    const totalImages = generatedImages.length;
    const nextPage = currentPage + 1;
    const startIndex = nextPage * IMAGES_PER_PAGE;
    const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, totalImages);

    if (startIndex < totalImages) {
      setIsLoadingMore(true);

      // Load images immediately without artificial delay for fluid experience
      setDisplayedImages(prev => [
        ...prev,
        ...generatedImages.slice(startIndex, endIndex)
      ]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }
  }, [generatedImages, currentPage, isLoadingMore]);

  // Helper function to check if error is a quota/rate limit error
  const isQuotaError = (error: unknown): boolean => {
    const errorMessage = error instanceof Error ? error.message : String(error || '');
    return errorMessage.includes('quota') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('429');
  };

  // Progressive Absurdity: Handle escalation to next level
  const handleEscalation = async (image: { _id: string; body: string; createdAt: number; url: string; generationStatus?: string; generationCount?: number; rootImageId?: string; absurdityLevel?: number; }) => {
    if (!image.url || !image.rootImageId || !image.absurdityLevel) {
      console.error("Cannot escalate: missing required image data");
      return;
    }

    if (image.absurdityLevel >= 5) {
      toast.info("Maximum absurdity already achieved!", {
        description: "This image has reached peak chaos mode 👑"
      });
      return;
    }

    // Note: escalation processing state is now handled by individual image cards
    
    try {
      // Get upload URL for the current image
      const uploadUrl = await generateUploadUrl();
      
      // Fetch the current image and re-upload it
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Re-upload the image for processing
      const uploadResult = await fetch(uploadUrl, {
        method: "POST", 
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      
      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.statusText}`);
      }
      
      const { storageId } = await uploadResult.json();
      
      // Schedule progressive generation
      await scheduleProgressiveGeneration({ 
        storageId,
        rootImageId: image.rootImageId 
      });
      
      const nextLevel = image.absurdityLevel + 1;
      const levelNames = ["", "✨ Getting Dripped", "💎 Seriously Dripped", "🔥 Absolutely Ridiculous", "👑 PEAK ABSURDITY", "🌟 MAXIMUM CHAOS"];
      
      toast.success(`⚡ Level ${nextLevel} Starting!`, {
        description: `${levelNames[nextLevel]} transformation in progress. ${nextLevel === 5 ? 'This is the final level!' : 'Keep escalating for more chaos!'}`,
        duration: 6000,
        action: {
          label: nextLevel === 5 ? "🏆 Final Level!" : "👀 Watch Progress",
          onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      });
      
    } catch (error) {
      console.error("Failed to escalate image:", error);
      
      if (isQuotaError(error)) {
        toast.error("Gemini API Quota Exceeded", {
          description: "You've reached your daily limit. Try again later or upgrade your plan.",
          duration: 8000,
          action: {
            label: "Learn More",
            onClick: () => window.open("https://ai.google.dev/gemini-api/docs/rate-limits", "_blank"),
          },
        });
      } else {
        toast.error("Failed to Escalate", {
          description: "Could not start the next level generation. Please try again.",
          duration: 5000,
        });
      }
    } finally {
      // Escalation state cleanup handled by individual image cards
    }
  };

  const handleImageCapture = async (imageData: string) => {
    console.log('🔵 [DEBUG] Starting image capture process...');
    console.log('🔵 [DEBUG] Image data length:', imageData.length);
    
    // Check if user has reached maximum absurdity (Level 5) and it's fully displayed
    if (displayedImages.some(img => img.absurdityLevel === 5 && img.generationStatus !== 'pending' && img.generationStatus !== 'processing')) {
      toast.error("Maximum Chaos Achieved! 👑", {
        description: "You've reached Level 5 - the ultimate absurdity! Your journey is complete!",
        duration: 6000,
        action: {
          label: "View Gallery",
          onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        }
      });
      return;
    }
    
    setIsCapturing(true);

    try {
      // Convert base64 to blob
      console.log('🔵 [DEBUG] Converting base64 to blob...');
      const response = await fetch(imageData);
      const blob = await response.blob();
      console.log('🔵 [DEBUG] Blob created, size:', blob.size, 'bytes');

      // Create a File object from the blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      console.log('🔵 [DEBUG] File created:', file.name, 'size:', file.size);

      // Step 1: Get an upload URL from Convex
      console.log('🔵 [DEBUG] Getting upload URL from Convex...');
      const uploadUrl = await generateUploadUrl();
      console.log('🔵 [DEBUG] Got upload URL:', uploadUrl);

      // Step 2: Upload the file to the generated URL
      console.log('🔵 [DEBUG] Uploading file to Convex...');
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.statusText}`);
      }

      const { storageId } = await uploadResult.json();
      console.log('🔵 [DEBUG] Upload successful, storageId:', storageId);

      // Step 3: Schedule progressive generation (starts at level 1)
      try {
        console.log('🔵 [DEBUG] Scheduling progressive generation...');
        const result = await scheduleProgressiveGeneration({ storageId });
        console.log("🔵 [DEBUG] Progressive generation scheduled successfully! Result:", result);

        // Show engaging success toast
        toast.success("🎉 Transformation Started!", {
          description: "Level 1 generation in progress. Watch your absurdity journey unfold!",
          duration: 5000,
          action: {
            label: "🚀 View Progress",
            onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        });
      } catch (genError) {
        console.error("Failed to schedule image generation:", genError);

        // Show appropriate toast based on error type
        if (isQuotaError(genError)) {
          toast.error("Gemini API Quota Exceeded", {
            description: "You've reached your daily/monthly limit. Try again later or upgrade your plan.",
            duration: 8000,
            action: {
              label: "Learn More",
              onClick: () => window.open("https://ai.google.dev/gemini-api/docs/rate-limits", "_blank"),
            },
          });
        } else {
          toast.error("Failed to Start Generation", {
            description: "Failed to schedule image generation. Please try again.",
            duration: 5000,
          });
        }
      }

      console.log("Image captured and uploaded successfully!");

    } catch (error) {
      console.error("Failed to upload captured image:", error);
      // You could add error handling UI here
    } finally {
      setIsCapturing(false);
    }
  };

  // Removed upload functionality to optimize for viewport fit

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-background">
      {/* Professional Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Git Dripped
            </h1>
            <Link
              href="https://github.com/Gitmaxd/gitdripped"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
            >
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <GithubIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Status Indicator */}
          <div className={`text-sm font-bold px-4 py-2 rounded-full border backdrop-blur-sm ${
            imageCount >= 5 
              ? 'bg-destructive/20 text-slate-100 border-destructive/30' 
              : imageCount >= 3 
                ? 'bg-chart-4/20 text-chart-4 border-chart-4/30'
                : 'bg-chart-2/20 text-chart-2 border-chart-2/30'
          }`}>
            {imageCount >= 5 
              ? '👑 Max Level' 
              : `✨ Level ${imageCount}/5`
            }
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-shrink-0 px-4 py-2 bg-card/50 border-b border-border/50">
        <Tabs value={mainView} onValueChange={(value) => setMainView(value as 'journey' | 'hall-of-fame')} className="w-full max-w-lg mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger value="journey" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🚀 Your Journey
            </TabsTrigger>
            <TabsTrigger value="hall-of-fame" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🏆 Hall of Fame
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area - Flex-1 to fill remaining space */}
      <div className="flex-1 overflow-hidden">
        {mainView === 'journey' && (
          <div className="h-full bg-background">
            <div className="h-full flex flex-col lg:flex-row gap-3 px-3 sm:px-4 lg:px-6 py-3">
            {/* Camera/Upload Section */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
              <div className="h-full flex flex-col bg-card rounded-lg border border-border shadow-sm p-3">
                <Tabs defaultValue="camera" className="flex-1 flex flex-col">
                  <TabsList className="flex-shrink-0 bg-muted/50 mb-4">
                    <TabsTrigger value="camera" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      📸 Camera
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="camera" className="flex-1 overflow-hidden">
                    <div className="h-full">
                      {displayedImages.some(img => img.absurdityLevel === 5 && img.generationStatus !== 'pending' && img.generationStatus !== 'processing') ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center p-6 bg-gradient-to-br from-chart-4/20 to-chart-5/20 border border-chart-4/30 rounded-xl shadow-lg backdrop-blur-sm">
                            <div className="text-6xl mb-4 animate-bounce">👑</div>
                            <h3 className="text-xl font-bold text-chart-4 mb-2">Maximum Chaos Achieved!</h3>
                            <p className="text-sm text-muted-foreground">Level 5 complete!</p>
                            <div className="mt-4 w-full bg-chart-4/20 rounded-full h-2">
                              <div className="h-2 rounded-full bg-gradient-to-r from-chart-4 to-chart-5 w-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Webcam onCapture={handleImageCapture} isUploading={isCapturing} />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Image Preview Section */}
            <div className="w-full lg:w-2/3 overflow-hidden">
              <div className="h-full overflow-y-auto bg-card/30 rounded-lg border border-border/50 p-3 backdrop-blur-sm">
                <ImagePreview
                  images={[]}
                  uploadedImages={displayedImages.map(image => ({
                    _id: image._id,
                    body: image.body,
                    createdAt: image.createdAt,
                    url: image.url ?? "",
                    generationStatus: image.generationStatus,
                    // Progressive Absurdity fields
                    generationCount: image.generationCount,
                    rootImageId: image.rootImageId,
                    absurdityLevel: image.absurdityLevel,
                  }))}
                  totalImages={generatedImages.length}
                  currentPage={currentPage}
                  imagesPerPage={IMAGES_PER_PAGE}
                  onLoadMore={handleLoadMore}
                  hasMore={displayedImages.length < generatedImages.length}
                  isLoading={isLoadingMore}
                  onEscalate={handleEscalation}
                  showChainProgress={true}
                />
              </div>
            </div>
            </div>
          </div>
        )}

        {mainView === 'hall-of-fame' && (
          <div className="h-full bg-background px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
            <div className="bg-card/30 rounded-lg border border-border/50 p-4 backdrop-blur-sm h-full">
              <HallOfFame />
            </div>
          </div>
        )}
      </div>

      {/* Mobile-optimized generating indicator */}
      {hasActiveGenerations && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
            <span className="text-sm text-muted-foreground font-medium">Generating...</span>
          </div>
        </div>
      )}

      {/* Floating Convex Showcase Bubble - Positioned absolutely */}
      <div className="absolute bottom-4 left-4 z-40">
        <ConvexFloatingBubble />
      </div>
    </div>
  );
}
