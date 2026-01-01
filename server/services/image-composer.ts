import sharp from "sharp";

interface ImageCompositionOptions {
  baseImageUrl: string; // Original product image URL or base64
  qrCodeBuffer: Buffer; // QR code as PNG buffer
  position?: "left_sleeve" | "right_sleeve" | "chest" | "back";
  qrSize?: number; // Size of QR code in pixels
}

class ImageComposer {
  /**
   * Compose QR code onto product image
   * For left sleeve placement on a t-shirt mockup
   */
  async addQRCodeToImage(options: ImageCompositionOptions): Promise<Buffer> {
    const {
      baseImageUrl,
      qrCodeBuffer,
      position = "left_sleeve",
      qrSize = 200,
    } = options;

    try {
      // Load base image (product mockup)
      let baseImage = sharp();

      if (baseImageUrl.startsWith("data:image")) {
        // Handle base64 data URL
        const base64Data = baseImageUrl.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, "base64");
        baseImage = sharp(imageBuffer);
      } else {
        // Handle URL (would need to fetch it first in production)
        // For now, assume it's a file path or buffer
        baseImage = sharp(baseImageUrl);
      }

      // Get base image metadata
      const metadata = await baseImage.metadata();
      const imageWidth = metadata.width || 1000;
      const imageHeight = metadata.height || 1000;

      // Resize QR code
      const resizedQR = await sharp(qrCodeBuffer)
        .resize(qrSize, qrSize)
        .toBuffer();

      // Calculate position based on placement
      let left = 0;
      let top = 0;

      switch (position) {
        case "left_sleeve":
          // Position on left sleeve (approximately 15% from left, 25% from top)
          left = Math.floor(imageWidth * 0.15);
          top = Math.floor(imageHeight * 0.25);
          break;
        case "right_sleeve":
          // Position on right sleeve (approximately 75% from left, 25% from top)
          left = Math.floor(imageWidth * 0.75);
          top = Math.floor(imageHeight * 0.25);
          break;
        case "chest":
          // Center on chest area
          left = Math.floor((imageWidth - qrSize) / 2);
          top = Math.floor(imageHeight * 0.3);
          break;
        case "back":
          // Center on back
          left = Math.floor((imageWidth - qrSize) / 2);
          top = Math.floor(imageHeight * 0.4);
          break;
      }

      // Composite QR code onto base image
      const composedImage = await baseImage
        .composite([
          {
            input: resizedQR,
            top,
            left,
          },
        ])
        .png()
        .toBuffer();

      return composedImage;
    } catch (error) {
      console.error("Failed to compose image:", error);
      throw new Error("Image composition failed");
    }
  }

  /**
   * Create a simple PNG with just the QR code for Printful
   * Printful will handle the placement on their mockups
   */
  async createQRPrintFile(qrCodeBuffer: Buffer, size: number = 1000): Promise<Buffer> {
    try {
      // Create a transparent background and place QR code in center
      const qrImage = await sharp(qrCodeBuffer)
        .resize(size, size)
        .png()
        .toBuffer();

      return qrImage;
    } catch (error) {
      console.error("Failed to create QR print file:", error);
      throw new Error("Print file creation failed");
    }
  }

  /**
   * Convert buffer to base64 data URL
   */
  bufferToDataUrl(buffer: Buffer, mimeType: string = "image/png"): string {
    const base64 = buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }
}

export const imageComposer = new ImageComposer();
