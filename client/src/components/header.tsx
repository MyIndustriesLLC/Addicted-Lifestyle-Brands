import { WalletConnectButton } from "./wallet-connect-button";
import { ThemeToggle } from "./theme-toggle";
import { NetworkStatus } from "./network-status";
import { MobileMenu } from "./mobile-menu";
import { ShoppingCart } from "./shopping-cart";
import { Sparkles, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          {/* Mobile Menu - only visible on mobile */}
          <div className="md:hidden">
            <MobileMenu networkConnected={networkStatus?.connected ?? false} />
          </div>

          <Link href="/">
            <div className="flex items-center gap-1.5 sm:gap-2 hover-elevate p-1.5 sm:p-2 rounded-md -m-1.5 sm:-m-2 cursor-pointer">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <h1 className="font-display font-bold text-base sm:text-xl truncate" data-testid="text-app-name">NFT Streetwear</h1>
            </div>
          </Link>

          {/* Desktop Network Status - hidden on mobile */}
          <div className="hidden md:block">
            <NetworkStatus isConnected={networkStatus?.connected ?? false} />
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/feed">
            <div className="inline-block">
              <Button
                variant={location === "/feed" ? "secondary" : "ghost"}
                size="icon"
                data-testid="button-feed"
                className="h-12 w-12"
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </Link>
          <Link href="/admin">
            <div className="inline-block">
              <Button
                variant={location === "/admin" ? "secondary" : "ghost"}
                size="icon"
                data-testid="button-admin"
                className="h-12 w-12"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </Link>
          <ShoppingCart />
          {/* Desktop Theme Toggle - hidden on mobile, available in mobile menu */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
