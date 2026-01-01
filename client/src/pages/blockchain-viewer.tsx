import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Package,
  Calendar,
  User,
  Hash,
  ShoppingBag,
  Link2,
  Image as ImageIcon
} from "lucide-react";

interface BlockchainData {
  success: boolean;
  verified: boolean;
  purchase: {
    purchase_id: string;
    customer_name: string;
    collection_name: string;
    product_name: string;
    date_of_purchase: string;
  };
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
      original_owner: string;
      original_wallet: string;
      minted_at: string;
      issuer: string;
      network: string;
      purchase_id: string;
      date_of_purchase: string;
      qr_code_image?: string;
    };
    isTransferable: boolean;
  };
  product?: {
    name: string;
    description: string;
    imageUrl: string;
    price: string;
  };
}

export default function BlockchainViewer() {
  const params = useParams();
  const tokenId = params.tokenId;

  const { data, isLoading, error } = useQuery<BlockchainData>({
    queryKey: [`/api/nft/verify/${tokenId}`],
    enabled: !!tokenId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">
              <Hash className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Loading blockchain data...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Verifying on XRP Ledger Testnet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.verified) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 max-w-4xl">
        <Card className="border-destructive">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground">
              Unable to verify this blockchain record. The data may be invalid or not exist on the XRP Ledger.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header - Verified Badge */}
        <Card className="border-green-500">
          <CardContent className="p-6 sm:p-8 text-center">
            <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Blockchain Verified Purchase
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              This purchase is permanently recorded on the XRP Ledger Testnet
            </p>
            <Badge variant="default" className="mt-4 text-sm sm:text-base px-4 py-2">
              <Hash className="h-4 w-4 mr-2" />
              Authentic NFT Streetwear
            </Badge>
          </CardContent>
        </Card>

        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Purchase Information
            </CardTitle>
            <CardDescription>Blockchain-verified transaction details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span>Product</span>
                </div>
                <p className="font-semibold text-base">{data.purchase.product_name}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>Customer</span>
                </div>
                <p className="font-semibold text-base">{data.purchase.customer_name}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Purchase Date</span>
                </div>
                <p className="font-medium">
                  {new Date(data.purchase.date_of_purchase).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(data.purchase.date_of_purchase).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Hash className="h-4 w-4" />
                  <span>Purchase ID</span>
                </div>
                <p className="font-mono text-sm break-all">{data.purchase.purchase_id}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Link2 className="h-4 w-4" />
                <span>Collection</span>
              </div>
              <Badge variant="secondary">{data.purchase.collection_name}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        {data.product && (
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={data.product.imageUrl}
                    alt={data.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{data.product.name}</h3>
                  <p className="text-muted-foreground mb-4">{data.product.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-base">
                      Price: ${data.product.price}
                    </Badge>
                    <Badge variant="secondary">
                      Edition #{data.nft.metadata.sale_number} of {data.nft.metadata.total_sold}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NFT Blockchain Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              NFT Blockchain Details
            </CardTitle>
            <CardDescription>Immutable record on XRP Ledger</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">NFT Token ID</p>
              <p className="font-mono text-xs sm:text-sm break-all bg-muted p-3 rounded">
                {data.nft.tokenId}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Network</p>
                <Badge>{data.nft.metadata.network}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant="default" className="bg-green-500">
                  Minted
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Issuer Wallet</p>
              <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                {data.nft.issuer}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Owner Wallet</p>
              <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                {data.nft.metadata.original_wallet}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Minted At</p>
              <p className="text-sm">
                {new Date(data.nft.metadata.minted_at).toLocaleString()}
              </p>
            </div>

            {data.nft.metadata.qr_code_image && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Embedded QR Code (Stored on Blockchain)</span>
                </div>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src={data.nft.metadata.qr_code_image}
                    alt="Blockchain QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This QR code is permanently stored in the NFT metadata on the blockchain
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              This purchase is permanently and immutably recorded on the XRP Ledger Testnet blockchain.
              The data cannot be altered or deleted by anyone, ensuring authentic proof of ownership.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
