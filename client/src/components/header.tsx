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
    <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/">
            <div className="flex items-center gap-1.5 sm:gap-2 hover-elevate p-1.5 sm:p-2 rounded-md -m-1.5 sm:-m-2 cursor-pointer">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <h1 className="font-display font-bold text-base sm:text-xl truncate" data-testid="text-app-name">NFT Streetwear</h1>
            </div>
          </Link>
          <div className="hidden sm:block">
            <NetworkStatus isConnected={networkStatus?.connected ?? false} />
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/admin">
            <div className="inline-block">
              <Button 
                variant={location === "/admin" ? "secondary" : "ghost"} 
                size="icon" 
                data-testid="button-admin"
                className="h-11 w-11"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="relative h-11 w-11" data-testid="button-cart">
            <ShoppingCart className="h-5 w-5" />
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              0
            </Badge>
          </Button>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
