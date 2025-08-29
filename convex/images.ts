import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendImage = mutation({
  args: {
    storageId: v.id("_storage"),
    isGenerated: v.optional(v.boolean()),
    originalImageId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      body: args.storageId,
      createdAt: Date.now(),
      isGenerated: args.isGenerated,
      originalImageId: args.originalImageId,
    });
  },
});

export const getImages = query({
  handler: async (ctx) => {
    // Get all images, then we'll filter and sort on the client side
    const images = await ctx.db.query("images").order("desc").collect();

    // Generate URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.body),
      }))
    );

    // Find the most recent root image (original photo)
    // Root images are the first in a chain - they have rootImageId pointing to their storage ID
    const rootImages = imagesWithUrls.filter(img => 
      img.rootImageId === img.body || // Original photo format
      (!img.rootImageId && !img.isGenerated) // Fallback for old format
    );
    
    const latestRoot = rootImages[0]; // Most recent root
    if (!latestRoot) return [];

    // Get all images from this chain - either the root itself or images pointing to the root
    const chainImages = imagesWithUrls.filter(img => 
      img._id === latestRoot._id || // The root image itself
      img.rootImageId === latestRoot._id || // Images generated from this root  
      img.rootImageId === latestRoot.body // Handle storage ID references
    );

    // Sort by absurdity level for proper progression display (original first, then levels 1-5)
    return chainImages.sort((a, b) => (a.absurdityLevel || 0) - (b.absurdityLevel || 0));
  },
});

export const getImageCount = query({
  handler: async (ctx) => {
    const images = await ctx.db.query("images").order("desc").collect();
    
    // Find the most recent root image chain
    const rootImages = images.filter(img => 
      img.rootImageId === img.body || // Original photo format
      (!img.rootImageId && !img.isGenerated) // Fallback for old format
    );
    
    const latestRoot = rootImages[0]; // Most recent root
    if (!latestRoot) return 0;

    // Get all images from the latest chain
    const chainImages = images.filter(img => 
      img._id === latestRoot._id || // The root image itself
      img.rootImageId === latestRoot._id || // Images generated from this root
      img.rootImageId === latestRoot.body // Handle storage ID references
    );

    // Find the maximum absurdity level reached (0-5)
    const maxLevel = chainImages.reduce((max, img) => Math.max(max, img.absurdityLevel || 0), 0);
    
    // Return max level + 1 to represent "progression stages completed"
    // Level 0-4 = still progressing, Level 5 = maximum chaos achieved
    return maxLevel;
  },
});