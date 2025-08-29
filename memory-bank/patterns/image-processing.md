---
title: Image Processing Pipeline Pattern
project: Drip Me Out
version: 0.1.0
created: 2025-08-29
updated: 2025-08-29
author: AI Assistant
type: pattern
category: data-processing
dependencies: [../core/systemPatterns.md, convex-reactivity.md]
---

# Image Processing Pipeline Pattern

## Overview

The Image Processing Pipeline Pattern orchestrates the flow of images from user input through AI enhancement to final display, using Convex's storage, scheduling, and real-time capabilities to create a seamless background processing experience.

## Problem Solved

AI image processing presents several challenges:
- Long processing times (10-30 seconds)
- User interface must remain responsive
- Processing must survive page refreshes
- Status updates need to be real-time
- Error handling for API failures
- File format conversions for AI models

## Pattern Architecture

### Pipeline Overview
```
User Input → Upload → Storage → Schedule → Background AI → Storage → Display
    ↓           ↓        ↓         ↓            ↓           ↓         ↓
  [File/       [Convex  [Storage  [Queue      [Gemini     [Result   [Reactive
   Webcam]     Upload]   ID]       Job]        API]        Storage]   UI]
```

## Implementation Components

### 1. Input Handling Pattern
**Location**: `app/page.tsx:123-192` (webcam) and `app/page.tsx:194-261` (file)

```typescript
// Unified input handling for both webcam and file upload
const handleImageCapture = async (imageData: string) => {
  setIsCapturing(true);
  
  try {
    // Convert base64 to blob for consistent processing
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Enter standard upload pipeline
    await processImageFile(file);
  } catch (error) {
    console.error("Failed to process captured image:", error);
  } finally {
    setIsCapturing(false);
  }
};

const handleFileUpload = async (file: File) => {
  await processImageFile(file);
};

// Common processing pipeline
const processImageFile = async (file: File) => {
  // Step 1: Get upload URL
  const uploadUrl = await generateUploadUrl();
  
  // Step 2: Upload to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  
  const { storageId } = await result.json();
  
  // Step 3: Schedule background processing
  await scheduleImageGeneration({ storageId });
};
```

### 2. Background Job Scheduling Pattern
**Location**: `convex/generate.ts:79-102`

```typescript
// Schedule pattern with immediate database record
export const scheduleImageGeneration = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Create pending record immediately for UI reactivity
    const originalImageId = await ctx.db.insert("images", {
      body: args.storageId,
      createdAt: Date.now(),
      isGenerated: false,
      generationStatus: "pending",
    });

    // Schedule background job (runs immediately but non-blocking)
    await ctx.scheduler.runAfter(0, internal.generate.generateImage, {
      storageId: args.storageId,
      originalImageId,
    });

    return originalImageId;
  },
});
```

### 3. Background Processing Pattern
**Location**: `convex/generate.ts:104-233`

```typescript
// Comprehensive background job with error handling
export const generateImage = internalAction({
  args: {
    storageId: v.id("_storage"),
    originalImageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: args.originalImageId,
        status: "processing",
      });

      // Load and convert image
      const baseImageUrl = await ctx.storage.getUrl(args.storageId);
      const response = await fetch(baseImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = arrayBufferToBase64(arrayBuffer);

      // AI Processing
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [
          { text: "Add a bust down diamond chain, if the person is smiling, make have diamond grills" },
          { inlineData: { mimeType: response.headers.get("content-type"), data: base64Image } }
        ],
      });

      // Extract and store result
      const resultImage = extractImageFromResponse(genResponse);
      const generatedStorageId = await ctx.storage.store(resultImage);

      // Save generated image record
      await ctx.runMutation(api.generate.saveGeneratedImage, {
        storageId: generatedStorageId,
        originalImageId: args.originalImageId,
      });

      // Mark original as completed
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: args.originalImageId,
        status: "completed",
      });

    } catch (error) {
      // Comprehensive error handling
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: args.originalImageId,
        status: "failed",
        error: error.message,
      });
    }
  },
});
```

### 4. Format Conversion Utilities
**Location**: `convex/generate.ts:9-28`

```typescript
// Base64 conversion utilities for AI API compatibility
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binaryString.length));
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
```

### 5. Status Tracking Pattern
**Location**: `convex/schema.ts:4-16`

```typescript
// Database schema for status tracking
export default defineSchema({
  images: defineTable({
    body: v.string(),                    // Storage ID reference
    createdAt: v.number(),               // Timestamp
    isGenerated: v.optional(v.boolean()),  // true for AI results
    originalImageId: v.optional(v.string()), // Links results to originals
    generationStatus: v.optional(v.string()), // "pending" | "processing" | "completed" | "failed"
    generationError: v.optional(v.string()),  // Error details if failed
  })
  .index("by_generation_status", ["generationStatus"])
  .index("by_is_generated", ["isGenerated"])
});
```

## Key Pattern Benefits

### 1. Resilient to Interruptions
- Processing continues even if user closes browser
- Status persists across page refreshes
- Background jobs are reliable and retryable

### 2. Real-time User Feedback
- Immediate status updates via Convex reactivity
- Visual indicators during processing
- Error messages for failed generations

### 3. Efficient Resource Usage
- Non-blocking UI operations
- Background processing doesn't impact frontend performance
- Proper cleanup and error handling

### 4. Scalable Architecture
- Jobs can be processed by multiple workers
- Easy to add processing steps or modifications
- Clear separation between sync and async operations

## Advanced Patterns

### Error Classification and Recovery
**Location**: `app/page.tsx:115-121`

```typescript
// Classify errors for appropriate user messaging
const isQuotaError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  return errorMessage.includes('quota') ||
         errorMessage.includes('RESOURCE_EXHAUSTED') ||
         errorMessage.includes('rate limit');
};

// Handle different error types with specific user guidance
if (isQuotaError(genError)) {
  toast.error("Gemini API Quota Exceeded", {
    description: "You've reached your daily limit. Try again later.",
    action: {
      label: "Learn More",
      onClick: () => window.open("https://ai.google.dev/gemini-api/docs/rate-limits")
    }
  });
}
```

### Status-driven UI Updates
**Location**: `components/ImagePreview.tsx:93-103`

```typescript
// Automatically show processing state on images
{(image.data.generationStatus === 'pending' || image.data.generationStatus === 'processing') && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
      <p className="text-sm font-medium">
        {image.data.generationStatus === 'pending' ? 'Queued' : 'Processing'}
      </p>
    </div>
  </div>
)}
```

## Best Practices

### 1. Immediate User Feedback
```typescript
✅ // Good - create pending record immediately
const originalImageId = await ctx.db.insert("images", {
  generationStatus: "pending"
});
await ctx.scheduler.runAfter(0, processJob, { originalImageId });

❌ // Bad - no immediate feedback
await ctx.scheduler.runAfter(0, processAndCreateRecord, { data });
```

### 2. Comprehensive Error Handling
```typescript
✅ // Good - handle both job failure and status update failure
try {
  await processImage();
  await updateStatus("completed");
} catch (error) {
  try {
    await updateStatus("failed", error.message);
  } catch (statusError) {
    console.error("Failed to update status:", statusError);
  }
}

❌ // Bad - single level error handling
try {
  await processImage();
} catch (error) {
  console.error(error);
}
```

### 3. Format Conversion Strategy
```typescript
✅ // Good - handle format conversions explicitly
const mimeType = response.headers.get("content-type") || "image/png";
const base64 = arrayBufferToBase64(await response.arrayBuffer());

❌ // Bad - assume format compatibility
const data = await response.text(); // May not be base64
```

### 4. Status Granularity
```typescript
✅ // Good - specific status states
"pending" | "processing" | "completed" | "failed"

❌ // Bad - vague status states  
"working" | "done"
```

## Performance Considerations

### Memory Management
- Convert images to appropriate formats for each step
- Don't keep large buffers in memory longer than needed
- Use streaming when possible for large files

### API Efficiency
- Single API call per image rather than multiple smaller calls
- Batch operations where possible
- Implement exponential backoff for retries

### Storage Optimization
- Store images in compressed formats
- Consider cleanup policies for old images
- Use CDN caching for frequently accessed images

## Testing Strategies

### Unit Testing
```typescript
// Test format conversion functions
expect(arrayBufferToBase64(buffer)).toBe(expectedBase64);

// Test error classification
expect(isQuotaError(new Error("quota exceeded"))).toBe(true);
```

### Integration Testing
```typescript
// Test full pipeline with mocked AI API
const storageId = await uploadTestImage();
const jobId = await scheduleImageGeneration({ storageId });
// Verify status transitions and final result
```

### Error Scenario Testing
```typescript
// Test API failure handling
// Test network interruption recovery
// Test malformed response handling
```

## Common Pitfalls

### 1. Blocking the UI Thread
```typescript
❌ // Don't do heavy processing in React components
const processImage = async (imageData: string) => {
  const processed = await heavyImageProcessing(imageData); // Blocks UI
  return processed;
};

✅ // Schedule background job instead
const scheduleProcessing = async (storageId: string) => {
  await scheduleImageGeneration({ storageId }); // Returns immediately
};
```

### 2. Not Handling Status Updates
```typescript
❌ // Missing status tracking
await processImage(); // User has no feedback

✅ // Proper status tracking
await updateStatus("processing");
await processImage();
await updateStatus("completed");
```

### 3. Format Assumptions
```typescript
❌ // Assuming format without checking
const base64 = await response.text();

✅ // Verify and convert formats
const mimeType = response.headers.get("content-type");
const buffer = await response.arrayBuffer();
const base64 = arrayBufferToBase64(buffer);
```

## Related Patterns

- **Convex Reactivity**: Powers the real-time status updates
- **Error Handling**: Critical for robust pipeline operation
- **Background Job Scheduling**: Core mechanism for non-blocking processing
- **File Storage Management**: Handles input and output storage

## Migration Notes

### From Synchronous Processing
1. Move heavy operations to background jobs
2. Add status tracking to database schema  
3. Implement real-time UI updates
4. Add comprehensive error handling

### From Polling-based Updates
1. Replace polling with Convex reactive queries
2. Remove manual status check intervals
3. Trust automatic UI updates

---

*This pattern is essential for any application requiring long-running background processing with real-time user feedback.*