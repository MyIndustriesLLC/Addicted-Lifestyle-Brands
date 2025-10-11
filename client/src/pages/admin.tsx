import { AdminUploadForm } from "@/components/admin-upload-form";
import { StatsCard } from "@/components/stats-card";
import { Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_RECENT_SALES = [
  { id: "1", product: "Blockchain Tee", buyer: "rN7n7...4xVBd", price: 25, time: "2 mins ago" },
  { id: "2", product: "Crypto Wave Shirt", buyer: "rM8k3...9pLqX", price: 30, time: "15 mins ago" },
  { id: "3", product: "NFT Limited Edition", buyer: "rP2x5...7tRwY", price: 45, time: "1 hour ago" },
];

export default function Admin() {
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
            value={42}
            icon={Package}
            trend="+12% this month"
          />
          <StatsCard
            title="Total Sales"
            value="1,247"
            icon={ShoppingBag}
            trend="+23% this month"
          />
          <StatsCard
            title="Revenue (XRP)"
            value="38,450"
            icon={TrendingUp}
            trend="+18% this month"
          />
          <StatsCard
            title="NFTs Minted"
            value="1,247"
            icon={Wallet}
            trend="+15% this month"
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
                {MOCK_RECENT_SALES.map((sale) => (
                  <div key={sale.id} className="flex items-start justify-between gap-4 p-3 rounded-md hover-elevate">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-sale-product-${sale.id}`}>{sale.product}</p>
                      <p className="text-xs text-muted-foreground font-mono" data-testid={`text-sale-buyer-${sale.id}`}>
                        {sale.buyer}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-sale-time-${sale.id}`}>
                        {sale.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0" data-testid={`badge-sale-price-${sale.id}`}>
                      {sale.price} XRP
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
