import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { Product } from "@shared/schema";

interface PurchaseDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDialog({ product, open, onOpenChange }: PurchaseDialogProps) {
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPurchaseComplete(false);
      setNftData(null);
      setError(null);
      setIsProcessing(false);
    }, 300);
  };

  const handleCreateOrder = async () => {
    try {
      const response = await fetch(`/api/products/${product?.id}/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = await response.json();
      return data.orderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`/api/products/${product?.id}/paypal/capture-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment capture failed");
      }

      const result = await response.json();

      setNftData({
        ...result.nft,
        uniqueBarcodeId: result.uniqueBarcodeId,
        purchaseNumber: result.purchaseNumber
      });
      setPurchaseComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed");
      setIsProcessing(false);
    }
  };

  const handleError = (err: any) => {
    console.error("PayPal error:", err);
    setError("Payment failed. Please try again.");
    setIsProcessing(false);
  };

  if (!product) return null;

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    console.error("PayPal Client ID not configured");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-purchase" className="max-w-[calc(100%-2rem)] sm:max-w-lg">
        {purchaseComplete ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-chart-3/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-chart-3" />
            </div>
            <DialogTitle className="text-2xl mb-2">Purchase Complete!</DialogTitle>
            <DialogDescription className="mb-6">
              Your NFT has been minted to our company wallet
            </DialogDescription>

            <div className="bg-muted rounded-md p-3 sm:p-4 space-y-3 text-left mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unique Barcode ID</p>
                <p className="font-mono text-sm break-all" data-testid="text-unique-barcode">
                  #{nftData?.uniqueBarcodeId || "Pending..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Purchase Number</p>
                <p className="font-mono text-sm" data-testid="text-purchase-number">
                  {nftData?.purchaseNumber ? `${nftData.purchaseNumber} of 500` : "Pending..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">NFT Token ID</p>
                <p className="font-mono text-sm break-all" data-testid="text-token-id">
                  {nftData?.tokenId || "Pending..."}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm" data-testid="text-nft-status">
                  {nftData?.status || "Pending..."}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                    Check Your Email
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    We've sent you instructions to import your NFT into your XRP wallet (XUMM, Crossmark, Gem Wallet).
                    The NFT includes your unique Token ID and barcode information.
                  </p>
                </div>
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
                Pay with PayPal and receive your exclusive NFT
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 mt-4">
              <div className="bg-muted rounded-md p-3 sm:p-4 space-y-2">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-lg sm:text-xl font-display font-bold" data-testid="text-purchase-price">
                    ${parseFloat(product.price).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Product Barcode</span>
                  <span className="font-mono text-sm" data-testid="text-purchase-barcode">
                    #{product.barcodeId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-sm" data-testid="text-purchase-availability">
                    {parseInt(product.inventoryLimit || "500") - parseInt(product.salesCount || "0")} of {product.inventoryLimit || "500"}
                  </span>
                </div>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing your payment and minting NFT...</p>
                </div>
              ) : paypalClientId ? (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: "USD",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "rect",
                      label: "paypal",
                    }}
                    createOrder={handleCreateOrder}
                    onApprove={handleApprove}
                    onError={handleError}
                    disabled={isProcessing}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
                  <p className="text-sm text-destructive">
                    PayPal is not configured. Please contact support.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <p className="text-sm text-destructive text-center" data-testid="text-error-message">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
