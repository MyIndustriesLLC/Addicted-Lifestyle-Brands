import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Users, Settings } from "lucide-react";
import { NetworkStatus } from "./network-status";
import { ThemeToggle } from "./theme-toggle";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface MobileMenuProps {
  networkConnected: boolean;
}

export function MobileMenu({ networkConnected }: MobileMenuProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/feed", label: "Community", icon: Users },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-t pt-4 mt-2">
            <NetworkStatus isConnected={networkConnected} />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
