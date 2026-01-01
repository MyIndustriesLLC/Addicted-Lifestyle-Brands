import { useState, useEffect, useRef } from "react";
import { HeroSection } from "@/components/hero-section";
import { ProductCard } from "@/components/product-card";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { CustomerRegisterDialog } from "@/components/customer-register-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import type { CustomerAuthResponse } from "@/types/api";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const howItWorksRef = useRef<HTMLElement | null>(null);
  const collectionRef = useRef<HTMLElement | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customerAuth, refetch: refetchAuth } = useQuery<CustomerAuthResponse>({
    queryKey: ["/api/customer/me"],
  });

  useEffect(() => {
    // Show registration dialog for first-time visitors
    if (customerAuth && !customerAuth.authenticated) {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        setRegisterDialogOpen(true);
      }
    }
  }, [customerAuth]);

  const handlePurchaseClick = (product: Product) => {
    // Check if user is authenticated before allowing purchase
    if (!customerAuth?.authenticated) {
      setRegisterDialogOpen(true);
      return;
    }
    setSelectedProduct(product);
    setPurchaseDialogOpen(true);
  };

  const handleRegistrationSuccess = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    refetchAuth();
  };

  const handleCloseRegisterDialog = (open: boolean) => {
    setRegisterDialogOpen(open);
    if (!open) {
      localStorage.setItem("hasSeenWelcome", "true");
    }
  };

  const scrollToSection = (element: HTMLElement | null) => {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShopCollectionClick = () => {
    scrollToSection(collectionRef.current);
  };

  const handleLearnMoreClick = () => {
    scrollToSection(howItWorksRef.current);
  };

  return (
    <div className="w-full pb-8 sm:pb-12">
      <HeroSection
        onShopCollection={handleShopCollectionClick}
        onLearnMore={handleLearnMoreClick}
      />

      <section className="py-10 sm:py-14 md:py-20 border-b bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Section 02</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
              Most people hide their addictions. <br className="hidden sm:block" /> We redefine them.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Addicted is built on the belief that obsession isn&apos;t the enemy &mdash; <span className="font-semibold text-foreground">unfocused obsession is.</span>
            </p>
            <p className="text-base sm:text-lg text-muted-foreground space-y-1">
              <span className="block">We exist for the disciplined.</span>
              <span className="block">The builders.</span>
              <span className="block">The ones addicted to becoming better.</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-3xl mx-auto bg-muted/40 border border-border/80 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-lg shadow-primary/10">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Proof Statement</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold">This isn&apos;t just apparel.</h3>
            <p className="text-base sm:text-lg text-muted-foreground">
              Each piece is individually verified with a unique digital mark — linking physical ownership to a permanent record.
            </p>
            <div className="font-mono text-sm sm:text-base text-foreground space-y-1">
              <p>No duplicates.</p>
              <p>No counterfeits.</p>
              <p>No second chances.</p>
            </div>
            <div className="text-base sm:text-lg text-foreground">
              <p>Wear what you&apos;re addicted to.</p>
              <p>Stand behind it.</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={howItWorksRef} className="py-8 sm:py-12 md:py-16 border-b">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Blockchain Verified</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Every T-shirt comes with an immutable NFT on Ripple's secure network
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Instant Ownership</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  NFT automatically transfers to your wallet upon purchase completion
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">Global Marketplace</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Trade, sell, or showcase your NFT streetwear collection worldwide
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section ref={collectionRef} className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Featured Collection</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Each piece comes with a unique barcode NFT, proving authenticity and ownership on the blockchain
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm sm:text-base text-muted-foreground">No products available yet. Visit the admin page to add products.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.imageUrl}
                  nftStatus={product.nftStatus as "available" | "minted" | "pending"}
                  barcodeId={product.barcodeId}
                  salesCount={product.salesCount}
                  inventoryLimit={product.inventoryLimit}
                  levelRequired={product.levelRequired}
                  customerLevel={customerAuth?.customer?.level}
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
        customerWallet={customerAuth?.customer?.walletAddress || undefined}
      />

      <CustomerRegisterDialog
        open={registerDialogOpen}
        onOpenChange={handleCloseRegisterDialog}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
