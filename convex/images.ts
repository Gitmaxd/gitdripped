import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to get the latest image from each user
function getLatestImagePerUser(images: any[]) {
  const userImageMap = new Map<string, any>();
  
  images.forEach(img => {
    const userId = img.userId;
    if (!userId) return;
    
    const existing = userImageMap.get(userId);
    if (!existing || img.createdAt > existing.createdAt) {
      userImageMap.set(userId, img);
    }
  });
  
  return Array.from(userImageMap.values());
}

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendImage = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.optional(v.string()),
    isGenerated: v.optional(v.boolean()),
    originalImageId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      body: args.storageId,
      createdAt: Date.now(),
      userId: args.userId,
      isGenerated: args.isGenerated,
      originalImageId: args.originalImageId,
    });
  },
});

export const getImages = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all images, then we'll filter and sort on the client side
    const images = await ctx.db.query("images").order("desc").collect();

    // Filter images based on user privacy rules
    const visibleImages = images.filter(img => {
      // Show all images for the current user
      if (args.userId && img.userId === args.userId) {
        return true;
      }
      // Show only the most recent generated images from other users (for public viewing)
      // We'll filter to just the latest from each user later
      if (img.userId !== args.userId && img.absurdityLevel && img.absurdityLevel > 0) {
        return true;
      }
      // Hide Level 0 images from other users (original photos)
      return false;
    });

    // Generate URLs for visible images
    const imagesWithUrls = await Promise.all(
      visibleImages.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.body),
      }))
    );

    // Find the most recent root image for the current user
    const userRootImages = imagesWithUrls.filter(img => 
      img.userId === args.userId && (
        img.rootImageId === img.body || // Original photo format
        (!img.rootImageId && !img.isGenerated) // Fallback for old format
      )
    );
    
    const latestUserRoot = userRootImages[0]; // Most recent user root
    if (!latestUserRoot) {
      // If no user root found, return latest images from other users for browsing
      const otherUsersLatest = getLatestImagePerUser(imagesWithUrls.filter(img => img.userId !== args.userId));
      return otherUsersLatest.slice(0, 10);
    }

    // Get all images from the current user's chain + latest images from others
    const userChainImages = imagesWithUrls.filter(img => 
      // User's complete chain
      img.userId === args.userId && (
        img._id === latestUserRoot._id || // The root image itself
        img.rootImageId === latestUserRoot._id || // Images generated from this root  
        img.rootImageId === latestUserRoot.body // Handle storage ID references
      )
    );

    // Get latest image from each other user for inspiration
    const otherUsersImages = imagesWithUrls.filter(img => img.userId !== args.userId);
    const otherUsersLatest = getLatestImagePerUser(otherUsersImages);

    const chainImages = [...userChainImages, ...otherUsersLatest];

    // Sort by absurdity level for proper progression display (original first, then levels 1-5)
    return chainImages.sort((a, b) => (a.absurdityLevel || 0) - (b.absurdityLevel || 0));
  },
});

export const getImageCount = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db.query("images").order("desc").collect();
    
    // Find the most recent root image chain for the current user
    const userRootImages = images.filter(img => 
      img.userId === args.userId && (
        img.rootImageId === img.body || // Original photo format
        (!img.rootImageId && !img.isGenerated) // Fallback for old format
      )
    );
    
    const latestUserRoot = userRootImages[0]; // Most recent user root
    if (!latestUserRoot) return 0;

    // Get all images from the current user's latest chain
    const chainImages = images.filter(img => 
      img.userId === args.userId && (
        img._id === latestUserRoot._id || // The root image itself
        img.rootImageId === latestUserRoot._id || // Images generated from this root
        img.rootImageId === latestUserRoot.body // Handle storage ID references
      )
    );

    // Find the maximum absurdity level reached (0-5)
    const maxLevel = chainImages.reduce((max, img) => Math.max(max, img.absurdityLevel || 0), 0);
    
    // Return max level + 1 to represent "progression stages completed"
    // Level 0-4 = still progressing, Level 5 = maximum chaos achieved
    return maxLevel;
  },
});

export const getHallOfFameImages = query({
  handler: async (ctx) => {
    // Get all images
    const images = await ctx.db.query("images").order("desc").collect();
    
    // Group images by rootImageId to find each user's journey
    const rootImageGroups = new Map<string, any[]>();
    
    images.forEach(img => {
      const rootId = img.rootImageId || img._id;
      if (!rootImageGroups.has(rootId)) {
        rootImageGroups.set(rootId, []);
      }
      rootImageGroups.get(rootId)!.push(img);
    });
    
    // Find the most recent image for each user (regardless of level)
    const championImages = [];
    
    for (const [rootId, groupImages] of rootImageGroups.entries()) {
      // Find the most recent image in this user's journey
      const champion = groupImages.reduce((latest, current) => {
        // Always prefer the most recent image
        if (current.createdAt > latest.createdAt) {
          return current;
        }
        return latest;
      });
      
      // Only include if it's a generated image (not the original level 0)
      if (champion.absurdityLevel && champion.absurdityLevel > 0) {
        championImages.push(champion);
      }
    }
    
    // Sort by vote count (highest first), then by absurdity level, then by creation date
    championImages.sort((a, b) => {
      const votesA = a.voteCount || 0;
      const votesB = b.voteCount || 0;
      
      if (votesA !== votesB) {
        return votesB - votesA; // Highest votes first
      }
      
      const levelA = a.absurdityLevel || 0;
      const levelB = b.absurdityLevel || 0;
      
      if (levelA !== levelB) {
        return levelB - levelA; // Highest level first
      }
      
      return b.createdAt - a.createdAt; // Most recent first for same level and votes
    });
    
    // Generate URLs for the champion images
    const championsWithUrls = await Promise.all(
      championImages.map(async (image, index) => ({
        ...image,
        url: await ctx.storage.getUrl(image.body),
        rank: index + 1, // Add ranking based on vote-sorted order
        voteCount: image.voteCount || 0,
      }))
    );
    
    return championsWithUrls;
  },
});