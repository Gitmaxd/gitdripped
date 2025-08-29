---
title: Convex Reactivity Pattern
project: Drip Me Out
version: 0.1.0
created: 2025-08-29
updated: 2025-08-29
author: AI Assistant
type: pattern
category: data-flow
dependencies: [../core/systemPatterns.md]
---

# Convex Reactivity Pattern

## Overview

The Convex Reactivity Pattern leverages Convex's built-in reactive query system to automatically update the UI when backend data changes, eliminating the need for manual state synchronization or refetching logic.

## Problem Solved

Traditional React applications require manual state management for server data:
- Manual refetch after mutations
- Complex loading states management  
- Race conditions between updates
- Stale data synchronization issues

## Pattern Implementation

### Basic Query Pattern
**Location**: `app/page.tsx:40`

```typescript
// Reactive Query - automatically updates when data changes
const images = useQuery(api.images.getImages) || [];

// Derived state from reactive data
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

### Mutation + Automatic Update Pattern
**Location**: `app/page.tsx:30-33, 218-227`

```typescript
// Mutation hooks - trigger data changes
const generateUploadUrl = useMutation(api.images.generateUploadUrl);
const scheduleImageGeneration = useMutation(api.generate.scheduleImageGeneration);

// Usage - no manual refetch needed
const handleAction = async () => {
  try {
    await scheduleImageGeneration({ storageId });
    // UI automatically updates via reactive queries
    // No need to call refetch() or update local state
    
    toast.success("Image Generation Started!");
  } catch (error) {
    // Handle errors without affecting reactivity
    toast.error("Failed to start generation");
  }
};
```

### Real-time Status Updates
**Location**: Throughout app, driven by database changes

```typescript
// Status changes in backend automatically propagate to UI
export const updateImageStatus = mutation({
  args: {
    imageId: v.id("images"),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This update automatically triggers UI reactivity
    await ctx.db.patch(args.imageId, { 
      generationStatus: args.status,
      generationError: args.error 
    });
  },
});
```

## Key Benefits

### 1. Zero Manual Synchronization
- No `refetch()` calls needed
- No manual cache invalidation
- No stale data management

### 2. Real-time User Experience  
- Instant UI updates on data changes
- Live status indicators
- Collaborative-ready architecture

### 3. Simplified Error Handling
- Mutations handle business logic
- Queries handle presentation
- Clear separation of concerns

### 4. Performance Optimization
- Automatic subscription management
- Efficient change detection
- Minimal re-renders

## Advanced Patterns

### Preventing Infinite Loops
**Location**: `app/page.tsx:49-82`

```typescript
// Use refs to track actual data changes, not React reference changes
const prevImagesLengthRef = useRef<number>(0);

useEffect(() => {
  const currentLength = images.length;
  
  // Only update if actual data changed, not just React references
  if (currentLength !== prevImagesLengthRef.current) {
    setDisplayedImages(images.slice(0, IMAGES_PER_PAGE));
    prevImagesLengthRef.current = currentLength;
  }
}, [images]); // Safe to depend on reactive query result
```

### Conditional Rendering Based on Data State
**Location**: `app/page.tsx:353-361`

```typescript
// UI automatically responds to data state changes
{hasActiveGenerations && (
  <div className="fixed bottom-4 right-4 z-50">
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4"></div>
      <span>Generating...</span>
    </div>
  </div>
)}
```

## Best Practices

### 1. Trust the Reactivity
```typescript
✅ // Good - trust reactive updates
const images = useQuery(api.images.getImages) || [];

❌ // Bad - manual refetch breaks reactivity model  
const [images, setImages] = useState([]);
const refetchImages = () => {
  api.images.getImages().then(setImages);
};
```

### 2. Use Fallback Values
```typescript
✅ // Good - handle loading state gracefully
const images = useQuery(api.images.getImages) || [];

❌ // Bad - can cause undefined errors
const images = useQuery(api.images.getImages);
if (images) { /* render */ }
```

### 3. Combine with useMemo for Performance
```typescript
✅ // Good - optimize derived computations  
const activeImages = useMemo(() => 
  images.filter(img => img.status === 'active'), 
  [images]
);

❌ // Bad - recalculate on every render
const activeImages = images.filter(img => img.status === 'active');
```

### 4. Separate Mutations from Queries
```typescript
✅ // Good - clear separation
const images = useQuery(api.images.getImages);
const createImage = useMutation(api.images.create);

❌ // Bad - mixing concerns
const [images, setImages] = useState([]);
const createAndFetchImages = async () => {
  await api.images.create(data);
  const updated = await api.images.getImages();
  setImages(updated);
};
```

## Common Pitfalls

### 1. Fighting the Reactivity
**Problem**: Trying to manually manage what Convex handles automatically
```typescript
❌ // Don't do this - fighting reactivity
useEffect(() => {
  api.images.getImages().then(data => {
    setLocalImages(data); // Unnecessary duplication
  });
}, []);
```

**Solution**: Trust the reactive queries
```typescript
✅ // Let Convex handle it
const images = useQuery(api.images.getImages) || [];
```

### 2. Over-optimizing with Dependencies
**Problem**: Creating unnecessary effect dependencies
```typescript
❌ // Overly complex dependency tracking
useEffect(() => {
  // Complex logic here
}, [images.length, images[0]?.status, /* etc */]);
```

**Solution**: Use derived state with useMemo
```typescript
✅ // Clean derived state
const imageStats = useMemo(() => ({
  total: images.length,
  active: images.filter(img => img.status === 'active').length
}), [images]);
```

## Integration with Other Patterns

### With Background Processing
```typescript
// Mutation triggers background job
const scheduleJob = useMutation(api.jobs.schedule);

// Query automatically shows job status updates  
const jobStatus = useQuery(api.jobs.getStatus, { jobId });

// UI reacts to status changes automatically
{jobStatus === 'processing' && <Spinner />}
```

### With Real-time Collaboration
```typescript
// Multiple users can trigger mutations
const updateDocument = useMutation(api.docs.update);

// All connected clients see updates instantly
const document = useQuery(api.docs.get, { docId });

// No polling or manual sync needed
```

## Performance Characteristics

### Subscription Efficiency
- Convex only sends changed data
- Minimal network traffic
- Efficient change detection

### React Integration
- Hooks follow React patterns
- Compatible with Suspense
- Optimized re-render behavior

### Memory Management
- Automatic cleanup on unmount
- No memory leaks from subscriptions
- Efficient resource usage

## Testing Considerations

### Unit Testing
```typescript
// Mock Convex hooks for testing
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Test component behavior with different data states
```

### Integration Testing  
```typescript
// Test full reactive flow
// 1. Trigger mutation
// 2. Verify query updates
// 3. Confirm UI reflects changes
```

## Related Patterns

- **Background Job Scheduling**: Works seamlessly with reactivity
- **Real-time Status Updates**: Powered by reactive queries
- **Error Handling**: Mutations handle errors, queries handle display
- **Performance Optimization**: useMemo complements reactivity

## Migration Notes

### From Manual State Management
1. Replace useState with useQuery for server data
2. Remove manual refetch logic
3. Trust automatic updates
4. Simplify error handling

### From Other Real-time Solutions  
1. Remove polling logic
2. Remove WebSocket management  
3. Remove manual subscription handling
4. Leverage Convex's built-in reactivity

---

*This pattern is fundamental to the Drip Me Out architecture and should be the default approach for all server state management.*