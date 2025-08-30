import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Automatically delete images older than 1 hour
 * Runs every 5 minutes to keep the database clean
 */
crons.interval(
  "delete old images",
  { minutes: 5 }, // Run every 5 minutes
  internal.clearImages.deleteOldImages
);

export default crons;