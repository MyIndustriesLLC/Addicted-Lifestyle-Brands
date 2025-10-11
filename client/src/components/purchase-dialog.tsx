import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface PurchaseDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDialog({ product, open, onOpenChange }: PurchaseDialogProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/products/${product?.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerWallet: walletAddress }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Purchase failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setNftData(data.nft);
      setPurchaseComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      console.error("Purchase error:", error);
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPurchaseComplete(false);
      setWalletAddress("");
      setNftData(null);
    }, 300);
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    purchaseMutation.mutate();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-purchase">
        {purchaseComplete ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-chart-3/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-chart-3" />
            </div>
            <DialogTitle className="text-2xl mb-2">NFT Minted Successfully!</DialogTitle>
            <DialogDescription className="mb-6">
              Your T-shirt NFT has been minted on the Ripple network
            </DialogDescription>
            
            <div className="bg-muted rounded-md p-4 space-y-3 text-left mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                <p className="font-mono text-sm break-all" data-testid="text-token-id">
                  {nftData?.tokenId || "Pending..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <p className="font-mono text-sm break-all" data-testid="text-tx-hash">
                  {nftData?.transactionHash || "Pending..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Owner Wallet</p>
                <p className="font-mono text-sm break-all" data-testid="text-owner-wallet">
                  {walletAddress}
                </p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full" data-testid="button-close-success">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Purchase {product.name}</DialogTitle>
              <DialogDescription>
                Complete your purchase and receive an NFT barcode on the Ripple network
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePurchase} className="space-y-6 mt-4">
              <div className="bg-muted rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-lg font-display font-bold" data-testid="text-purchase-price">
                    {product.price} XRP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NFT Barcode</span>
                  <span className="font-mono text-sm" data-testid="text-purchase-barcode">
                    #{product.barcodeId}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Your Ripple Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="rN7n7otQDd6FczFgLdhmGHoNC1XRGfKP4xVBd"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  className="font-mono text-sm"
                  data-testid="input-wallet-address"
                />
                <p className="text-xs text-muted-foreground">
                  The NFT will be minted and transferred to this address
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={purchaseMutation.isPending || !walletAddress}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Minting NFT...
                  </>
                ) : (
                  "Purchase & Mint NFT"
                )}
              </Button>

              {purchaseMutation.isError && (
                <div className="space-y-3">
                  <p className="text-sm text-destructive text-center" data-testid="text-error-message">
                    {purchaseMutation.error instanceof Error
                      ? purchaseMutation.error.message
                      : "Purchase failed. Please try again."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => purchaseMutation.reset()}
                    data-testid="button-retry-purchase"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
