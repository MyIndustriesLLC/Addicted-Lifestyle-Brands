import {
  type Product,
  type InsertProduct,
  type NFT,
  type InsertNFT,
  type Transaction,
  type InsertTransaction,
  type Customer,
  type InsertCustomer,
  type Wallet,
  type InsertWallet,
  type LinkedWallet,
  type InsertLinkedWallet,
  type ConversionTransaction,
  type InsertConversionTransaction,
  type Employee,
  type InsertEmployee,
} from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  updateProductNftStatus(id: string, status: string): Promise<void>;
  incrementProductSales(id: string): Promise<number>;
  checkInventoryAvailable(id: string): Promise<boolean>;

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

  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<void>;
  deleteCustomer(id: string): Promise<void>;

  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByCustomerId(customerId: string): Promise<Wallet | undefined>;
  getWalletByXrpAddress(xrpAddress: string): Promise<Wallet | undefined>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<void>;
  markSeedPhraseShown(id: string): Promise<void>;

  // Linked Wallet operations
  createLinkedWallet(wallet: InsertLinkedWallet): Promise<LinkedWallet>;
  getLinkedWallet(id: string): Promise<LinkedWallet | undefined>;
  getLinkedWalletsByCustomerId(customerId: string): Promise<LinkedWallet[]>;
  deleteLinkedWallet(id: string): Promise<void>;

  // Conversion Transaction operations
  createConversionTransaction(transaction: InsertConversionTransaction): Promise<ConversionTransaction>;
  getConversionTransaction(id: string): Promise<ConversionTransaction | undefined>;
  getConversionTransactionsByCustomerId(customerId: string): Promise<ConversionTransaction[]>;
  updateConversionTransaction(id: string, updates: Partial<ConversionTransaction>): Promise<void>;

  // Employee operations
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<void>;
  deleteEmployee(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private nfts: Map<string, NFT>;
  private transactions: Map<string, Transaction>;
  private customers: Map<string, Customer>;
  private wallets: Map<string, Wallet>;
  private linkedWallets: Map<string, LinkedWallet>;
  private conversionTransactions: Map<string, ConversionTransaction>;
  private employees: Map<string, Employee>;

  constructor() {
    this.products = new Map();
    this.nfts = new Map();
    this.transactions = new Map();
    this.customers = new Map();
    this.wallets = new Map();
    this.linkedWallets = new Map();
    this.conversionTransactions = new Map();
    this.employees = new Map();
  }

  reset(): void {
    this.products.clear();
    this.nfts.clear();
    this.transactions.clear();
    this.customers.clear();
    this.wallets.clear();
    this.linkedWallets.clear();
    this.conversionTransactions.clear();
    this.employees.clear();
  }

  // Product operations
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct,
      description: insertProduct.description ?? null,
      nftStatus: insertProduct.nftStatus ?? "available",
      salesCount: insertProduct.salesCount ?? "0",
      inventoryLimit: insertProduct.inventoryLimit ?? "500",
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

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      Object.assign(product, updates);
      this.products.set(id, product);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async updateProductNftStatus(id: string, status: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.nftStatus = status;
      this.products.set(id, product);
    }
  }

  async incrementProductSales(id: string): Promise<number> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const currentSales = parseInt(product.salesCount);
    const newSalesCount = currentSales + 1;
    product.salesCount = newSalesCount.toString();
    this.products.set(id, product);
    return newSalesCount;
  }

  async checkInventoryAvailable(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) {
      return false;
    }
    const salesCount = parseInt(product.salesCount);
    const inventoryLimit = parseInt(product.inventoryLimit);
    return salesCount < inventoryLimit;
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
      purchaseNumber: insertTransaction.purchaseNumber ?? null,
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

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      totalPurchases: "0",
      totalSpent: "0",
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      Object.assign(customer, updates);
      this.customers.set(id, customer);
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    this.customers.delete(id);
  }

  // Wallet operations
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      ...insertWallet,
      seedPhraseShown: null,
      id,
      createdAt: new Date()
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByCustomerId(customerId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.customerId === customerId
    );
  }

  async getWalletByXrpAddress(xrpAddress: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.xrpAddress === xrpAddress
    );
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    const wallet = this.wallets.get(id);
    if (wallet) {
      Object.assign(wallet, updates);
      this.wallets.set(id, wallet);
    }
  }

  async markSeedPhraseShown(id: string): Promise<void> {
    const wallet = this.wallets.get(id);
    if (wallet) {
      wallet.seedPhraseShown = new Date();
      this.wallets.set(id, wallet);
    }
  }

  // Linked Wallet operations
  async createLinkedWallet(insertLinkedWallet: InsertLinkedWallet): Promise<LinkedWallet> {
    const id = randomUUID();
    const linkedWallet: LinkedWallet = {
      ...insertLinkedWallet,
      label: insertLinkedWallet.label ?? null,
      id,
      createdAt: new Date()
    };
    this.linkedWallets.set(id, linkedWallet);
    return linkedWallet;
  }

  async getLinkedWallet(id: string): Promise<LinkedWallet | undefined> {
    return this.linkedWallets.get(id);
  }

  async getLinkedWalletsByCustomerId(customerId: string): Promise<LinkedWallet[]> {
    return Array.from(this.linkedWallets.values()).filter(
      (wallet) => wallet.customerId === customerId
    );
  }

  async deleteLinkedWallet(id: string): Promise<void> {
    this.linkedWallets.delete(id);
  }

  // Conversion Transaction operations
  async createConversionTransaction(insertConversion: InsertConversionTransaction): Promise<ConversionTransaction> {
    const id = randomUUID();
    const conversion: ConversionTransaction = {
      ...insertConversion,
      status: insertConversion.status ?? "pending",
      externalTxId: insertConversion.externalTxId ?? null,
      id,
      createdAt: new Date()
    };
    this.conversionTransactions.set(id, conversion);
    return conversion;
  }

  async getConversionTransaction(id: string): Promise<ConversionTransaction | undefined> {
    return this.conversionTransactions.get(id);
  }

  async getConversionTransactionsByCustomerId(customerId: string): Promise<ConversionTransaction[]> {
    return Array.from(this.conversionTransactions.values()).filter(
      (tx) => tx.customerId === customerId
    );
  }

  async updateConversionTransaction(id: string, updates: Partial<ConversionTransaction>): Promise<void> {
    const conversion = this.conversionTransactions.get(id);
    if (conversion) {
      Object.assign(conversion, updates);
      this.conversionTransactions.set(id, conversion);
    }
  }

  // Employee operations
  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      department: insertEmployee.department ?? null,
      id,
      hiredAt: new Date(),
      createdAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
    const employee = this.employees.get(id);
    if (employee) {
      Object.assign(employee, updates);
      this.employees.set(id, employee);
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees.delete(id);
  }
}

export const storage = new MemStorage();
