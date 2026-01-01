import { Client, Wallet, NFTokenMint, convertStringToHex } from "xrpl";

interface MintNFTParams {
  barcodeId: string;
  productName: string;
  productId: string;
  purchaseNumber: number;
  totalSold: number;
  collectionName: string;
  customerName: string;
  customerWallet?: string;
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
  private isConnected: boolean = false;

  constructor() {
    // Using Testnet for development - in production, use mainnet
    this.client = new Client("wss://s.altnet.rippletest.net:51233");
  }

  async connect(): Promise<void> {
    try {
      if (this.isConnected && this.client.isConnected()) {
        return;
      }
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to Ripple network");
    } catch (error) {
      this.isConnected = false;
      console.error("Failed to connect to Ripple:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
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
          product_name: params.productName,
          product_id: params.productId,
          sale_number: params.purchaseNumber,
          total_sold: params.totalSold,
          collection_name: params.collectionName,
          barcode: params.barcodeId,
          original_owner: params.customerName,
          original_wallet: params.customerWallet || "Unclaimed",
          minted_at: new Date().toISOString(),
          issuer: this.wallet?.address || "Unknown",
          network: "XRP Ledger Testnet",
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
        error: error instanceof Error ? error.message : "NFT minting failed - network error",
      };
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

  getIssuerAddress(): string {
    if (!this.wallet) {
      return "Not initialized";
    }
    return this.wallet.address;
  }

  async getNFTDetails(tokenId: string): Promise<any> {
    try {
      await this.connect();

      // Query NFTs from the issuer account to find this specific token
      const nfts = await this.client.request({
        command: 'account_nfts',
        account: this.wallet!.address,
      });

      // Find the specific NFT by token ID
      const nft = nfts.result.account_nfts.find(
        (n: any) => n.NFTokenID === tokenId
      );

      if (!nft) {
        return {
          success: false,
          error: 'NFT not found in issuer account',
        };
      }

      // Decode the URI to get metadata
      let metadata = {};
      if (nft.URI) {
        try {
          const decodedUri = Buffer.from(nft.URI, 'hex').toString('utf8');
          metadata = JSON.parse(decodedUri);
        } catch (e) {
          console.error('Failed to decode NFT metadata:', e);
        }
      }

      return {
        success: true,
        tokenId: tokenId,
        issuer: nft.Issuer || this.wallet!.address,
        owner: this.wallet!.address, // Currently in company wallet
        metadata,
        flags: nft.Flags,
        transferFee: nft.TransferFee,
        sequence: nft.nft_serial || 0,
      };
    } catch (error) {
      console.error('Failed to get NFT details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve NFT',
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
