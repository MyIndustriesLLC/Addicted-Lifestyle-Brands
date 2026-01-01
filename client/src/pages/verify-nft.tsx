import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Search, Package, User, Calendar, Hash, Shield } from "lucide-react";

interface NFTVerificationResponse {
  success: boolean;
  verified: boolean;
  nft: {
    tokenId: string;
    issuer: string;
    currentOwner: string;
    metadata: {
      product_name: string;
      product_id: string;
      sale_number: number;
      total_sold: number;
      collection_name: string;
      barcode: string;
      original_owner: string;
      original_wallet: string;
      minted_at: string;
      issuer: string;
      network: string;
    };
    sequence: number;
    isTransferable: boolean;
  };
  product?: {
    name: string;
    description: string;
    imageUrl: string;
  };
  transaction?: {
    purchaseDate: string;
    amount: string;
    status: string;
  };
  verifiedAt: string;
}

export default function VerifyNFTPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [manualTokenId, setManualTokenId] = useState("");
  const [searchTokenId, setSearchTokenId] = useState<string | null>(null);

  // Get token ID from URL params or manual input
  const tokenId = params.tokenId || searchTokenId;

  const { data: verification, isLoading, error } = useQuery<NFTVerificationResponse>({
    queryKey: [`/api/nft/verify/${tokenId}`],
    enabled: !!tokenId,
  });

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTokenId.trim()) {
      setLocation(`/verify/${manualTokenId.trim()}`);
    }
  };

  const hasBeenResold = verification?.nft &&
    verification.nft.currentOwner !== verification.nft.issuer &&
    verification.nft.currentOwner !== verification.nft.metadata.original_wallet;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">NFT Verification</h1>
        <p className="text-muted-foreground">
          Verify the authenticity of your NFT Streetwear product
        </p>
      </div>

      {!tokenId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Token ID</CardTitle>
            <CardDescription>
              Scan the QR code on your product or manually enter the NFT Token ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualVerify} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="tokenId" className="sr-only">NFT Token ID</Label>
                <Input
                  id="tokenId"
                  placeholder="Enter NFT Token ID..."
                  value={manualTokenId}
                  onChange={(e) => setManualTokenId(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button type="submit" disabled={!manualTokenId.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && tokenId && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">
              <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Verifying NFT on XRP Ledger...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we verify the authenticity
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && tokenId && (
        <Card className="border-destructive">
          <CardContent className="p-12 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground">
              Unable to verify this NFT. The Token ID may be invalid or the NFT may not exist.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTokenId(null);
                setLocation("/verify");
              }}
            >
              Try Another Token ID
            </Button>
          </CardContent>
        </Card>
      )}

      {verification && verification.verified && (
        <div className="space-y-6">
          <Card className="border-green-500">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-20 w-20 mx-auto mb-4 text-green-500" />
              <h2 className="text-3xl font-bold mb-2">Authentic NFT Verified!</h2>
              <p className="text-lg text-muted-foreground">
                This is a genuine NFT Streetwear product from the official collection
              </p>
              <Badge variant="default" className="mt-4 text-lg px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Verified on XRP Ledger
              </Badge>
            </CardContent>
          </Card>

          {/* Product Information */}
          {verification.product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={verification.product.imageUrl}
                      alt={verification.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{verification.product.name}</h3>
                    <p className="text-muted-foreground mb-4">{verification.product.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Collection</p>
                        <p className="font-semibold">{verification.nft.metadata.collection_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Edition</p>
                        <p className="font-semibold">
                          #{verification.nft.metadata.sale_number} of {verification.nft.metadata.total_sold}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NFT Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                NFT Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Token ID</p>
                <p className="font-mono text-xs sm:text-sm break-all bg-muted p-2 rounded">
                  {verification.nft.tokenId}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Issuer</p>
                  <p className="font-mono text-xs break-all">{verification.nft.issuer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Owner</p>
                  <p className="font-mono text-xs break-all">{verification.nft.currentOwner}</p>
                  {hasBeenResold && (
                    <Badge variant="secondary" className="mt-1">Resold</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Minted</p>
                  <p className="text-sm">
                    {new Date(verification.nft.metadata.minted_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Network</p>
                  <p className="text-sm">{verification.nft.metadata.network}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transferable</p>
                <Badge variant={verification.nft.isTransferable ? "default" : "secondary"}>
                  {verification.nft.isTransferable ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ownership History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Ownership History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{verification.nft.metadata.original_owner}</p>
                  <p className="text-sm text-muted-foreground">Original Owner</p>
                  <p className="text-xs font-mono mt-1">{verification.nft.metadata.original_wallet}</p>
                </div>
                <Badge variant="outline">Original</Badge>
              </div>
              {hasBeenResold && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Current Owner</p>
                    <p className="text-xs font-mono mt-1">{verification.nft.currentOwner}</p>
                  </div>
                  <Badge>Current</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Info */}
          {verification.transaction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Purchase Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Purchase Date</p>
                  <p className="text-sm">
                    {new Date(verification.transaction.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-sm font-semibold">{verification.transaction.amount} XRP</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={verification.transaction.status === "completed" ? "default" : "secondary"}>
                    {verification.transaction.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTokenId(null);
                setLocation("/verify");
              }}
            >
              Verify Another NFT
            </Button>
            <Button onClick={() => setLocation("/")}>
              Browse Products
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
