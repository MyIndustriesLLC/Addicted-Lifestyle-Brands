import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import type { Product, Transaction, Customer } from "@shared/schema";

export function MetricsTab() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalSales = transactions.filter(t => t.status === "completed").length;

  const totalInventory = products.reduce((sum, p) => {
    const available = parseInt(p.inventoryLimit) - parseInt(p.salesCount);
    return sum + available;
  }, 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)} XRP`,
      description: "From completed sales",
      icon: DollarSign,
      testId: "stat-revenue"
    },
    {
      title: "Total Sales",
      value: totalSales.toString(),
      description: "Completed transactions",
      icon: ShoppingCart,
      testId: "stat-sales"
    },
    {
      title: "Products",
      value: products.length.toString(),
      description: `${totalInventory} items available`,
      icon: Package,
      testId: "stat-products"
    },
    {
      title: "Customers",
      value: customers.length.toString(),
      description: "Registered buyers",
      icon: Users,
      testId: "stat-customers"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest NFT purchases and sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Barcode: {transaction.uniqueBarcodeId}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.buyerWallet.slice(0, 20)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{transaction.amount} XRP</p>
                  <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
