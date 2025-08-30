import { mutation, internalMutation } from "./_generated/server";

export const clearAllImages = mutation({
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    console.log(`Found ${images.length} images to delete`);
    
    // Delete all images one by one
    for (const image of images) {
      await ctx.db.delete(image._id);
    }
    
    console.log("All images deleted successfully");
    return `Deleted ${images.length} images from the database`;
  },
});

/**
 * Automatically delete images older than 1 hour
 * This function is called by a cron job every 5 minutes
 */
export const deleteOldImages = internalMutation({
  handler: async (ctx) => {
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    const cutoffTime = Date.now() - ONE_HOUR;
    
    console.log(`Looking for images older than ${new Date(cutoffTime).toISOString()}`);
    
    // Get all images older than 1 hour
    const oldImages = await ctx.db
      .query("images")
      .filter((q) => q.lt(q.field("createdAt"), cutoffTime))
      .collect();
    
    console.log(`Found ${oldImages.length} old images to delete`);
    
    if (oldImages.length === 0) {
      return "No old images found to delete";
    }
    
    // Delete images, their storage files, and associated votes
    for (const image of oldImages) {
      try {
        // Delete the storage file
        await ctx.storage.delete(image.body);
        console.log(`Deleted storage file for image ${image._id}`);
        
        // Delete associated votes
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_image", (q) => q.eq("imageId", image._id))
          .collect();
        
        for (const vote of votes) {
          await ctx.db.delete(vote._id);
        }
        
        if (votes.length > 0) {
          console.log(`Deleted ${votes.length} votes for image ${image._id}`);
        }
        
        // Finally delete the image record
        await ctx.db.delete(image._id);
        console.log(`Deleted image record ${image._id}`);
        
      } catch (error) {
        console.error(`Error deleting image ${image._id}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    console.log(`Successfully deleted ${oldImages.length} old images and their data`);
    return `Deleted ${oldImages.length} images older than 1 hour`;
  },
});