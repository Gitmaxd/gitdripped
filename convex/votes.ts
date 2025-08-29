import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const castVote = mutation({
  args: {
    imageId: v.id("images"),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already voted for this image
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_voter_image", (q) =>
        q.eq("voterId", args.voterId).eq("imageId", args.imageId)
      )
      .first();

    if (existingVote) {
      // User already voted, so remove the vote (toggle behavior)
      await ctx.db.delete(existingVote._id);
      
      // Decrement vote count on image
      const image = await ctx.db.get(args.imageId);
      if (image) {
        const currentVotes = image.voteCount || 0;
        await ctx.db.patch(args.imageId, {
          voteCount: Math.max(0, currentVotes - 1)
        });
      }
      
      return { action: "removed", newCount: Math.max(0, (image?.voteCount || 0) - 1) };
    } else {
      // User hasn't voted, so add the vote
      await ctx.db.insert("votes", {
        imageId: args.imageId,
        voterId: args.voterId,
        votedAt: Date.now(),
      });
      
      // Increment vote count on image
      const image = await ctx.db.get(args.imageId);
      if (image) {
        const currentVotes = image.voteCount || 0;
        await ctx.db.patch(args.imageId, {
          voteCount: currentVotes + 1
        });
      }
      
      return { action: "added", newCount: (image?.voteCount || 0) + 1 };
    }
  },
});

export const getUserVotes = query({
  args: {
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_voter", (q) => q.eq("voterId", args.voterId))
      .collect();
    
    // Return array of image IDs that this user has voted for
    return votes.map(vote => vote.imageId);
  },
});

export const getImageVoteCount = query({
  args: {
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    return image?.voteCount || 0;
  },
});

export const getTopVotedImages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    // Get all images with votes, sorted by vote count
    const images = await ctx.db
      .query("images")
      .withIndex("by_vote_count")
      .order("desc")
      .take(limit);
    
    // Generate URLs for the images
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.body),
        voteCount: image.voteCount || 0,
      }))
    );
    
    return imagesWithUrls;
  },
});