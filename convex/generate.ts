import { v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { GoogleGenAI } from "@google/genai";

/**
 * Progressive Absurdity Prompt Configuration with Gender-Aware Styling
 * Each level escalates the ridiculousness for maximum entertainment while maintaining gender-appropriate characteristics
 */
const ESCALATION_PROMPTS = [
  {
    level: 1,
    prompt: "IMPORTANT: Maintain the person's identity, facial features, and gender characteristics throughout. Apply gender-appropriate styling - for women use elegant, delicate jewelry (graceful chains, feminine earrings); for men use bold, masculine accessories (heavy chains, masculine styling). Now add: a subtle diamond chain necklace that suits their gender and style.",
    description: "Basic bling"
  },
  {
    level: 2,
    prompt: "IMPORTANT: Maintain the person's identity and gender characteristics. Apply gender-appropriate styling - for women use elegant jewelry (delicate layered chains, feminine diamond earrings, graceful styling); for men use masculine accessories (heavy diamond chains, bold earrings if appropriate, masculine styling). Now add: a massive diamond chain, diamond grills if smiling, and diamond earrings that match their gender presentation.",
    description: "Getting dripped"
  },
  {
    level: 3,
    prompt: "IMPORTANT: Maintain the person's identity and gender characteristics. Apply gender-appropriate styling - for women use elegant accessories (layered delicate chains, feminine diamond sunglasses, tiara or elegant crown, delicate watches); for men use masculine accessories (heavy layered chains, masculine diamond sunglasses, bold crown, masculine watches). Now add: multiple layered diamond chains, full diamond grills, sunglasses with diamonds, a crown, and diamond watches on both wrists - all styled appropriately for their gender.",
    description: "Seriously dripped out"
  },
  {
    level: 4,
    prompt: "IMPORTANT: Maintain the person's identity and gender characteristics. Apply gender-appropriate styling - for women use maximum elegant accessories (stacked delicate chains, feminine diamond sunglasses, elegant crown/tiara, graceful cape, delicate gloves); for men use maximum masculine accessories (enormous heavy chains, masculine diamond sunglasses, bold crown, powerful cape, masculine gloves). Now add: Maximum bling with enormous stacked diamond chains, full diamond grills, diamond-encrusted sunglasses, a massive crown, cape made of gold chains, diamond gloves, and floating money symbols - all styled for their gender.",
    description: "Absolutely ridiculous"
  },
  {
    level: 5,
    prompt: "ULTIMATE CHAOS MODE: Maintain the person's core identity and gender characteristics while transforming them into a diamond deity. For women: elegant divine transformation with graceful diamond chains for hair, sparkling diamond eyes, golden aura, floating tiara/crown, cape of pure light, elegant diamond armor, delicately orbiting jewelry. For men: powerful divine transformation with bold diamond chains for hair, blazing diamond eyes, golden aura, floating crown, cape of pure light, strong diamond armor, boldly orbiting jewelry. Add explosion of wealth symbols in background that matches their gender presentation.",
    description: "Peak absurdity achieved"
  }
];

/**
 * Get appropriate prompt based on generation count
 * Caps at maximum absurdity level for consistency
 */
function getProgressivePrompt(generationCount: number): { prompt: string; description: string } {
  const index = Math.min(generationCount - 1, ESCALATION_PROMPTS.length - 1);
  return ESCALATION_PROMPTS[Math.max(0, index)];
}

/**
 * Helper function to convert ArrayBuffer to base64 (Convex-compatible)
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert base64 to Uint8Array (Convex-compatible)
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binaryString.length));
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate decorated image using Google's Gemini 2.5 Flash model
 * This is now an internal action that can be scheduled
 */
/**
 * Update image generation status
 */
export const updateImageStatus = mutation({
  args: {
    imageId: v.id("images"),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { imageId, status, error } = args;

    const updateData: any = { generationStatus: status };
    if (error) {
      updateData.generationError = error;
    }

    await ctx.db.patch(imageId, updateData);
  },
});

/**
 * Save generated image
 */
export const saveGeneratedImage = mutation({
  args: {
    storageId: v.id("_storage"),
    originalImageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const { storageId, originalImageId } = args;

    const generatedImageId = await ctx.db.insert("images", {
      body: storageId,
      createdAt: Date.now(),
      isGenerated: true,
      originalImageId: originalImageId,
    });
    return generatedImageId;
  },
});

/**
 * Save progressive generated image with chain metadata
 */
export const saveProgressiveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    originalImageId: v.id("images"),
    generationCount: v.number(),
    rootImageId: v.string(),
    promptUsed: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId, originalImageId, generationCount, rootImageId, promptUsed } = args;

    const generatedImageId = await ctx.db.insert("images", {
      body: storageId,
      createdAt: Date.now(),
      isGenerated: true,
      originalImageId: originalImageId,
      generationCount,
      rootImageId,
      absurdityLevel: Math.min(generationCount, 5),
      previousPrompt: promptUsed,
    });
    return generatedImageId;
  },
});

/**
 * Schedule image generation (call this from your upload functions)
 */
export const scheduleImageGeneration = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { storageId } = args;

    // First, save the original image with pending status
    const originalImageId = await ctx.db.insert("images", {
      body: storageId,
      createdAt: Date.now(),
      isGenerated: false,
      generationStatus: "pending",
    });

    // Schedule the image generation to run immediately
    await ctx.scheduler.runAfter(0, internal.generate.generateImage, {
      storageId,
      originalImageId,
    });

    return originalImageId;
  },
});

/**
 * Schedule progressive image generation with chain tracking
 */
export const scheduleProgressiveGeneration = mutation({
  args: {
    storageId: v.id("_storage"),
    rootImageId: v.optional(v.string()),  // Track the chain root
  },
  handler: async (ctx, args) => {
    const { storageId, rootImageId } = args;
    
    // Determine generation count and root
    let generationCount = 1;
    let actualRootId = rootImageId || null;
    
    if (rootImageId) {
      // Query previous generations in this chain, find the highest absurdity level
      const previousGenerations = await ctx.db
        .query("images")
        .withIndex("by_root_image", q => q.eq("rootImageId", rootImageId))
        .collect();
      
      // Find the highest absurdity level in the chain
      const maxLevel = previousGenerations.reduce((max, img) => 
        Math.max(max, img.absurdityLevel || 0), 0);
      
      generationCount = maxLevel + 1;
    }
    
    // Create pending record with generation tracking
    const originalImageId = await ctx.db.insert("images", {
      body: storageId,
      createdAt: Date.now(),
      isGenerated: false,
      generationStatus: "pending",
      generationCount,
      rootImageId: actualRootId || storageId,  // Self-reference if first
      absurdityLevel: rootImageId ? Math.min(generationCount, 5) : 0, // Original photo is level 0
    });
    
    // Schedule with generation context
    await ctx.scheduler.runAfter(0, internal.generate.generateProgressiveImage, {
      storageId,
      originalImageId,
      generationCount,
      rootImageId: actualRootId || originalImageId,
    });
    
    return originalImageId;
  },
});

export const generateImage = internalAction({
  args: {
    storageId: v.id("_storage"),
    originalImageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const { storageId, originalImageId } = args;

    console.log(
      `[generateImage] Using Gemini 2.5 Flash Image Preview with storageId: ${storageId}, originalImageId: ${originalImageId}`
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY or GOOGLE_GENAI_API_KEY is not set");
      // Mark the original image as having failed generation
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "failed",
        error: "API key not configured",
      });
      return;
    }

    try {
      // Mark the original image as being processed
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "processing",
      });

      const ai = new GoogleGenAI({ apiKey });

      // Get the URL from storage ID
      const baseImageUrl = await ctx.storage.getUrl(storageId);
      if (!baseImageUrl) {
        throw new Error("Failed to get image URL from storage");
      }

      // Load the source image and encode as base64 for inlineData
      const response = await fetch(baseImageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch uploaded image from storage: ${response.statusText}`
        );
      }
      const mimeType = response.headers.get("content-type") || "image/png";
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = arrayBufferToBase64(arrayBuffer);

      // Follow the official SDK example: text + inlineData parts
      const contents = [
        { text: "Add a bust down diamond chain, if the person is smiling, make have diamond grills" },
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ];

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents,
      });

      const candidates = genResponse.candidates ?? [];
      if (candidates.length === 0) {
        throw new Error("Gemini returned no candidates");
      }

      // Find first inlineData part with image data
      let b64Out: string | null = null;
      const parts: Array<any> = candidates[0].content?.parts ?? [];
      for (const part of parts) {
        const inline = part.inlineData as { data?: string } | undefined;
        if (inline?.data) {
          b64Out = inline.data;
          break;
        }
      }
      if (!b64Out) {
        throw new Error("Gemini response did not include image data");
      }

      // Convert base64 to Uint8Array and store in Convex storage
      const imageBuffer = base64ToUint8Array(b64Out);
      const imageBlob = new Blob([imageBuffer as BlobPart], { type: "image/png" });
      const generatedStorageId = await ctx.storage.store(imageBlob);
      const url = await ctx.storage.getUrl(generatedStorageId);

      if (!url) {
        throw new Error("Failed to get storage URL after upload");
      }

      // Save the generated image record
      await ctx.runMutation(api.generate.saveGeneratedImage, {
        storageId: generatedStorageId,
        originalImageId: originalImageId,
      });

      // Mark the original image as completed
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "completed",
      });

      console.log(`[generateImage] Successfully generated image for originalImageId: ${originalImageId}`);

    } catch (error) {
      console.error(`[generateImage] Failed to generate image:`, error);

      // Mark the original image as failed with more detailed error info
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during generation';

      try {
        await ctx.runMutation(api.generate.updateImageStatus, {
          imageId: originalImageId,
          status: "failed",
          error: errorMessage
        });
        console.log(`[generateImage] Marked image ${originalImageId} as failed: ${errorMessage}`);
      } catch (updateError) {
        console.error(`[generateImage] Failed to update image status:`, updateError);
        // Even if status update fails, log the original error
        console.error(`[generateImage] Original generation error: ${errorMessage}`);
      }
    }
  },
});

/**
 * Progressive image generation action with escalating prompts
 */
export const generateProgressiveImage = internalAction({
  args: {
    storageId: v.id("_storage"),
    originalImageId: v.id("images"),
    generationCount: v.number(),
    rootImageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId, originalImageId, generationCount, rootImageId } = args;

    console.log(
      `[generateProgressiveImage] Level ${generationCount} for rootId: ${rootImageId}, originalId: ${originalImageId}`
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "failed",
        error: "API key not configured",
      });
      return;
    }

    try {
      // Update status to processing
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "processing",
      });

      // Get progressive prompt for this level
      const promptConfig = getProgressivePrompt(generationCount);
      const prompt = promptConfig.prompt;
      
      console.log(`[Progressive Generation] Level ${generationCount}: ${promptConfig.description} - ${prompt}`);

      const ai = new GoogleGenAI({ apiKey });

      // Get the URL from storage ID
      const baseImageUrl = await ctx.storage.getUrl(storageId);
      if (!baseImageUrl) {
        throw new Error("Failed to get image URL from storage");
      }

      // Load the source image and encode as base64 for inlineData
      const response = await fetch(baseImageUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch uploaded image from storage: ${response.statusText}`
        );
      }
      const mimeType = response.headers.get("content-type") || "image/png";
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = arrayBufferToBase64(arrayBuffer);

      // Apply progressive prompt
      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ];

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents,
      });

      const candidates = genResponse.candidates ?? [];
      if (candidates.length === 0) {
        throw new Error("Gemini returned no candidates");
      }

      // Find first inlineData part with image data
      let b64Out: string | null = null;
      const parts: Array<any> = candidates[0].content?.parts ?? [];
      for (const part of parts) {
        const inline = part.inlineData as { data?: string } | undefined;
        if (inline?.data) {
          b64Out = inline.data;
          break;
        }
      }
      if (!b64Out) {
        throw new Error("Gemini response did not include image data");
      }

      // Convert base64 to Uint8Array and store in Convex storage
      const imageBuffer = base64ToUint8Array(b64Out);
      const imageBlob = new Blob([imageBuffer as BlobPart], { type: "image/png" });
      const generatedStorageId = await ctx.storage.store(imageBlob);
      const url = await ctx.storage.getUrl(generatedStorageId);

      if (!url) {
        throw new Error("Failed to get storage URL after upload");
      }

      // Save with progressive metadata
      await ctx.runMutation(api.generate.saveProgressiveImage, {
        storageId: generatedStorageId,
        originalImageId,
        generationCount,
        rootImageId,
        promptUsed: prompt,
      });

      // Mark original as completed
      await ctx.runMutation(api.generate.updateImageStatus, {
        imageId: originalImageId,
        status: "completed",
      });

      console.log(`[generateProgressiveImage] Successfully generated level ${generationCount} for rootId: ${rootImageId}`);

    } catch (error) {
      console.error(`[generateProgressiveImage] Failed to generate level ${generationCount}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during progressive generation';

      try {
        await ctx.runMutation(api.generate.updateImageStatus, {
          imageId: originalImageId,
          status: "failed",
          error: errorMessage
        });
        console.log(`[generateProgressiveImage] Marked level ${generationCount} as failed: ${errorMessage}`);
      } catch (updateError) {
        console.error(`[generateProgressiveImage] Failed to update status:`, updateError);
        console.error(`[generateProgressiveImage] Original error: ${errorMessage}`);
      }
    }
  },
});
