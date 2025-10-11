import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";

interface NetworkStatusProps {
  isConnected?: boolean;
}

export function NetworkStatus({ isConnected = true }: NetworkStatusProps) {
  return (
    <Badge 
      variant="outline" 
      className={`gap-1.5 ${isConnected ? 'bg-chart-3/10 text-chart-3 border-chart-3/40' : 'bg-destructive/10 text-destructive border-destructive/40'}`}
      data-testid="badge-network-status"
    >
      <Circle className={`h-2 w-2 fill-current ${isConnected ? 'animate-pulse' : ''}`} />
      {isConnected ? 'Ripple Connected' : 'Disconnected'}
    </Badge>
  );
}
