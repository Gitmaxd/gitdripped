import { Progress } from "@/components/ui/progress";

interface AbsurdityMeterProps {
  level: number;
  maxLevel?: number;
  showDescription?: boolean;
}

const LEVEL_LABELS = [
  "😐 Normal",
  "✨ Getting Dripped",
  "💎 Seriously Dripped Out", 
  "🔥 Absolutely Ridiculous",
  "👑 PEAK ABSURDITY!"
];

// Level colors for potential future use
// const LEVEL_COLORS = [
//   "bg-slate-500",
//   "bg-blue-500", 
//   "bg-purple-500",
//   "bg-orange-500",
//   "bg-gradient-to-r from-yellow-400 to-red-500"
// ];

export default function AbsurdityMeter({ 
  level, 
  maxLevel = 5, 
  showDescription = true 
}: AbsurdityMeterProps) {
  const percentage = (level / maxLevel) * 100;
  const labelIndex = Math.min(level - 1, LEVEL_LABELS.length - 1);
  const label = LEVEL_LABELS[Math.max(0, labelIndex)];
  
  return (
    <div className="space-y-2 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      {showDescription && (
        <div className="flex justify-between items-center">
          <span className="text-white/90 font-bold text-sm">🎮 ABSURDITY METER</span>
          <span className="font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{label}</span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={percentage} 
          className={`h-3 bg-gray-800 ${level >= 4 ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:via-orange-500 [&>div]:to-red-500 [&>div]:animate-pulse' : '[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-purple-500'}`}
        />
        {level === 5 && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 animate-pulse opacity-50 rounded-full"></div>
        )}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/80 font-semibold">Level {level}/5</span>
        {level < maxLevel && (
          <span className="text-yellow-400 font-bold animate-bounce">
            ▶ Next: {LEVEL_LABELS[level].split(' ').slice(1).join(' ')}
          </span>
        )}
        {level === 5 && (
          <span className="text-yellow-400 font-bold animate-pulse">
            🏆 MAXIMUM CHAOS ACHIEVED!
          </span>
        )}
      </div>
    </div>
  );
}