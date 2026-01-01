import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Package, UserCog, BarChart3, Heart, Tag, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomersTab } from "@/components/admin/customers-tab";
import { ProductsTab } from "@/components/admin/products-tab";
import { EmployeesTab } from "@/components/admin/employees-tab";
import { MetricsTab } from "@/components/admin/metrics-tab";
import { EngagementTab } from "@/components/admin/engagement-tab";
import { CouponsTab } from "@/components/admin/coupons-tab";
import { OrdersTab } from "@/components/admin/orders-tab";
import type { AuthStatusResponse } from "@/types/api";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: authStatus } = useQuery<AuthStatusResponse>({
    queryKey: ["/api/admin/check"],
  });

  useEffect(() => {
    if (authStatus && !authStatus.authenticated) {
      setLocation("/admin-login");
    }
  }, [authStatus, setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/admin-login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!authStatus?.authenticated) {
    return null;
  }

  return (
    <div className="w-full h-full bg-background">
      <header className="shrink-0 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-display font-bold truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">NFT Streetwear Management</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="button-admin-logout"
            className="shrink-0 min-h-11"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 overflow-y-auto">
        <Tabs defaultValue="metrics" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto">
            <TabsTrigger value="metrics" data-testid="tab-metrics" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="customers" data-testid="tab-customers" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <UserCog className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Employees</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <MetricsTab />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <EngagementTab />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
