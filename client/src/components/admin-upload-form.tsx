import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { BarcodeDisplay } from "./barcode-display";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function AdminUploadForm() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBarcode = async () => {
    try {
      const response = await fetch("/api/barcode/generate", { method: "POST" });
      const data = await response.json();
      setBarcodeValue(data.barcodeId);
    } catch (error) {
      const randomId = Math.random().toString(36).substring(2, 12).toUpperCase();
      setBarcodeValue(randomId);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name: productName,
          description: description || null,
          price,
          imageUrl,
          barcodeId: barcodeValue,
        })
      );

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload product");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product uploaded!",
        description: "Your product has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      setProductName("");
      setPrice("");
      setDescription("");
      setBarcodeValue("");
      setImageUrl("");
      setImagePreview("");
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !price || !barcodeValue || !imageUrl) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and generate a barcode",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Upload New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Product Image *</Label>
            <div className="border-2 border-dashed rounded-md p-8 text-center hover-elevate transition-all">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-md" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setImagePreview("");
                      setImageUrl("");
                    }}
                    data-testid="button-remove-image"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label htmlFor="image" className="cursor-pointer block">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  <Input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    data-testid="input-product-image"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Blockchain Tee"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (XRP) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                data-testid="input-product-price"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-product-description"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>NFT Barcode *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateBarcode}
                data-testid="button-generate-barcode"
              >
                Generate Barcode
              </Button>
            </div>
            {barcodeValue && (
              <BarcodeDisplay value={barcodeValue} />
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2" 
            size="lg" 
            disabled={uploadMutation.isPending}
            data-testid="button-upload-product"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Product
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
