import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerRegisterDialog } from "./customer-register-dialog";
import { CustomerLoginDialog } from "./customer-login-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { CustomerAuthResponse } from "@/types/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CustomerAuthButton() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { toast } = useToast();

  const { data: customerAuth, refetch } = useQuery<CustomerAuthResponse>({
    queryKey: ["/api/customer/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/customer/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
      toast({ title: "Logged out successfully" });
    },
  });

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    refetch();
    toast({ title: "Welcome back!" });
  };

  const handleRegisterSuccess = () => {
    setRegisterOpen(false);
    refetch();
    toast({ title: "Account created successfully!" });
  };

  // Show logout button if authenticated
  if (customerAuth?.authenticated && customerAuth.customer) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5 px-3">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs truncate max-w-[100px]">
            {customerAuth.customer.name || customerAuth.customer.email}
          </span>
          <span className="text-xs text-muted-foreground">
            Lvl {customerAuth.customer.level}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
          title="Logout"
          className="h-10 w-10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show login/register buttons if not authenticated
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setLoginOpen(true)}
          variant="ghost"
          size="sm"
          className="h-10"
        >
          Login
        </Button>
        <Button
          onClick={() => setRegisterOpen(true)}
          className="gap-2 h-10"
        >
          <User className="h-4 w-4" />
          Sign Up
        </Button>
      </div>

      <CustomerLoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      <CustomerRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
