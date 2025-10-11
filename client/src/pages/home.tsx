import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { ProductCard } from "@/components/product-card";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handlePurchaseClick = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Blockchain Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Every T-shirt comes with an immutable NFT on Ripple's secure network
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Instant Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  NFT automatically transfers to your wallet upon purchase completion
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Global Marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  Trade, sell, or showcase your NFT streetwear collection worldwide
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Featured Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each piece comes with a unique barcode NFT, proving authenticity and ownership on the blockchain
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available yet. Visit the admin page to add products.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.imageUrl}
                  nftStatus={product.nftStatus as "available" | "minted" | "pending"}
                  barcodeId={product.barcodeId}
                  onPurchase={() => handlePurchaseClick(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <PurchaseDialog
        product={selectedProduct}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />
    </div>
  );
}
