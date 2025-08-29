"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface FakePaywallProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FakePaywall({ isOpen, onClose }: FakePaywallProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-red-900 border-2 shadow-2xl max-w-md">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl font-bold text-red-500 flex items-center justify-center gap-2">
            💀 PAYWALL
          </DialogTitle>
          <DialogDescription className="text-red-300 text-lg">
            Oh no! You&apos;ve hit the dreaded paywall!
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-950/50 border border-red-800 rounded-lg p-6 text-center space-y-4">
          <div className="text-6xl animate-pulse">💀</div>
          <p className="text-red-200 font-medium">
            Access to Level 3 requires premium subscription
          </p>
          <div className="bg-black/50 border border-red-700 rounded p-3">
            <p className="text-red-400 text-sm font-mono">
              ERROR: PREMIUM_CONTENT_BLOCKED
            </p>
            <p className="text-red-300 text-xs mt-1">
              Pay $29.99/month to unlock Level 3+ absurdity
            </p>
          </div>
          
          {/* Fun X Profile Follow Section */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-400 overflow-hidden">
                <img
                  src="/profile.jpg"
                  alt="Creator Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="text-left">
                <p className="text-blue-300 text-sm font-semibold">
                  Hey! While you&apos;re here... 👋
                </p>
                <p className="text-blue-200 text-xs">
                  Follow me for more AI shenanigans!
                </p>
              </div>
            </div>
            <a
              href="https://x.com/gitmaxd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <span>𝕏</span>
              <span>Follow @gitmaxd</span>
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            I will gladly pay you Tuesday!
          </Button>
          <p className="text-center text-red-300/70 text-xs italic">
            * No actual payment required - this is just for laughs! 😄
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}