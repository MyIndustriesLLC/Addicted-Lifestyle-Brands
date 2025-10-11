import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

type NFTStatus = "available" | "minted" | "pending";

interface NFTBadgeProps {
  status: NFTStatus;
}

export function NFTBadge({ status }: NFTBadgeProps) {
  const variants = {
    available: {
      icon: ShieldCheck,
      text: "NFT Ready",
      className: "bg-accent/50 text-accent-foreground border-accent-border",
    },
    minted: {
      icon: CheckCircle2,
      text: "NFT Minted",
      className: "bg-chart-3/20 text-chart-3 border-chart-3/40",
    },
    pending: {
      icon: Clock,
      text: "Minting...",
      className: "bg-chart-4/20 text-chart-4 border-chart-4/40",
    },
  };

  const { icon: Icon, text, className } = variants[status];

  return (
    <Badge variant="outline" className={`gap-1.5 ${className}`} data-testid={`badge-nft-${status}`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}
