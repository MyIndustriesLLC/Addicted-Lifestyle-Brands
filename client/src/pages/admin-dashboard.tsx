import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Package, UserCog, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomersTab } from "@/components/admin/customers-tab";
import { ProductsTab } from "@/components/admin/products-tab";
import { EmployeesTab } from "@/components/admin/employees-tab";
import { MetricsTab } from "@/components/admin/metrics-tab";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: authStatus } = useQuery({
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">NFT Streetwear Management</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="metrics" data-testid="tab-metrics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="customers" data-testid="tab-customers">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees">
              <UserCog className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <MetricsTab />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <CustomersTab />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
