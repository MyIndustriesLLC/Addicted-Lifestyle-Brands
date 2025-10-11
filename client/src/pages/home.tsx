import { HeroSection } from "@/components/hero-section";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, Globe } from "lucide-react";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Blockchain Tee",
    price: 25,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    nftStatus: "available" as const,
    barcodeId: "BC7X9K2M",
  },
  {
    id: "2",
    name: "Crypto Wave Shirt",
    price: 30,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
    nftStatus: "available" as const,
    barcodeId: "CW3P8L1N",
  },
  {
    id: "3",
    name: "NFT Limited Edition",
    price: 45,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop",
    nftStatus: "minted" as const,
    barcodeId: "NL5R2T9Q",
  },
  {
    id: "4",
    name: "Digital Streetwear",
    price: 28,
    image: "https://images.unsplash.com/photo-1503341338385-b2a8b4ac95d3?w=400&h=400&fit=crop",
    nftStatus: "available" as const,
    barcodeId: "DS4M6K8P",
  },
  {
    id: "5",
    name: "Web3 Classic",
    price: 35,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop",
    nftStatus: "available" as const,
    barcodeId: "W3C7N9L2",
  },
  {
    id: "6",
    name: "Ripple Edition",
    price: 40,
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop",
    nftStatus: "pending" as const,
    barcodeId: "RE8Q4X1M",
  },
];

export default function Home() {
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
