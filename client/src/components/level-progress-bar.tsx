import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface LevelProgressBarProps {
  points: number | string;
  level: number | string;
  showDetails?: boolean;
}

// Helper function to calculate points needed for a specific level
// Matches server-side logic: exponential progression with 50% increase per level
function calculatePointsForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(200 * (Math.pow(1.5, level - 1) - 1));
}

export function LevelProgressBar({ points, level, showDetails = true }: LevelProgressBarProps) {
  const currentPoints = typeof points === "string" ? parseInt(points) : points;
  const currentLevel = typeof level === "string" ? parseInt(level) : level;

  // Exponential progression: each level requires 50% more points than previous
  // Level 1: 0-99 points (100 points needed)
  // Level 2: 100-249 points (150 points needed)
  // Level 3: 250-474 points (225 points needed)
  const pointsForCurrentLevel = calculatePointsForLevel(currentLevel);
  const pointsForNextLevel = calculatePointsForLevel(currentLevel + 1);
  const pointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
  const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel;
  const progress = (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  const pointsToNextLevel = pointsForNextLevel - currentPoints;
  const isMaxLevel = currentLevel >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Level {currentLevel}</span>
          {isMaxLevel && <Trophy className="h-4 w-4 text-yellow-500" />}
        </div>
        {showDetails && !isMaxLevel && (
          <span className="text-muted-foreground">
            {pointsInCurrentLevel}/{pointsNeededForLevel} points
          </span>
        )}
      </div>

      {!isMaxLevel && (
        <>
          <Progress value={progress} className="h-2" />
          {showDetails && (
            <p className="text-xs text-muted-foreground">
              {pointsToNextLevel} {pointsToNextLevel === 1 ? "point" : "points"} to Level{" "}
              {currentLevel + 1}
            </p>
          )}
        </>
      )}

      {isMaxLevel && (
        <Badge variant="default" className="w-full justify-center gap-2">
          <Trophy className="h-4 w-4" />
          MAX LEVEL - Custom T-Shirt Unlocked!
        </Badge>
      )}
    </div>
  );
}
