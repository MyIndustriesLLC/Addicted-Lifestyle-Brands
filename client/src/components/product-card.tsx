import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NFTBadge } from "./nft-badge";
import { ShoppingCart, Lock } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number | string;
  image: string;
  nftStatus: "available" | "minted" | "pending";
  barcodeId?: string;
  salesCount?: number | string;
  inventoryLimit?: number | string;
  levelRequired?: number | string | null;
  customerLevel?: number | string;
  onPurchase?: () => void;
}

export function ProductCard({ id, name, price, image, nftStatus, barcodeId, salesCount = 0, inventoryLimit = 500, levelRequired, customerLevel, onPurchase }: ProductCardProps) {
  const priceValue = typeof price === 'string' ? parseFloat(price) : price;
  const sales = typeof salesCount === 'string' ? parseInt(salesCount) : salesCount;
  const limit = typeof inventoryLimit === 'string' ? parseInt(inventoryLimit) : inventoryLimit;
  const isSoldOut = sales >= limit;
  const remaining = limit - sales;

  const requiredLevel = levelRequired ? (typeof levelRequired === 'string' ? parseInt(levelRequired) : levelRequired) : null;
  const currentLevel = customerLevel ? (typeof customerLevel === 'string' ? parseInt(customerLevel) : customerLevel) : 1;
  const isLevelLocked = requiredLevel !== null && currentLevel < requiredLevel;
  const canPurchase = !isSoldOut && !isLevelLocked;
  
  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-product-${id}`}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {requiredLevel !== null && (
            <Badge variant="secondary" className="gap-1" data-testid={`badge-level-required-${id}`}>
              <Lock className="h-3 w-3" />
              Level {requiredLevel}+
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <NFTBadge status={nftStatus} />
          {isSoldOut && (
            <Badge variant="destructive" data-testid={`badge-sold-out-${id}`}>
              Sold Out
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-display font-semibold text-base sm:text-lg mb-1" data-testid={`text-product-name-${id}`}>{name}</h3>
        {barcodeId && (
          <p className="text-xs text-muted-foreground font-mono" data-testid={`text-barcode-${id}`}>
            #{barcodeId}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-inventory-${id}`}>
          {isSoldOut ? 'Out of stock' : `${remaining} of ${limit} available`}
        </p>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex items-center justify-between gap-2">
        <div>
          <p className="text-xl sm:text-2xl font-display font-bold" data-testid={`text-price-${id}`}>{priceValue} XRP</p>
          <p className="text-xs text-muted-foreground">+ Unique NFT</p>
        </div>
        <Button
          size="icon"
          disabled={!canPurchase}
          onClick={onPurchase}
          data-testid={`button-add-to-cart-${id}`}
          title={isLevelLocked ? `Requires Level ${requiredLevel}` : undefined}
        >
          {isLevelLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
