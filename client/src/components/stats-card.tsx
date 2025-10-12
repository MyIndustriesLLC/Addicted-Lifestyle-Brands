import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1" data-testid="text-stats-title">{title}</p>
            <p className="text-3xl font-display font-bold" data-testid="text-stats-value">{value}</p>
            {trend && (
              <p className="text-xs text-chart-3 mt-1" data-testid="text-stats-trend">
                {trend}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-stats-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
