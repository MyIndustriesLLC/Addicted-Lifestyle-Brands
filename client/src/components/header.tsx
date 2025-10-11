import { WalletConnectButton } from "./wallet-connect-button";
import { ThemeToggle } from "./theme-toggle";
import { NetworkStatus } from "./network-status";
import { ShoppingCart, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();
  
  const { data: networkStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/network/status"],
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate p-2 rounded-md -m-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="font-display font-bold text-xl" data-testid="text-app-name">NFT Streetwear</h1>
            </a>
          </Link>
          <NetworkStatus isConnected={networkStatus?.connected ?? false} />
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button 
              variant={location === "/admin" ? "secondary" : "ghost"} 
              size="icon" 
              data-testid="button-admin"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
            <ShoppingCart className="h-5 w-5" />
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              0
            </Badge>
          </Button>
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
