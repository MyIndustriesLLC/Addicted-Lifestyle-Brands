import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { BarcodeDisplay } from "./barcode-display";

export function AdminUploadForm() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBarcode = () => {
    const randomId = Math.random().toString(36).substring(2, 15).toUpperCase();
    setBarcodeValue(randomId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Upload New Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image">Product Image</Label>
          <div className="border-2 border-dashed rounded-md p-8 text-center hover-elevate transition-all">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-md" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setImagePreview("")}
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
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., Blockchain Tee"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              data-testid="input-product-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (XRP)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
            <Label>NFT Barcode</Label>
            <Button
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

        <Button className="w-full gap-2" size="lg" data-testid="button-upload-product">
          <Upload className="h-4 w-4" />
          Upload & Mint NFT
        </Button>
      </CardContent>
    </Card>
  );
}
