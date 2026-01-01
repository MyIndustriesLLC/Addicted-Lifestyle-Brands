import QRCode from "qrcode";

interface NFTQRData {
  tokenId: string;
  issuer: string;
  walletAddress: string;
}

class QRCodeGenerator {
  /**
   * Generate a QR code for NFT information
   * @param data NFT data to encode in QR code
   * @returns Base64 encoded PNG image data URL
   */
  async generateNFTQRCode(data: NFTQRData): Promise<string> {
    try {
      // Create a verification URL that users can scan to verify authenticity
      const verificationUrl = `${process.env.PUBLIC_URL || 'http://localhost:5001'}/verify/${data.tokenId}`;

      // Generate QR code as data URL (base64 encoded PNG)
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "H", // High error correction
        type: "image/png",
        width: 512, // High resolution for printing
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      throw new Error("QR code generation failed");
    }
  }

  /**
   * Generate a QR code as a buffer for image composition
   * @param data NFT data to encode in QR code
   * @returns Buffer containing PNG image data
   */
  async generateNFTQRCodeBuffer(data: NFTQRData): Promise<Buffer> {
    try {
      // Create a verification URL that users can scan to verify authenticity
      const verificationUrl = `${process.env.PUBLIC_URL || 'http://localhost:5001'}/verify/${data.tokenId}`;

      const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error("Failed to generate QR code buffer:", error);
      throw new Error("QR code generation failed");
    }
  }
}

export const qrCodeGenerator = new QRCodeGenerator();
