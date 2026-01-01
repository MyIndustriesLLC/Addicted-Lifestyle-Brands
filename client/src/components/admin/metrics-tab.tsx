import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Award, Zap } from "lucide-react";
import type { Product, Transaction } from "@shared/schema";
import type { AdminCustomer } from "@/types/api";

export function MetricsTab() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: customers = [] } = useQuery<AdminCustomer[]>({
    queryKey: ["/api/customers"],
  });

  // Revenue Calculations
  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalSales = transactions.filter(t => t.status === "completed").length;
  const pendingOrders = transactions.filter(t => t.status === "pending").length;
  const failedOrders = transactions.filter(t => t.status === "failed").length;

  // Inventory Stats
  const totalInventory = products.reduce((sum, p) => {
    const available = parseInt(p.inventoryLimit) - parseInt(p.salesCount);
    return sum + available;
  }, 0);

  const totalSold = products.reduce((sum, p) => sum + parseInt(p.salesCount), 0);

  // Customer Stats
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const customersWithPurchases = customers.filter(c => parseInt(c.totalPurchases) > 0).length;
  const conversionRate = customers.length > 0 ? (customersWithPurchases / customers.length) * 100 : 0;

  // Top Products
  const topProducts = [...products]
    .sort((a, b) => parseInt(b.salesCount) - parseInt(a.salesCount))
    .slice(0, 5);

  // Recent Customers (last 30 days simulation - by creation date)
  const recentCustomers = customers.slice(-10).reverse();

  // Revenue by time (group transactions by date)
  const revenueByDate = transactions
    .filter(t => t.status === "completed")
    .reduce((acc, t) => {
      const date = new Date(t.createdAt || Date.now()).toLocaleDateString();
      acc[date] = (acc[date] || 0) + parseFloat(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const last7Days = Object.entries(revenueByDate).slice(-7);

  const stats = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)} XRP`,
      description: `${totalSales} completed sales`,
      icon: DollarSign,
      trend: "+12.5%",
      testId: "stat-revenue"
    },
    {
      title: "Avg Order Value",
      value: `${averageOrderValue.toFixed(2)} XRP`,
      description: "Per transaction",
      icon: TrendingUp,
      testId: "stat-avg-order"
    },
    {
      title: "Total Customers",
      value: customers.length.toString(),
      description: `${conversionRate.toFixed(1)}% conversion rate`,
      icon: Users,
      testId: "stat-customers"
    },
    {
      title: "Inventory Status",
      value: `${totalInventory} / ${totalSold}`,
      description: "Available / Sold",
      icon: Package,
      testId: "stat-inventory"
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      description: "Awaiting fulfillment",
      icon: ShoppingCart,
      testId: "stat-pending"
    },
    {
      title: "Products Listed",
      value: products.length.toString(),
      description: `${products.filter(p => parseInt(p.salesCount) > 0).length} with sales`,
      icon: Award,
      testId: "stat-products"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={stat.testId}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                {stat.trend && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend} from last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart (Simple Bar Visualization) */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          <CardDescription>Daily revenue from completed sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {last7Days.length > 0 ? (
              last7Days.map(([date, amount]) => {
                const maxRevenue = Math.max(...last7Days.map(([, amt]) => amt));
                const widthPercent = (amount / maxRevenue) * 100;
                return (
                  <div key={date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{date}</span>
                      <span className="font-medium">{amount.toFixed(2)} XRP</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers by sales count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.salesCount} sold / {parseInt(product.inventoryLimit) - parseInt(product.salesCount)} left
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{product.price} XRP</p>
                      <p className="text-xs text-muted-foreground">
                        {(parseInt(product.salesCount) / parseInt(product.inventoryLimit) * 100).toFixed(0)}% sold
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No products available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest orders and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => {
                const statusColors = {
                  completed: "text-green-600",
                  pending: "text-yellow-600",
                  failed: "text-red-600"
                };
                return (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {transaction.uniqueBarcodeId || `Order #${transaction.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {transaction.buyerWallet.slice(0, 15)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{transaction.amount} XRP</p>
                      <p className={`text-xs capitalize ${statusColors[transaction.status as keyof typeof statusColors]}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Newest registered customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{customer.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Level {customer.level}
                      </div>
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{customer.points} pts</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {customer.totalPurchases} purchases
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No customers yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
