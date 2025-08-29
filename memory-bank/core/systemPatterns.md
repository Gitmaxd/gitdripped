---
title: System Patterns
project: Drip Me Out
version: 0.1.0
created: 2025-08-29
updated: 2025-08-29
author: AI Assistant
type: core
dependencies: [techContext.md, projectbrief.md]
---

# System Patterns: Drip Me Out

## Overview

This document catalogs the architectural and code patterns used throughout the Drip Me Out application, providing guidance for consistent development and maintenance.

## Pattern Categories

### 1. Data Flow Patterns
### 2. UI Component Patterns  
### 3. State Management Patterns
### 4. Error Handling Patterns
### 5. File Processing Patterns
### 6. Real-time Update Patterns

---

## 1. Data Flow Patterns

### Pattern: Convex Reactive Data Flow
**Location**: Throughout app, primary example in `app/page.tsx:40`

```typescript
// Query Pattern
const images = useQuery(api.images.getImages) || [];

// Mutation Pattern  
const generateUploadUrl = useMutation(api.images.generateUploadUrl);
const scheduleImageGeneration = useMutation(api.generate.scheduleImageGeneration);

// Usage in component
const handleAction = async () => {
  const result = await mutation({ data });
  // UI automatically updates via reactive queries
};
```

**Purpose**: Eliminates manual state synchronization by using Convex's reactive system.

**Key Characteristics**:
- No manual refetch needed
- Automatic UI updates on data changes
- Type-safe API calls with generated client

### Pattern: Background Job Scheduling  
**Location**: `convex/generate.ts:79-102`

```typescript
// Schedule Pattern
export const scheduleImageGeneration = mutation({
  handler: async (ctx, args) => {
    // 1. Create pending record
    const originalImageId = await ctx.db.insert("images", {
      body: storageId,
      generationStatus: "pending"
    });
    
    // 2. Schedule background job
    await ctx.scheduler.runAfter(0, internal.generate.generateImage, {
      storageId, originalImageId
    });
    
    return originalImageId;
  },
});
```

**Purpose**: Enables long-running AI processing without blocking user interface.

**Benefits**:
- Resilient to page refreshes
- Handles API timeouts gracefully  
- Provides real-time status updates

---

## 2. UI Component Patterns

### Pattern: Compound Component with State Management
**Location**: `components/Webcam.tsx`

```typescript
// State Hook Pattern
const [isActive, setIsActive] = useState(false);
const [capturedImage, setCapturedImage] = useState<string>('');

// Ref Management Pattern
const videoRef = useRef<HTMLVideoElement>(null);
const streamRef = useRef<MediaStream | null>(null);

// Cleanup Pattern
useEffect(() => {
  return () => {
    stopCamera(); // Cleanup on unmount
  };
}, [stopCamera]);
```

**Purpose**: Encapsulates complex stateful behavior in reusable components.

**Key Features**:
- Proper resource cleanup
- Multiple internal state pieces
- Ref-based DOM manipulation

### Pattern: Conditional Rendering with Loading States
**Location**: `components/ImagePreview.tsx:111-129`

```typescript
// Progressive Loading Pattern
{hasMore && (
  <div className="flex items-center justify-center py-6">
    <Button onClick={onLoadMore} disabled={isLoading}>
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
```

**Purpose**: Provides clear user feedback during async operations.

**Characteristics**:
- Loading spinners for visual feedback
- Dynamic button text based on state
- Disabled states prevent double-clicks

---

## 3. State Management Patterns

### Pattern: Derived State with useMemo
**Location**: `app/page.tsx:54-64`

```typescript
// Derived State Pattern
const generatedImages = useMemo(() => {
  return images.filter(img => img.isGenerated);
}, [images]);

const hasActiveGenerations = useMemo(() => {
  return images.some(img => 
    img.generationStatus === 'pending' || 
    img.generationStatus === 'processing'
  );
}, [images]);
```

**Purpose**: Prevents unnecessary re-computations and rendering loops.

**Benefits**:
- Performance optimization
- Prevents infinite re-renders
- Clear dependency tracking

### Pattern: Ref-based State Tracking
**Location**: `app/page.tsx:49-82`

```typescript
// Anti-loop Pattern with Refs
const prevImagesLengthRef = useRef<number>(0);
const prevGeneratedLengthRef = useRef<number>(0);

useEffect(() => {
  const currentGeneratedLength = generatedImages.length;
  
  // Only update if actual content changed, not just references
  if (currentGeneratedLength !== prevGeneratedLengthRef.current) {
    setDisplayedImages(generatedImages.slice(0, IMAGES_PER_PAGE));
    prevGeneratedLengthRef.current = currentGeneratedLength;
  }
}, [generatedImages]);
```

**Purpose**: Prevents infinite useEffect loops while tracking actual data changes.

---

## 4. Error Handling Patterns

### Pattern: Typed Error Detection
**Location**: `app/page.tsx:115-121`

```typescript
// Error Classification Pattern
const isQuotaError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  return errorMessage.includes('quota') ||
         errorMessage.includes('RESOURCE_EXHAUSTED') ||
         errorMessage.includes('rate limit') ||
         errorMessage.includes('429');
};
```

**Purpose**: Provides specific user feedback based on error types.

**Usage**: Different toast messages and actions based on error classification.

### Pattern: Progressive Error Recovery
**Location**: `convex/generate.ts:213-233`

```typescript
// Error Recovery Pattern
try {
  // ... main processing logic
} catch (error) {
  console.error(`[generateImage] Failed to generate image:`, error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  try {
    await ctx.runMutation(api.generate.updateImageStatus, {
      imageId: originalImageId,
      status: "failed",
      error: errorMessage
    });
  } catch (updateError) {
    console.error(`[generateImage] Failed to update image status:`, updateError);
  }
}
```

**Purpose**: Ensures system remains in consistent state even when error handling fails.

---

## 5. File Processing Patterns

### Pattern: File to Storage Pipeline
**Location**: `app/page.tsx:200-216`

```typescript
// Upload Pipeline Pattern
const uploadResult = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": selectedImage.type },
  body: selectedImage,
});

const { storageId } = await uploadResult.json();

// Then schedule processing
await scheduleImageGeneration({ storageId });
```

**Purpose**: Consistent file handling from client to Convex storage.

**Flow**: File → Upload URL → Storage ID → Background Processing

### Pattern: Base64 Image Conversion
**Location**: `convex/generate.ts:9-28`

```typescript
// Conversion Utility Pattern
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

**Purpose**: Handles image format conversions for AI processing.

**Usage**: Storage → ArrayBuffer → Base64 → AI API → Base64 → Storage

---

## 6. Real-time Update Patterns

### Pattern: Status-driven UI Updates
**Location**: `app/page.tsx:353-361`

```typescript
// Real-time Status Indicator
{hasActiveGenerations && (
  <div className="fixed bottom-4 right-4 z-50">
    <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
      <span>Generating...</span>
    </div>
  </div>
)}
```

**Purpose**: Provides immediate visual feedback for background operations.

**Behavior**: Automatically appears/disappears based on processing state.

### Pattern: Image Status Overlay  
**Location**: `components/ImagePreview.tsx:93-103`

```typescript
// Dynamic Overlay Pattern
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

**Purpose**: Shows processing state directly on affected images.

---

## Best Practices Observed

### Code Organization
- **Feature Co-location**: Related functionality grouped in single files
- **Type Safety**: Comprehensive TypeScript usage throughout
- **Separation of Concerns**: Clear boundaries between UI, data, and business logic

### Performance Patterns  
- **Memoization**: Extensive use of useMemo for expensive computations
- **Ref Usage**: Strategic refs to prevent unnecessary re-renders
- **Lazy Loading**: Built-in Next.js image optimization

### User Experience Patterns
- **Progressive Enhancement**: App works with JavaScript disabled for basic features
- **Loading States**: Every async operation has visual feedback
- **Error Recovery**: Graceful degradation and user-friendly error messages

### Development Patterns
- **Function Naming**: Clear, descriptive function names (e.g., `scheduleImageGeneration`)
- **Component Props**: Well-typed interfaces for all component props
- **Error Logging**: Comprehensive logging for debugging and monitoring

---

## Anti-patterns to Avoid

### Infinite Re-render Loops
❌ **Don't**: Use objects/arrays directly in useEffect dependencies
✅ **Do**: Use refs or memoized values to track actual changes

### Blocking Operations
❌ **Don't**: Run long operations in React event handlers
✅ **Do**: Use Convex scheduler for background processing

### State Mutation
❌ **Don't**: Directly mutate state objects
✅ **Do**: Use functional updates and immutable patterns

### Resource Leaks
❌ **Don't**: Forget to cleanup refs and subscriptions
✅ **Do**: Always include cleanup in useEffect return

---

## Related Documentation

- **Convex Real-time Patterns**: [patterns/convex-reactivity.md](../patterns/convex-reactivity.md)
- **Image Processing Pipeline**: [patterns/image-processing.md](../patterns/image-processing.md)
- **Error Handling Strategies**: [patterns/error-handling.md](../patterns/error-handling.md)
- **Performance Optimization**: [patterns/performance-optimization.md](../patterns/performance-optimization.md)
- **Component Architecture**: [patterns/component-architecture.md](../patterns/component-architecture.md)