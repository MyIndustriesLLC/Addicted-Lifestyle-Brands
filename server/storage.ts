import { 
  type Product, 
  type InsertProduct, 
  type NFT, 
  type InsertNFT,
  type Transaction,
  type InsertTransaction,
  type Customer,
  type InsertCustomer,
  type Employee,
  type InsertEmployee 
} from "@shared/schema";
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
  getCustomerByWallet(walletAddress: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<void>;
  deleteCustomer(id: string): Promise<void>;

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
  private employees: Map<string, Employee>;

  constructor() {
    this.products = new Map();
    this.nfts = new Map();
    this.transactions = new Map();
    this.customers = new Map();
    this.employees = new Map();
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
      email: insertCustomer.email ?? null,
      name: insertCustomer.name ?? null,
      password: insertCustomer.password ?? null,
      totalPurchases: insertCustomer.totalPurchases ?? "0",
      totalSpent: insertCustomer.totalSpent ?? "0",
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

  async getCustomerByWallet(walletAddress: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.walletAddress === walletAddress
    );
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
