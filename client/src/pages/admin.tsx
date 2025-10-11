import { AdminUploadForm } from "@/components/admin-upload-form";
import { StatsCard } from "@/components/stats-card";
import { Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Product, Transaction } from "@shared/schema";

export default function Admin() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const completedTransactions = transactions.filter(t => t.status === "completed").length;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your NFT streetwear inventory</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Products"
            value={products.length}
            icon={Package}
          />
          <StatsCard
            title="Total Sales"
            value={completedTransactions}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Revenue (XRP)"
            value={totalRevenue.toFixed(2)}
            icon={TrendingUp}
          />
          <StatsCard
            title="NFTs Minted"
            value={products.filter(p => p.nftStatus === "minted").length}
            icon={Wallet}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <AdminUploadForm />
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sales yet
                  </p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => {
                    const product = products.find(p => p.id === transaction.productId);
                    const timeAgo = transaction.createdAt 
                      ? new Date(transaction.createdAt).toLocaleString()
                      : "Unknown";

                    return (
                      <div key={transaction.id} className="flex items-start justify-between gap-4 p-3 rounded-md hover-elevate">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" data-testid={`text-sale-product-${transaction.id}`}>
                            {product?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-sale-buyer-${transaction.id}`}>
                            {transaction.buyerWallet.substring(0, 8)}...
                            {transaction.buyerWallet.substring(transaction.buyerWallet.length - 6)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-sale-time-${transaction.id}`}>
                            {timeAgo}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="shrink-0" 
                          data-testid={`badge-sale-price-${transaction.id}`}
                        >
                          {transaction.amount} XRP
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
