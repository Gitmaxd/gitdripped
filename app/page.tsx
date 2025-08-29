"use client";
import ConvexFloatingBubble from "@/components/ConvexFloatingBubble";
import ImagePreview from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Webcam from "@/components/Webcam";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const images = useQuery(api.images.getImages) || [];
  const imageCount = useQuery(api.images.getImageCount) || 0;
  console.log('🔵 [DEBUG] Images from Convex:', images.length, 'images loaded', 'Total count:', imageCount);
  const [isCapturing, setIsCapturing] = useState(false);

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
  }, [generatedImages.length, displayedImages.length]);

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
      
      toast.success(`🚀 ESCALATING TO ${levelNames[nextLevel]}!`, {
        description: `Level ${nextLevel} transformation in progress! ${nextLevel === 5 ? 'Prepare for ULTIMATE CHAOS!' : 'Watch the image transform and keep going!'}`,
        duration: 8000,
        action: {
          label: nextLevel === 5 ? "WITNESS THE CHAOS! 👑" : "🎮 SEE PROGRESS",
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
    
    // Check if user has reached maximum absurdity (Level 5)
    if (imageCount >= 5) {
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
      setIsGenerating(true);
      try {
        console.log('🔵 [DEBUG] Scheduling progressive generation...');
        const result = await scheduleProgressiveGeneration({ storageId });
        console.log("🔵 [DEBUG] Progressive generation scheduled successfully! Result:", result);

        // Show engaging success toast
        toast.success("🚀 ABSURDITY JOURNEY BEGINS!", {
          description: "Level 1 in progress! Click 'GET MORE RIDICULOUS' to escalate through 5 levels of chaos!",
          duration: 8000,
          action: {
            label: "See the Magic ✨",
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
      } finally {
        setIsGenerating(false);
      }

      console.log("Image captured and uploaded successfully!");

    } catch (error) {
      console.error("Failed to upload captured image:", error);
      // You could add error handling UI here
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSendImage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedImage) return;

    // Check if user has reached maximum absurdity (Level 5)
    if (imageCount >= 5) {
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

    setIsUploading(true);

    try {
      // Step 1: Get an upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload the file to the generated URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();

      // Step 3: Schedule progressive generation (starts at level 1)
      setIsGenerating(true);
      try {
        await scheduleProgressiveGeneration({ storageId });
        console.log("Progressive generation scheduled successfully!");

        // Show engaging success toast
        toast.success("🚀 ABSURDITY JOURNEY BEGINS!", {
          description: "Level 1 in progress! Click 'GET MORE RIDICULOUS' to escalate through 5 levels of chaos!",
          duration: 8000,
          action: {
            label: "See the Magic ✨",
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
      } finally {
        setIsGenerating(false);
      }

      // Reset the form
      setSelectedImage(null);
      imageInput.current!.value = "";

    } catch (error) {
      console.error("Upload failed:", error);
      // You could add error handling UI here
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-4 lg:p-6">
      <div className="flex flex-col items-start justify-start gap-2 w-full">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Git Dripped</h1>
          <Link
            href="https://github.com/michaelshimeles/drip-me-out"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View source code on GitHub"
          >
            <Button variant="ghost" size="icon">
              <GithubIcon />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            📸 Snap a photo and watch yourself transform into a diamond deity through 5 levels of pure chaos!
          </p>
          
          {/* Image Limit Status */}
          <div className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
            imageCount >= 5 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : imageCount >= 3 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {imageCount >= 5 
              ? '🚫 Maximum Chaos Reached (Level 5)' 
              : `✨ Level ${imageCount}/5 progression`
            }
          </div>
        </div>
      </div>
      {/** Image upload or open camera */}
      <div className="w-full mt-6 sm:mt-8 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Camera/Upload Section */}
          <div className="lg:max-w-2xl w-full">
            <Tabs defaultValue="camera">
              <TabsList>
                <TabsTrigger value="camera" className="text-sm font-medium">📸 Camera</TabsTrigger>
                {/* <TabsTrigger value="upload" className="text-sm font-medium">📤 Upload</TabsTrigger> */}
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Image</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center">
                    {imageCount >= 5 ? (
                      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-4xl mb-2">👑</div>
                        <h3 className="font-bold text-red-800 mb-1">Maximum Chaos Achieved!</h3>
                        <p className="text-sm text-red-600">You&apos;ve reached Level 5 - the ultimate absurdity! Your journey is complete!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={imageInput}
                          onChange={(event) => setSelectedImage(event.target.files![0])}
                          disabled={selectedImage !== null}
                          className="w-full"
                        />
                        <Button
                          type="submit"
                          onClick={handleSendImage}
                          size="sm"
                          variant="outline"
                          className="w-full h-11"
                          disabled={isUploading || isGenerating || !selectedImage}
                        >
                          {isUploading ? "Uploading..." : isGenerating ? "Generating..." : "Upload & Generate"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="camera" className="mt-4">
                <div className="w-full">
                  {imageCount >= 5 ? (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-6xl mb-4">👑</div>
                      <h3 className="text-xl font-bold text-red-800 mb-2">Maximum Chaos Achieved!</h3>
                      <p className="text-red-600 mb-4">You&apos;ve reached Level 5 - the ultimate absurdity! Your journey is complete!</p>
                    </div>
                  ) : (
                    <Webcam onCapture={handleImageCapture} isUploading={isCapturing} />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Image Preview Section */}
          <div className="w-full">
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

        {/* Mobile-optimized generating indicator */}
        {hasActiveGenerations && (
          <div className="fixed bottom-4 right-4 lg:top-6 lg:right-6 z-50">
            <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span className="text-sm text-muted-foreground font-medium">Generating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Convex Showcase Bubble */}
      <ConvexFloatingBubble />
    </div>
  );
}
