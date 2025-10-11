import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WalletConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnect = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      setWalletAddress("rN7n7...4xVBd");
    } else {
      setWalletAddress("");
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5 px-3" data-testid="badge-wallet-connected">
          <CheckCircle2 className="h-3.5 w-3.5 text-chart-3" />
          <span className="font-mono text-xs">{walletAddress}</span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleConnect}
          data-testid="button-wallet-disconnect"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2" data-testid="button-wallet-connect">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
