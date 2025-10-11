import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NFTBadge } from "./nft-badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  nftStatus: "available" | "minted" | "pending";
  barcodeId?: string;
}

export function ProductCard({ id, name, price, image, nftStatus, barcodeId }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-product-${id}`}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-3 right-3">
          <NFTBadge status={nftStatus} />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-lg mb-1" data-testid={`text-product-name-${id}`}>{name}</h3>
        {barcodeId && (
          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-barcode-${id}`}>
            #{barcodeId}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <div>
          <p className="text-2xl font-display font-bold" data-testid={`text-price-${id}`}>{price} XRP</p>
          <p className="text-xs text-muted-foreground">+ NFT Ownership</p>
        </div>
        <Button size="icon" data-testid={`button-add-to-cart-${id}`}>
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
