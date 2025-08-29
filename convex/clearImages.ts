import { mutation } from "./_generated/server";

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