import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Package,
} from "lucide-react";

interface CartItem {
  id: string;
  customerId: string;
  productId: string;
  quantity: string;
  addedAt: Date;
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string;
    levelRequired: string | null;
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface ShippingAddress {
  id?: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

type CheckoutStep = "cart" | "shipping" | "review" | "processing" | "success";

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    stateCode: "",
    countryCode: "US",
    zip: "",
    phone: "",
  });
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading: isLoadingCart } = useQuery<CartData>({
    queryKey: ["/api/cart"],
  });

  const { data: customerAuth } = useQuery({
    queryKey: ["/api/customer/me"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: {
      shippingAddress: ShippingAddress;
      couponCode?: string;
    }) => {
      const res = await fetch("/api/checkout/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Checkout failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setOrderIds(data.orderIds || []);
      setCurrentStep("success");
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order completed!",
        description: `${data.orderIds?.length || 0} NFT(s) minted and orders placed successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
      setCurrentStep("review");
    },
  });

  useEffect(() => {
    if (!customerAuth?.authenticated) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
    }
  }, [customerAuth, setLocation, toast]);

  useEffect(() => {
    if (cartData && cartData.items.length === 0 && currentStep !== "success") {
      setLocation("/");
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add items before checking out.",
        variant: "destructive",
      });
    }
  }, [cartData, currentStep, setLocation, toast]);

  const handleNextStep = () => {
    if (currentStep === "cart") {
      setCurrentStep("shipping");
    } else if (currentStep === "shipping") {
      // Validate shipping address
      if (!shippingAddress.name || !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.stateCode || !shippingAddress.zip) {
        toast({
          title: "Invalid address",
          description: "Please fill in all required shipping fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("review");
    } else if (currentStep === "review") {
      setCurrentStep("processing");
      checkoutMutation.mutate({ shippingAddress });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === "shipping") {
      setCurrentStep("cart");
    } else if (currentStep === "review") {
      setCurrentStep("shipping");
    }
  };

  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subtotal = cartData?.subtotal || 0;
  const total = subtotal;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["cart", "shipping", "review", "processing"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : index < ["cart", "shipping", "review", "processing"].indexOf(currentStep)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step === "cart" && <ShoppingCart className="h-5 w-5" />}
                {step === "shipping" && <MapPin className="h-5 w-5" />}
                {step === "review" && <CreditCard className="h-5 w-5" />}
                {step === "processing" && <Package className="h-5 w-5" />}
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 w-12 sm:w-24 mx-2 ${
                    index < ["cart", "shipping", "review", "processing"].indexOf(currentStep)
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium">Cart</span>
          <span className="text-xs font-medium">Shipping</span>
          <span className="text-xs font-medium">Review</span>
          <span className="text-xs font-medium">Processing</span>
        </div>
      </div>

      {/* Step 1: Cart Review */}
      {currentStep === "cart" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Cart</CardTitle>
            <CardDescription>
              {cartData?.itemCount || 0} {cartData?.itemCount === 1 ? "item" : "items"} in your cart
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartData?.items.map((item) => {
              const quantity = parseInt(item.quantity);
              const price = parseFloat(item.product?.price || "0");
              const itemTotal = price * quantity;

              return (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                    <p className="text-sm text-muted-foreground">${price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${itemTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              <Button className="flex-1" onClick={handleNextStep}>
                Proceed to Shipping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Shipping Address */}
      {currentStep === "shipping" && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Where should we send your NFT streetwear?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address1: e.target.value })
                  }
                  placeholder="123 Main St"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address2: e.target.value })
                  }
                  placeholder="Apt 4B (Optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State *</Label>
                  <Input
                    id="stateCode"
                    value={shippingAddress.stateCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        stateCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="NY"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={shippingAddress.zip}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zip: e.target.value })
                    }
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleNextStep}>
                Continue to Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Order</CardTitle>
            <CardDescription>Please confirm your order details before placing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-2">
                {cartData?.items.map((item) => {
                  const quantity = parseInt(item.quantity);
                  const price = parseFloat(item.product?.price || "0");
                  const itemTotal = price * quantity;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product?.name} × {quantity}
                      </span>
                      <span>${itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold mb-3">Shipping Address</h3>
              <div className="text-sm space-y-1">
                <p>{shippingAddress.name}</p>
                <p>{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.stateCode} {shippingAddress.zip}
                </p>
                {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
              </div>
            </div>

            <Separator />

            {/* Order Total */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">What happens next?</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ NFT will be minted for each item on Ripple network</li>
                <li>✓ QR codes will be generated and printed on products</li>
                <li>✓ Orders will be sent to Printful for printing</li>
                <li>✓ You'll receive email confirmation with NFT details</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleNextStep}>
                Place Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Processing */}
      {currentStep === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Your Order</CardTitle>
            <CardDescription>Please wait while we mint your NFTs and create your orders</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Minting NFTs and placing orders...</p>
            <p className="text-sm text-muted-foreground">
              This may take a minute. Please don't close this page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Success */}
      {currentStep === "success" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Order Completed!
            </CardTitle>
            <CardDescription>Your NFT streetwear order has been successfully placed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Success!</h3>
              <p className="text-muted-foreground mb-4">
                {orderIds.length} NFT{orderIds.length !== 1 ? "s" : ""} minted and order{orderIds.length !== 1 ? "s" : ""} placed
              </p>
              <Badge variant="default" className="text-sm">
                Check your email for order confirmation and NFT details
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">What's Next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>NFTs have been minted on the Ripple network</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>QR codes generated and will be printed on your products</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Orders submitted to Printful for production</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Email sent with NFT Token IDs and blockchain details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>You'll receive shipping updates via email</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setLocation("/")}>
                Continue Shopping
              </Button>
              <Button className="flex-1" onClick={() => setLocation("/feed")}>
                View Community Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
