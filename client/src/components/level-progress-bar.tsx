import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface LevelProgressBarProps {
  points: number | string;
  level: number | string;
  showDetails?: boolean;
}

export function LevelProgressBar({ points, level, showDetails = true }: LevelProgressBarProps) {
  const currentPoints = typeof points === "string" ? parseInt(points) : points;
  const currentLevel = typeof level === "string" ? parseInt(level) : level;

  // 10 points per level
  const pointsInCurrentLevel = currentPoints % 10;
  const progress = (pointsInCurrentLevel / 10) * 100;
  const pointsToNextLevel = 10 - pointsInCurrentLevel;
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
            {pointsInCurrentLevel}/10 points
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
