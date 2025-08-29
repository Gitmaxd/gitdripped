import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    images: defineTable({
        body: v.string(),
        createdAt: v.number(),
        isGenerated: v.optional(v.boolean()),
        originalImageId: v.optional(v.string()),
        generationStatus: v.optional(v.string()), // "pending", "processing", "completed", "failed"
        generationError: v.optional(v.string()),
        // Progressive Absurdity System fields
        generationCount: v.optional(v.number()),      // Track iteration number (1-5+)
        rootImageId: v.optional(v.string()),          // Original source image for chain
        absurdityLevel: v.optional(v.number()),       // Current absurdity level (1-5)
        previousPrompt: v.optional(v.string()),       // Last prompt used for context
    })
    .index("by_created_at", ["createdAt"])
    .index("by_is_generated", ["isGenerated"])
    .index("by_generation_status", ["generationStatus"])
    .index("by_root_image", ["rootImageId"])       // Index for chain queries
});
