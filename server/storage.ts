import { 
  type Product, 
  type InsertProduct, 
  type NFT, 
  type InsertNFT,
  type Transaction,
  type InsertTransaction 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  updateProductNftStatus(id: string, status: string): Promise<void>;

  // NFT operations
  createNFT(nft: InsertNFT): Promise<NFT>;
  getNFT(id: string): Promise<NFT | undefined>;
  getNFTByProductId(productId: string): Promise<NFT | undefined>;
  updateNFT(id: string, updates: Partial<NFT>): Promise<void>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private nfts: Map<string, NFT>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.products = new Map();
    this.nfts = new Map();
    this.transactions = new Map();
  }

  // Product operations
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct,
      description: insertProduct.description ?? null,
      nftStatus: insertProduct.nftStatus ?? "available",
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async updateProductNftStatus(id: string, status: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.nftStatus = status;
      this.products.set(id, product);
    }
  }

  // NFT operations
  async createNFT(insertNft: InsertNFT): Promise<NFT> {
    const id = randomUUID();
    const nft: NFT = { 
      ...insertNft,
      status: insertNft.status ?? "pending",
      tokenId: insertNft.tokenId ?? null,
      ownerWallet: insertNft.ownerWallet ?? null,
      transactionHash: insertNft.transactionHash ?? null,
      id,
      mintedAt: null
    };
    this.nfts.set(id, nft);
    return nft;
  }

  async getNFT(id: string): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async getNFTByProductId(productId: string): Promise<NFT | undefined> {
    return Array.from(this.nfts.values()).find(
      (nft) => nft.productId === productId
    );
  }

  async updateNFT(id: string, updates: Partial<NFT>): Promise<void> {
    const nft = this.nfts.get(id);
    if (nft) {
      Object.assign(nft, updates);
      this.nfts.set(id, nft);
    }
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction,
      status: insertTransaction.status ?? "pending",
      nftId: insertTransaction.nftId ?? null,
      txHash: insertTransaction.txHash ?? null,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      Object.assign(transaction, updates);
      this.transactions.set(id, transaction);
    }
  }
}

export const storage = new MemStorage();
