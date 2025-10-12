import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Verified on Ripple Blockchain</span>
          </div>
          
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-4 sm:mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight" data-testid="text-hero-title">
            Own the Future of Streetwear
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0" data-testid="text-hero-description">
            Every T-shirt comes with a unique NFT barcode on the Ripple network. 
            Prove authenticity, track ownership, and join the blockchain fashion revolution.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="gap-2 w-full sm:w-auto min-h-11" data-testid="button-shop-now">
              Shop Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 backdrop-blur-sm w-full sm:w-auto min-h-11" data-testid="button-learn-more">
              How It Works
            </Button>
          </div>
          
          <div className="mt-8 sm:mt-12 flex items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary" data-testid="text-total-minted">1,247</p>
              <p className="text-muted-foreground text-xs sm:text-sm">NFTs Minted</p>
            </div>
            <div className="h-6 sm:h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary" data-testid="text-total-owners">892</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Unique Owners</p>
            </div>
            <div className="h-6 sm:h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-display font-bold text-primary" data-testid="text-blockchain-verified">100%</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
