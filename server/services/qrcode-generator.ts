import QRCode from "qrcode";

interface NFTQRData {
  tokenId: string;
  issuer: string;
  walletAddress: string;
}

interface PurchaseQRData {
  purchase_id: string;
  customer_name: string;
  collection_name: string;
  product_name: string;
  date_of_purchase: string;
  nft_token_id?: string;
  blockchain_explorer_url?: string;
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

  /**
   * Generate a QR code with embedded purchase data for blockchain verification
   * @param data Purchase data to encode in QR code
   * @returns Base64 encoded PNG image data URL
   */
  async generatePurchaseQRCode(data: PurchaseQRData): Promise<string> {
    try {
      // Encode purchase data as JSON in the QR code
      const qrData = JSON.stringify({
        type: "BLOCKCHAIN_PURCHASE",
        purchase_id: data.purchase_id,
        customer_name: data.customer_name,
        collection_name: data.collection_name,
        product_name: data.product_name,
        date_of_purchase: data.date_of_purchase,
        nft_token_id: data.nft_token_id,
        blockchain_explorer_url: data.blockchain_explorer_url || `${process.env.PUBLIC_URL || 'http://localhost:5001'}/blockchain/view/${data.nft_token_id}`,
      });

      // Generate QR code as data URL (base64 encoded PNG)
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "H", // High error correction
        type: "image/png",
        width: 1024, // Higher resolution for blockchain data
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Failed to generate purchase QR code:", error);
      throw new Error("Purchase QR code generation failed");
    }
  }

  /**
   * Generate a QR code with purchase data as a buffer
   * @param data Purchase data to encode in QR code
   * @returns Buffer containing PNG image data
   */
  async generatePurchaseQRCodeBuffer(data: PurchaseQRData): Promise<Buffer> {
    try {
      const qrData = JSON.stringify({
        type: "BLOCKCHAIN_PURCHASE",
        purchase_id: data.purchase_id,
        customer_name: data.customer_name,
        collection_name: data.collection_name,
        product_name: data.product_name,
        date_of_purchase: data.date_of_purchase,
        nft_token_id: data.nft_token_id,
        blockchain_explorer_url: data.blockchain_explorer_url || `${process.env.PUBLIC_URL || 'http://localhost:5001'}/blockchain/view/${data.nft_token_id}`,
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 1024,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error("Failed to generate purchase QR code buffer:", error);
      throw new Error("Purchase QR code generation failed");
    }
  }
}

export const qrCodeGenerator = new QRCodeGenerator();
