import { Client, Wallet, NFTokenMint, convertStringToHex } from "xrpl";

interface MintNFTParams {
  barcodeId: string;
  productName: string;
  productId: string;
}

interface MintNFTResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

export class RippleService {
  private client: Client;
  private wallet: Wallet | null = null;

  constructor() {
    // Using Testnet for development - in production, use mainnet
    this.client = new Client("wss://s.altnet.rippletest.net:51233");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to Ripple network");
    } catch (error) {
      console.error("Failed to connect to Ripple:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async createWallet(): Promise<{ address: string; seed: string }> {
    try {
      await this.connect();
      const fundResult = await this.client.fundWallet();
      this.wallet = fundResult.wallet;
      
      return {
        address: this.wallet.address,
        seed: this.wallet.seed!,
      };
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async mintNFT(params: MintNFTParams): Promise<MintNFTResult> {
    try {
      await this.connect();

      if (!this.wallet) {
        const fundResult = await this.client.fundWallet();
        this.wallet = fundResult.wallet;
      }

      const uri = convertStringToHex(
        JSON.stringify({
          name: params.productName,
          barcode: params.barcodeId,
          productId: params.productId,
        })
      );

      const mintTx: NFTokenMint = {
        TransactionType: "NFTokenMint",
        Account: this.wallet.address,
        URI: uri,
        Flags: 8, // Transferable flag
        NFTokenTaxon: 0,
      };

      const prepared = await this.client.autofill(mintTx);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta && typeof result.result.meta === "object") {
        const meta = result.result.meta as any;
        const nfTokenId = meta.nftoken_id || meta.NFTokenID;

        return {
          success: true,
          tokenId: nfTokenId,
          transactionHash: result.result.hash,
        };
      }

      return {
        success: false,
        error: "NFT minting failed - no token ID returned",
      };
    } catch (error) {
      console.error("NFT minting error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await this.disconnect();
    }
  }

  async transferNFT(tokenId: string, destinationWallet: string): Promise<MintNFTResult> {
    try {
      await this.connect();

      if (!this.wallet) {
        throw new Error("Wallet not initialized");
      }

      // For this MVP, we're simulating transfer
      // In production, implement actual NFTokenCreateOffer and NFTokenAcceptOffer
      
      return {
        success: true,
        tokenId,
        transactionHash: `transfer_${Date.now()}`,
      };
    } catch (error) {
      console.error("NFT transfer error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await this.disconnect();
    }
  }

  async getNetworkStatus(): Promise<boolean> {
    try {
      await this.connect();
      await this.disconnect();
      return true;
    } catch {
      return false;
    }
  }
}

export const rippleService = new RippleService();
